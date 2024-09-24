const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { processDXF } = require('../services/dxfProcessor');
const { decodeText } = require('../utils/textDecoder');
const config = require('../config');

const router = express.Router();

// Konfigurace multer pro upload DXF souborů
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
        if (ext === '.dxf') {
            cb(null, true);
        } else {
            cb(new Error('Nepodporovaný typ souboru. Pouze DXF soubory jsou povoleny.'), false);
        }
    },
    limits: {
        fileSize: config.MAX_FILE_SIZE
    }
});

// Funkce pro mazání souborů
async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
    } catch (error) {
        console.error('Error deleting file %s:', filePath, error);
    }
}

// POST route pro upload DXF
router.post('/', uploader.single('dxfFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nebyl nahrán žádný DXF soubor.' });
    }

    try {
        const result = await processDXF(req.file.path);
        const fileName = decodeText(req.file.originalname);
        
        const response = {
            fileName,
            fileSize: req.file.size,
            uploadTime: new Date().toISOString(),
            epsgInfo: result.epsgInfo,
            features: result.features
        };

        // Mazání souboru po zpracování
        await deleteFile(req.file.path);

        res.json(response);
    } catch (error) {
        console.error('Error processing DXF file:', error);
        await deleteFile(req.file.path);
        res.status(500).json({ error: 'Chyba při zpracování souboru: ' + error.message });
    }
});

module.exports = router;