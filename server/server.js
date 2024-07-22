const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const uploadRouter = require('./routes/upload');
const { PORT, CLIENT_PATH } = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.static(path.join(CLIENT_PATH)));

// Routes
app.use('/upload', uploadRouter);

// Error handling middleware

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});