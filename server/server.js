const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const shapefile = require('shapefile');
const TerraformerWKT = require('terraformer-wkt-parser');

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
        return features;
    } catch (error) {
        console.error(`Error converting shapefile to GeoJSON for file ${shpPath}:`, error);
        throw error;
    }
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
        const wktResults = [];
        const individualPolygons = [];
        for (const file of req.files) {
            if (path.extname(file.originalname) === '.shp') {
                const shpPath = file.path;

                const geojson = await convertShapefileToGeoJSON(shpPath);
                const wkt = convertGeoJSONToWKT(geojson);
                wktResults.push(wkt);

                // Přidáme názvy k jednotlivým polygonům
                individualPolygons.push(...geojson.map((feature, index) => ({
                    wkt: TerraformerWKT.convert(feature.geometry),
                    name: feature.properties.nazev || `Polygon ${index + 1}`
                })));
            }
        }

        // Odpověď s WKT daty a jednotlivými polygony včetně názvů
        res.json({
            fullWkt: wktResults.flat().join('\n'),
            polygons: individualPolygons
        });
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
