import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '../config';

const FileUploadError = ({ errors, onRetry }) => {
    const renderErrorContent = () => {
        if (errors['Invalid Files']) {
            return (
                <>
                    <p>Následující soubory nelze nahrát:</p>
                    <ul className="list-unstyled ml-3">
                        {errors['Invalid Files'].map((errorMsg, index) => (
                            <li key={index}>
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" /> {errorMsg}
                            </li>
                        ))}
                    </ul>
                    <p>Ujistěte se, že soubory nepřesahují maximální povolenou velikost a jsou podporovaného typu.</p>
                </>
            );
        } else {
            return (
                <>
                    <p>Byly nahrány soubory z různých datasetů. Žádný dataset není kompletní:</p>
                    {Object.entries(errors).map(([dataset, missingFiles]) => (
                        <div key={dataset} className="mb-3">
                            <strong>{dataset}:</strong>
                            <ul className="list-unstyled ml-3">
                                {SUPPORTED_EXTENSIONS.required.map(ext => (
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
                </>
            );
        }
    };

    return (
        <Alert variant="danger" className="mt-3">
            <Alert.Heading>Chyba při nahrávání souborů</Alert.Heading>
            {renderErrorContent()}
            <div className="d-flex justify-content-end mt-2">
                <Button variant="outline-danger" onClick={onRetry}>
                    <FontAwesomeIcon icon={faUpload} /> Nahrát znovu
                </Button>
            </div>
        </Alert>
    );
};

export default FileUploadError;