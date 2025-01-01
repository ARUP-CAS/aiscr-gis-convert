const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { processGPX } = require('../services/gpxProcessor');
const { decodeText } = require('../utils/textDecoder');
const config = require('../config');

const router = express.Router();

// Konfigurace Multer pro nahrávání GPX souborů
const uploader = multer({
    storage: multer.diskStorage({
        destination: config.UPLOAD_DIR, // Adresář pro ukládání dočasných souborů
        filename: (req, file, cb) => {
            // Generování bezpečného názvu souboru
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            const safeFilename = basename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            cb(null, `${safeFilename}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Filtr pro povolení pouze GPX souborů
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.gpx') {
            cb(null, true);
        } else {
            cb(new Error('Nepodporovaný typ souboru. Pouze GPX soubory jsou povoleny.'), false);
        }
    },
    limits: {
        fileSize: config.MAX_FILE_SIZE // Maximální velikost souboru
    }
});

// Funkce pro mazání dočasných souborů
async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }
}

// POST endpoint pro nahrávání GPX souborů
router.post('/', uploader.single('gpxFile'), async (req, res) => {
    if (!req.file) {
        // Zpracování situace, kdy nebyl nahrán žádný soubor
        return res.status(400).json({ error: 'Nebyl nahrán žádný GPX soubor.' });
    }

    try {
        // Zpracování GPX souboru
        const result = await processGPX(req.file.path);
        const fileName = decodeText(req.file.originalname);

        // Příprava odpovědi obsahující zpracované informace
        const response = {
            fileName,
            fileSize: req.file.size,
            uploadTime: new Date().toISOString(),
            epsgInfo: result.epsgInfo, // Informace o EPSG z GPX
            features: result.features // Získané prvky z GPX
        };

        // Mazání souboru po úspěšném zpracování
        await deleteFile(req.file.path);

        res.json(response); // Odeslání odpovědi klientovi
    } catch (error) {
        console.error('Error processing GPX file:', error);

        // Mazání souboru při chybě
        await deleteFile(req.file.path);
        res.status(500).json({ error: 'Chyba při zpracování souboru: ' + error.message });
    }
});

module.exports = router;
