import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

function FileUpload({ setShapefileData }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const fileInput = event.target.elements.formFile.files;
        if (!fileInput || fileInput.length === 0) {
            console.error('No file selected');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < fileInput.length; i++) {
            formData.append('shpFiles', fileInput[i]);
        }

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
                    <small className="text-muted">(.cpg, .dbf, .prj, .sbn, .sbx, .shp, .shx, .xml)</small>
                </Form.Label>
                <Form.Control type="file" name="formFile" multiple accept=".cpg,.dbf,.prj,.sbn,.sbx,.shp,.shx,.xml" />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading} className='m-3'>
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