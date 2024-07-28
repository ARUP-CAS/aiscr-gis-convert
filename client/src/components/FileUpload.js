import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const FileUpload = forwardRef(({ setShapefileData }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const supportedExtensions = ['.shp', '.dbf', '.prj', '.cpg'];

    useEffect(() => {
        if (selectedFiles.length > 0) {
            handleFileUpload();
        }
    }, [selectedFiles]);

    const handleFileChange = (event) => {
        setSelectedFiles(Array.from(event.target.files));
        setError(null);
    };

    const handleFileUpload = async () => {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('shpFiles', file);
        });

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json();
            setShapefileData(data[0]); // Předpokládáme, že server vrací pole, bereme první prvek
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Chyba při nahrávání souboru. Zkuste to prosím znovu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Nová metoda pro otevření dialogového okna
    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    // Zpřístupnění metody openFileDialog pro rodiče
    useImperativeHandle(ref, () => ({
        openFileDialog
    }));

    return (
        <Form>
            <Form.Group controlId="formFile">
                <Form.Label>
                    Vyberte všechny dostupné soubory shapefilu
                    <br />
                    <small className="text-muted">({supportedExtensions.join(', ')})</small>
                </Form.Label>
                <Form.Control 
                    ref={fileInputRef}
                    type="file" 
                    name="formFile" 
                    multiple 
                    accept={supportedExtensions.join(',')}
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
            </Form.Group>
            {isLoading && (
                <div className="text-center mt-3">
                    <FontAwesomeIcon icon={faSpinner} spin /> Nahrávání...
                </div>
            )}
            {error && (
                <Alert variant="danger" className="mt-3">
                    {error}
                </Alert>
            )}
        </Form>
    );
});

export default FileUpload;