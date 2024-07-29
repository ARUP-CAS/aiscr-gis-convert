// FileUploadError.js
import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const FileUploadError = ({ errors, onRetry }) => {
    const requiredExtensions = ['.shp', '.dbf'];

    return (
        <Alert variant="danger" className="mt-3">
            <Alert.Heading>Chyba při nahrávání souborů</Alert.Heading>
            <p>Byly nahrány soubory z různých datasetů. Žádný dataset není kompletní:</p>
            {Object.entries(errors).map(([dataset, missingFiles]) => (
                <div key={dataset} className="mb-3">
                    <strong>{dataset}:</strong>
                    <ul className="list-unstyled ml-3">
                        {requiredExtensions.map(ext => (
                            <li key={ext}>
                                <FontAwesomeIcon 
                                    icon={missingFiles.includes(ext) ? faTimes : faCheck} 
                                    className={missingFiles.includes(ext) ? "text-danger" : "text-success"}
                                />
                                {' '}
                                {ext}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <p>Prosím, nahrajte kompletní sadu souborů pro jeden dataset.</p>
            <div className="d-flex justify-content-end mt-2">
                <Button variant="outline-danger" onClick={onRetry}>
                    <FontAwesomeIcon icon={faUpload} /> Nahrát znovu
                </Button>
            </div>
        </Alert>
    );
};

export default FileUploadError;