import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../config';
import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '../config';

/**
 * Komponenta pro nahrávání GPX souborů.
 * - Umožňuje výběr jednoho GPX souboru a jeho odeslání na server.
 * - Po úspěšném zpracování zavolá `onGPXDataLoaded` s obdrženými daty.
 */
const GPXUpload = ({ onGPXDataLoaded }) => {
    const [isLoading, setIsLoading] = useState(false); // Indikátor probíhajícího nahrávání
    const [selectedFile, setSelectedFile] = useState(null); // Vybraný soubor

    /**
     * Zpracování výběru souboru uživatelem.
     * - Nastaví stav s vybraným souborem.
     */
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    /**
     * Odeslání vybraného GPX souboru na server.
     * - Po úspěšném zpracování přeposílá obdržená data nadřazené komponentě.
     */
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
            setSelectedFile(null); // Reset vybraného souboru
        }
    };

    return (
        <div>
            <Form.Group controlId="formGPXFile">
                <Form.Label>
                    Vyberte GPX soubor
                    <br />
                    <small className="text-muted">
                        Formát souboru: <strong>.gpx</strong>
                    </small>
                    <br />
                    <small className="text-muted">Maximální velikost souboru: {MAX_FILE_SIZE / (1024 * 1024)} MB</small>
                    <br />
                    <small className="text-muted">
                        GPX soubory obsahují geografické body, trasy nebo oblasti (waypoints, tracks, routes).
                    </small>
                </Form.Label>
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
