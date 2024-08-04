import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '../config';

export const validateFileSize = (file) => {
    return file.size <= MAX_FILE_SIZE;
};

export const validateFileType = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    return [...SUPPORTED_EXTENSIONS.required, ...SUPPORTED_EXTENSIONS.optional].includes(extension);
};

export const groupFilesByDataset = (files) => {
    const datasets = {};
    files.forEach(file => {
        const fileName = file.name.toLowerCase();
        const lastDotIndex = fileName.lastIndexOf('.');
        const baseName = fileName.substring(0, lastDotIndex);
        const extension = fileName.substring(lastDotIndex);
        if (!datasets[baseName]) {
            datasets[baseName] = new Set();
        }
        datasets[baseName].add(extension);
    });
    return datasets;
};

export const checkDatasetCompleteness = (dataset) => {
    return SUPPORTED_EXTENSIONS.required.every(ext => dataset.has(ext));
};