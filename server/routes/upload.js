const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { convertShapefileToGeoJSON, convertGeoJSONToWKT } = require('../services/shapefileProcessor');
const { decodeText } = require('../utils/textDecoder');
const config = require('../config');

const router = express.Router();

// Konfigurace multer pro upload souborů
const uploader = multer({
    storage: multer.diskStorage({
        destination: config.UPLOAD_DIR,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            const safeFilename = basename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            cb(null, `${safeFilename}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if(config.SUPPORTED_EXTENSIONS.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Nepodporovaný typ souboru'), false);
        }
    },
    limits: {
        fileSize: config.MAX_FILE_SIZE
    }
});

// Funkce pro mazání souborů
async function deleteFiles(files) {
    for (const file of files) {
        try {
            await fs.unlink(file.path);
            console.log(`Deleted file: ${file.path}`);
        } catch (error) {
            console.error(`Error deleting file ${file.path}:`, error);
        }
    }
}

// POST route pro upload
router.post('/', uploader.array('shpFiles', config.MAX_FILES), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nebyly nahrány žádné soubory.' });
    }

    const shpFile = req.files.find(file => path.extname(file.originalname).toLowerCase() === '.shp');
    const dbfFile = req.files.find(file => path.extname(file.originalname).toLowerCase() === '.dbf');
    const prjFile = req.files.find(file => path.extname(file.originalname).toLowerCase() === '.prj');
    const cpgFile = req.files.find(file => path.extname(file.originalname).toLowerCase() === '.cpg');

    if (!shpFile || !dbfFile) {
        await deleteFiles(req.files);
        return res.status(400).json({ error: 'Missing required .shp or .dbf file.' });
    }

    let warning = null;
    if (!prjFile || !cpgFile) {
        warning = 'Některé volitelné soubory chybí. Kodování nebo souřadnicový systém mohou být nastaveny na výchozí hodnoty.';
    }

    if (req.files.length > 4) {
        warning = (warning ? warning + ' ' : '') + 'Byly nahrány nadbytečné soubory, které nebudou použity.';
    }

    try {
        const results = [];
        const shpPath = shpFile.path;
        const fileName = decodeText(shpFile.originalname);

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

        // Mazání souborů po zpracování
        await deleteFiles(req.files);

        res.json({
            fileName: fileName,
            epsg,
            attributes,
            features,
            warning,
            features: features.map((feature, index) => ({
                label: feature.properties.label || `Feature ${index + 1}`,
                wkt: wkt[index],
                properties: feature.properties
            })),
            uploadedFiles: {
                shp: !!shpFile,
                dbf: !!dbfFile,
                prj: !!prjFile,
                cpg: !!cpgFile
            }
        });
    } catch (error) {
        console.error('Error processing files:', error);
        // V případě chyby také smažeme nahrané soubory
        await deleteFiles(req.files);
        res.status(500).send('Error processing files.');
    }
}, (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: `Soubor je příliš velký. Maximální povolená velikost je ${config.MAX_FILE_SIZE / (1024 * 1024)} MB.` });
        }
    }
    // Zpracování ostatních chyb
    res.status(500).json({ error: 'Při nahrávání souboru došlo k chybě.' });
});

module.exports = router;