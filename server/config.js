// config.js

const path = require('path');

module.exports = {
    // Server configuration
    PORT: process.env.PORT || 3005,
    
    // File upload configuration
    UPLOAD_DIR: path.join(__dirname, 'uploads'),
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB
    MAX_FILES: 10,

    // Supported file types
    SUPPORTED_EXTENSIONS: ['.shp', '.dbf', '.prj', '.cpg'],

    // Default encoding
    DEFAULT_ENCODING: 'utf-8',

    // EPSG codes
    EPSG_CODES: {
        S_JTSK: '5514',
        WGS_84: '4326'
    },

    // Logging configuration
    LOG_FORMAT: 'combined',

    // Client application path
    CLIENT_PATH: path.join(__dirname, '../client'),

    // API endpoints
    API_ENDPOINTS: {
        UPLOAD: '/upload'
    }
};