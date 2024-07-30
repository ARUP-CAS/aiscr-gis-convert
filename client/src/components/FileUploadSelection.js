import React, { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck } from '@fortawesome/free-solid-svg-icons';

// Komponenta pro výběr datasetu v případě, že bylo nahráno více kompletních datasetů
const FileUploadSelection = ({ completeDatasets, onSelectDataset, onRetry }) => {
    // State pro uchování vybraného datasetu, inicializován prvním datasetem v seznamu
    const [selectedDataset, setSelectedDataset] = useState(completeDatasets[0]);

    // Handler pro změnu výběru datasetu
    const handleSelectChange = (event) => {
        setSelectedDataset(event.target.value);
    };

    // Handler pro potvrzení výběru datasetu
    const handleSubmit = () => {
        onSelectDataset(selectedDataset);
    };

    return (
        <Alert variant="info" className="mt-3">
            <Alert.Heading className="text-center">Nalezeno více kompletních datasetů</Alert.Heading>
            <p className="text-center">Vyberte dataset, který chcete použít:</p>
            <div className="d-flex flex-column align-items-center">
                {/* Mapování přes všechny kompletní datasety a vytvoření radio buttonů */}
                {completeDatasets.map(dataset => (
                    <Form.Check 
                        type="radio"
                        id={`dataset-${dataset}`}
                        name="dataset"
                        label={dataset}
                        value={dataset}
                        checked={selectedDataset === dataset}
                        onChange={handleSelectChange}
                        key={dataset}
                        className="mb-2"
                    />
                ))}
            </div>
            <div className="d-flex justify-content-between mt-3">
                {/* Tlačítko pro opětovné nahrání souborů */}
                <Button variant="outline-secondary" onClick={onRetry}>
                    <FontAwesomeIcon icon={faUpload} /> Nahrát znovu
                </Button>
                {/* Tlačítko pro potvrzení výběru datasetu */}
                <Button variant="outline-primary" onClick={handleSubmit}>
                    <FontAwesomeIcon icon={faCheck} /> Použít vybraný dataset
                </Button>
            </div>
        </Alert>
    );
};

export default FileUploadSelection;