import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

function FileUpload({ setShapefileData }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const supportedExtensions = ['.shp', '.dbf', '.prj', '.cpg'];

    const handleFileChange = (event) => {
        setSelectedFiles(Array.from(event.target.files));
    };

    const handleFileUpload = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (selectedFiles.length === 0) {
            console.error('No file selected');
            setIsLoading(false);
            return;
        } 

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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleFileUpload} encType="multipart/form-data">
            <Form.Group controlId="formFile">
                <Form.Label>
                    Vyberte všechny dostupné soubory shapefilu
                    <br />
                    <small className="text-muted">({supportedExtensions.join(', ')})</small>
                </Form.Label>
                <Form.Control 
                    type="file" 
                    name="formFile" 
                    multiple 
                    accept={supportedExtensions.join(',')}
                    onChange={handleFileChange}
                />
            </Form.Group>
            <Button 
                variant="primary" 
                type="submit" 
                disabled={isLoading || selectedFiles.length === 0} 
                className='m-3'
            >
                {isLoading ? 'Nahrávání...' : (
                    <>
                        <FontAwesomeIcon icon={faUpload} /> {' Nahrát soubory'}
                    </>
                )}
            </Button>
        </Form>
    );
}

export default FileUpload;