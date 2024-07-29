import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import FileUploadError from './FileUploadError';
import FileUploadSelection from './FileUploadSelection';

const FileUpload = forwardRef(({ setShapefileData, onReset }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [errors, setErrors] = useState(null);
    const [completeDatasets, setCompleteDatasets] = useState([]);
    const fileInputRef = useRef(null);

    const requiredExtensions = ['.shp', '.dbf'];
    const optionalExtensions = ['.prj', '.cpg'];
    const allSupportedExtensions = [...requiredExtensions, ...optionalExtensions];

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        console.log('Files selected:', files.map(f => f.name));
        setSelectedFiles(files);
        setErrors(null);
        setCompleteDatasets([]);
        onReset(); // Reset stavu v nadřazené komponentě
    };

    const uploadFiles = useCallback(async (datasetName, datasetFiles) => {
        console.log('uploadFiles called with:', datasetName, datasetFiles);
        setIsLoading(true);
        setErrors(null);

        if (!datasetFiles || datasetFiles.length === 0) {
            console.error('No files to upload');
            setErrors({ 'Chyba': ['Nebyly vybrány žádné soubory pro nahrání'] });
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        datasetFiles.forEach((file) => {
            formData.append('shpFiles', file);
        });

        try {
            console.log('Sending fetch request to:', `${process.env.REACT_APP_API_URL}/upload`);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json();
            console.log('Received data from server:', data);
            setShapefileData(data);
        } catch (error) {
            console.error('Error uploading file:', error);
            setErrors({ 'Chyba serveru': ['Zkuste to prosím znovu'] });
        } finally {
            setIsLoading(false);
            setSelectedFiles([]);
            setCompleteDatasets([]);
        }
    }, [setShapefileData]);

    const handleFileUpload = useCallback(async () => {
        console.log('handleFileUpload called');
        if (isLoading) {
            console.log('Upload already in progress, skipping');
            return;
        }
    
        setIsLoading(true);
        setErrors(null);
    
        const datasets = {};
        selectedFiles.forEach(file => {
            const fileName = file.name.toLowerCase();
            const lastDotIndex = fileName.lastIndexOf('.');
            const baseName = fileName.substring(0, lastDotIndex);
            const extension = fileName.substring(lastDotIndex);
            if (!datasets[baseName]) {
                datasets[baseName] = new Set();
            }
            datasets[baseName].add(extension);
        });
    
        console.log('Datasets:', datasets);
    
        const incompleteDatasets = {};
        const complete = [];
        Object.entries(datasets).forEach(([baseName, extensions]) => {
            const missingFiles = requiredExtensions.filter(ext => !extensions.has(ext));
            if (missingFiles.length > 0) {
                incompleteDatasets[baseName] = missingFiles;
            } else {
                complete.push(baseName);
            }
        });
    
        console.log('Complete datasets:', complete);
        console.log('Incomplete datasets:', incompleteDatasets);
    
        if (complete.length === 0) {
            console.log('No complete datasets found');
            setErrors(incompleteDatasets);
            setIsLoading(false);
            return;
        }
    
        if (complete.length === 1) {
            console.log('One complete dataset found, uploading...');
            const datasetName = complete[0];
            const datasetFiles = selectedFiles.filter(file =>
                file.name.toLowerCase().startsWith(datasetName.toLowerCase())
            );
            await uploadFiles(datasetName, datasetFiles);
        } else {
            console.log('Multiple complete datasets found, waiting for user selection');
            setCompleteDatasets(complete);
        }
        
        setIsLoading(false);
    }, [isLoading, selectedFiles, requiredExtensions, uploadFiles]);

    useEffect(() => {
        console.log('useEffect triggered', { selectedFiles: selectedFiles.length, isLoading, completeDatasets: completeDatasets.length });
        if (selectedFiles.length > 0 && !isLoading && completeDatasets.length === 0) {
            handleFileUpload();
        }
    }, [selectedFiles, handleFileUpload, isLoading, completeDatasets]);

    const handleSelectDataset = (datasetName) => {
        console.log('handleSelectDataset called with:', datasetName);
        const datasetFiles = selectedFiles.filter(file =>
            file.name.toLowerCase().startsWith(datasetName.toLowerCase())
        );
    
        console.log('Filtered datasetFiles:', datasetFiles);
    
        const hasRequiredFiles = requiredExtensions.every(ext =>
            datasetFiles.some(file => file.name.toLowerCase().endsWith(ext))
        );
    
        console.log('hasRequiredFiles:', hasRequiredFiles);
    
        if (!hasRequiredFiles) {
            const missingFiles = requiredExtensions.filter(ext =>
                !datasetFiles.some(file => file.name.toLowerCase().endsWith(ext))
            );
            console.log('Missing files:', missingFiles);
            setErrors({
                [datasetName]: missingFiles
            });
            return;
        }
    
        console.log('Calling uploadFiles with:', datasetName, datasetFiles);
        uploadFiles(datasetName, datasetFiles);
        setCompleteDatasets([]); // Reset completeDatasets after selection
    };

    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    useImperativeHandle(ref, () => ({
        openFileDialog
    }));

    return (
        <div>
            <Form.Group controlId="formFile">
                <Form.Label>
                    Vyberte soubory shapefilu
                    <br />
                    <small className="text-muted">Povinné: {requiredExtensions.join(', ')}</small>
                    <br />
                    <small className="text-muted">Doporučené: {optionalExtensions.join(', ')}</small>
                </Form.Label>
                <Form.Control
                    ref={fileInputRef}
                    type="file"
                    name="formFile"
                    multiple
                    accept={allSupportedExtensions.join(',')}
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
            </Form.Group>
            {isLoading && (
                <div className="text-center mt-3">
                    <FontAwesomeIcon icon={faSpinner} spin /> Nahrávání...
                </div>
            )}
            {errors && Object.keys(errors).length > 0 && (
                <FileUploadError errors={errors} onRetry={openFileDialog} />
            )}
            {completeDatasets.length > 1 && !errors && !isLoading && (
                <FileUploadSelection
                    completeDatasets={completeDatasets}
                    onSelectDataset={handleSelectDataset}
                    onRetry={openFileDialog}
                />
            )}
        </div>
    );
});

export default FileUpload;