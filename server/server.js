const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const shapefile = require('shapefile');
const TerraformerWKT = require('terraformer-wkt-parser');
const fs = require('fs').promises;
const iconv = require('iconv-lite');
const dbf = require('dbf');

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, '../client')));

function decodeText(input, encoding = 'utf-8') {
    if (Buffer.isBuffer(input)) {
        return iconv.decode(input, encoding);
    } else if (typeof input === 'string') {
        // Zkusíme různé kombinace kódování
        const attempts = [
            () => input, // původní řetězec
            () => iconv.decode(Buffer.from(input, 'binary'), encoding),
            () => iconv.decode(Buffer.from(input, 'utf-8'), 'cp1250'),
            () => iconv.decode(Buffer.from(input, 'binary'), 'cp1250'),
            () => iconv.decode(Buffer.from(input, 'utf-8'), 'iso-8859-2'),
            () => iconv.decode(Buffer.from(input, 'binary'), 'iso-8859-2')
        ];

        for (const attempt of attempts) {
            const result = attempt();
            if (/[ěščřžýáíé]/.test(result)) {
                return result; // Vrátíme první výsledek, který obsahuje české znaky
            }
        }
    }
    return input; // Pokud nic nefunguje, vrátíme původní vstup
}

const uploader = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, 'uploads'),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            const safeFilename = basename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            cb(null, `${safeFilename}${ext}`);
        }
    })
});

async function convertShapefileToGeoJSON(shpPath) {
    try {
        const source = await shapefile.open(shpPath);
        const features = [];
        let result;

        const cpgPath = shpPath.replace('.shp', '.cpg');
        let encoding = 'utf-8';
        try {
            encoding = await fs.readFile(cpgPath, 'utf8');
            //console.log("Detected encoding from .cpg file:", encoding);
        } catch (error) {
            console.warn('No .cpg file found, using default UTF-8 encoding');
        }

        while (!(result = await source.read()).done) {
            const originalNazev = result.value.properties.nazev;
            // console.log("Original nazev:", originalNazev);
            // console.log("Decoded nazev:", decodeText(originalNazev));

            const decodedProperties = Object.fromEntries(
                Object.entries(result.value.properties).map(([key, value]) => [
                    key,
                    typeof value === 'string' ? decodeText(value) : value
                ])
            );

            features.push({
                ...result.value,
                properties: decodedProperties
            });
        }

        const epsg = await getEPSG(shpPath);

        const attributes = features.length > 0 ? Object.keys(features[0].properties) : [];

        return { features, epsg, attributes };
    } catch (error) {
        console.error(`Error converting shapefile to GeoJSON for file ${shpPath}:`, error);
        throw error;
    }
}

// Funkce pro získání EPSG kódu z obsahu PRJ souboru
async function getEPSG(shpPath) {
    const prjPath = shpPath.replace('.shp', '.prj');
    let epsg = null;
    try {
        const prjContent = await fs.readFile(prjPath, 'utf8');
        epsg = getEPSGFromPrj(prjContent);
    } catch (error) {
        console.warn('Unable to read PRJ file:', error);
    }
    return epsg;
}

function getEPSGFromPrj(prjContent) {
    if (prjContent.includes('S-JTSK') || prjContent.includes('Krovak')) {
        return '5514';
    } else if (prjContent.includes('WGS 84') || prjContent.includes('WGS_1984')) {
        return '4326';
    }
    console.warn('Unknown coordinate system in PRJ file');
    return null;
}

function convertGeoJSONToWKT(geojson) {
    return geojson.map(feature => TerraformerWKT.convert(feature.geometry));
}

async function testShapefileOpen(shpPath) {
    console.log("Testing shapefile open for:", shpPath);

    try {
        // Test otevření celého shapefile (SHP + DBF)
        const source = await shapefile.open(shpPath, undefined, { encoding: 'windows-1250' });
        console.log("Shapefile opened successfully");

        // Čtení prvních několika záznamů
        for (let i = 0; i < 3; i++) {
            const result = await source.read();
            if (result.done) break;
            console.log(`Record ${i + 1}:`, result.value);
        }

        // Test otevření samotného DBF souboru
        const dbfPath = shpPath.replace('.shp', '.dbf');
        const dbfSource = await shapefile.openDbf(dbfPath, { encoding: 'windows-1250' });
        console.log("DBF file opened successfully");

        // Čtení prvních několika záznamů z DBF s dekódováním
        for (let i = 0; i < 3; i++) {
            const result = await dbfSource.read();
            if (result.done) break;

            // Dekódování českých znaků
            const decodedProperties = {};
            for (let key in result.value) {
                if (typeof result.value[key] === 'string') {
                    decodedProperties[key] = iconv.decode(Buffer.from(result.value[key], 'binary'), 'windows-1250');
                } else {
                    decodedProperties[key] = result.value[key];
                }
            }
            
            console.log(`DBF Record ${i + 1}:`, decodedProperties);
        }

        // Získání informací o souborech
        const shpInfo = await fs.stat(shpPath);
        const dbfInfo = await fs.stat(dbfPath);
        console.log("SHP file size:", shpInfo.size, "bytes");
        console.log("DBF file size:", dbfInfo.size, "bytes");

    } catch (error) {
        console.error("Error testing shapefile open:", error);
    }
}


app.post('/upload', uploader.array('shpFiles', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        const results = [];
        for (const file of req.files) {
            if (path.extname(file.originalname) === '.shp') {

                const shpPath = file.path;
                const fileName = decodeText(file.originalname);

                // Volání testovací funkce
                await testShapefileOpen(shpPath);

                const { features, epsg, attributes } = await convertShapefileToGeoJSON(shpPath);
                const wkt = convertGeoJSONToWKT(features);

                results.push({
                    fileName,
                    epsg,
                    attributes,
                    features: features.map((feature, index) => ({
                        label: feature.properties.label || `Feature ${index + 1}`,
                        wkt: wkt[index],
                        properties: feature.properties
                    }))
                });
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).send('Error processing files.');
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});