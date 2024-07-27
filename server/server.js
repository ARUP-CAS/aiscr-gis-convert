const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs').promises;
const uploadRouter = require('./routes/upload');
const { PORT, CLIENT_PATH, UPLOAD_DIR } = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.static(path.join(CLIENT_PATH)));

// Routes
app.use('/upload', uploadRouter);

// Cron job pro mazání starých souborů
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup of old files');
    try {
        const files = await fs.readdir(UPLOAD_DIR);
        const now = Date.now();
        for (const file of files) {
            const filePath = path.join(UPLOAD_DIR, file);
            const stats = await fs.stat(filePath);
            if (now - stats.mtime.getTime() > 4 * 60 * 60 * 1000) {  // Starší než 1 hodina
                await fs.unlink(filePath);
                console.log(`Deleted old file: ${file}`);
            }
        }
    } catch (error) {
        console.error('Error during file cleanup:', error);
    }
});

// Error handling middleware

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});