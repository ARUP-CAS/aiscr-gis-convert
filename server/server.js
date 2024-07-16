const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const shapefile = require('shapefile');
const TerraformerWKT = require('terraformer-wkt-parser');
const proj4 = require('proj4');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, '../client'))); // Serve static files

// Konfigurace multer pro ukládání nahrávaných souborů
const uploader = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, 'uploads'), // Cílový adresář pro nahrávané soubory
        filename: (req, file, cb) => {
            // Generování bezpečného názvu souboru
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            const safeFilename = basename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            cb(null, `${safeFilename}${ext}`);
        }
    })
});

// Funkce pro načtení shapefile a konverzi na GeoJSON
async function convertShapefileToGeoJSON(shpPath) {
    console.log('Converting shapefile to GeoJSON:', shpPath);
    try {
        const source = await shapefile.open(shpPath);
        const features = [];
        let result;
        while (!(result = await source.read()).done) {
            features.push(result.value);
        }
        
        // Čtení PRJ souboru
        const prjPath = shpPath.replace('.shp', '.prj');
        let epsg = null;
        try {
            const prjContent = await fs.readFile(prjPath, 'utf8');
            epsg = getEPSGFromPrj(prjContent);
        } catch (error) {
            console.warn('Unable to read PRJ file:', error);
        }

        // Získání názvů atributů
        const attributes = features.length > 0 ? Object.keys(features[0].properties) : [];

        return { features, epsg, attributes };
    } catch (error) {
        console.error(`Error converting shapefile to GeoJSON for file ${shpPath}:`, error);
        throw error;
    }
}

// Pomocná funkce pro získání EPSG kódu z PRJ souboru
function getEPSGFromPrj(prjContent) {
    if (prjContent.includes('S-JTSK') || prjContent.includes('Krovak')) {
        return '5514';
    } else if (prjContent.includes('WGS 84') || prjContent.includes('WGS_1984')) {
        return '4326';
    }
    
    // Pokud nenajdeme známý EPSG kód, vrátíme null
    console.warn('Unknown coordinate system in PRJ file');
    return null;
}

// Funkce pro konverzi GeoJSON na WKT
function convertGeoJSONToWKT(geojson) {
    return geojson.map(feature => TerraformerWKT.convert(feature.geometry));
}

// Endpoint pro nahrávání souborů
app.post('/upload', uploader.array('shpFiles', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        const results = [];
        for (const file of req.files) {
            if (path.extname(file.originalname) === '.shp') {
                const shpPath = file.path;
                const fileName = path.basename(file.originalname, '.shp');

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

// Middleware pro zpracování chyb
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Serve React build
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
