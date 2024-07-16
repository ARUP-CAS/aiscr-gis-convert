import React from 'react';
import { Form, Button } from 'react-bootstrap';

function FileUpload({ setWktOutput, setIndividualPolygons }) {
    const handleFileUpload = async (event) => {
        event.preventDefault();

        const fileInput = event.target.elements.formFile.files;
        if (!fileInput || fileInput.length === 0) {
            console.error('No file selected');
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
                headers: {
                    'Accept-Charset': 'utf-8'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json();
            setWktOutput(data.fullWkt);
            setIndividualPolygons(data.polygons);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <Form onSubmit={handleFileUpload} encType="multipart/form-data">
            <Form.Group controlId="formFile">
                <Form.Label>
                    Vyber všechny dostupné soubory shapefilu
                    <br />
                    <small className="text-muted"> (.cpg, .dbf, .prj, .sbn, .sbx, .shp, .shx, .xml)</small>
                </Form.Label>
                <Form.Control type="file" name="formFile" multiple accept=".cpg,.dbf,.prj,.sbn,.sbx,.shp,.shx,.xml" />
            </Form.Group>
            <h2 className='display-6 mt-5'>2. Konverze souborů</h2>
            <Button variant="success" size="lg" type="submit" className='mt-2 px-5'>
                Vytvořit WKT
            </Button>
        </Form>
    );
}

export default FileUpload;
