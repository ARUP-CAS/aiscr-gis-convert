const express = require('express');
const multer = require('multer');
const path = require('path');
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
            cb(new Error('Unsupported file type'), false);
        }
    }
});

// POST route pro upload
router.post('/', uploader.array('shpFiles', config.MAX_FILES), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        const results = [];
        for (const file of req.files) {
            if (path.extname(file.originalname) === '.shp') {
                const shpPath = file.path;
                const fileName = decodeText(file.originalname);

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

module.exports = router;