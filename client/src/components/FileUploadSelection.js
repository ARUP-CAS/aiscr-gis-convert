// FileUploadSelection.js
import React, { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheck } from '@fortawesome/free-solid-svg-icons';

const FileUploadSelection = ({ completeDatasets, onSelectDataset, onRetry }) => {
    const [selectedDataset, setSelectedDataset] = useState(completeDatasets[0]);

    const handleSelectChange = (event) => {
        setSelectedDataset(event.target.value);
    };

    const handleSubmit = () => {
        onSelectDataset(selectedDataset);
    };

    return (
        <Alert variant="info" className="mt-3">
            <Alert.Heading className="text-center">Nalezeno více kompletních datasetů</Alert.Heading>
            <p className="text-center">Vyberte dataset, který chcete použít:</p>
            <div className="d-flex flex-column align-items-center">
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
                <Button variant="outline-secondary" onClick={onRetry}>
                    <FontAwesomeIcon icon={faUpload} /> Nahrát znovu
                </Button>
                <Button variant="outline-primary" onClick={handleSubmit}>
                    <FontAwesomeIcon icon={faCheck} /> Použít vybraný dataset
                </Button>
            </div>
        </Alert>
    );
};

export default FileUploadSelection;