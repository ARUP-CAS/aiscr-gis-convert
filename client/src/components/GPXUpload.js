import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../config';

const GPXUpload = ({ onGPXDataLoaded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);

        const formData = new FormData();
        formData.append('gpxFile', selectedFile);

        try {
            const response = await fetch(`${API_URL}/upload-gpx`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Nahrávání souboru selhalo');
            }

            const data = await response.json();
            console.log(data);
            onGPXDataLoaded(data); // Předáváme zpracovaná data nadřazené komponentě
        } catch (error) {
            console.error('Chyba při nahrávání:', error);
        } finally {
            setIsLoading(false);
            setSelectedFile(null);
        }
    };

    return (
        <div>
            <Form.Group controlId="formGPXFile">
                <Form.Label>Vyberte GPX soubor</Form.Label>
                <Form.Control
                    type="file"
                    name="formGPXFile"
                    accept=".gpx"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
            </Form.Group>
            <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || isLoading}
                className="mt-3"
            >
                {isLoading ? (
                    <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Nahrávání...
                    </>
                ) : (
                    'Nahrát GPX soubor'
                )}
            </Button>
        </div>
    );
};

export default GPXUpload;