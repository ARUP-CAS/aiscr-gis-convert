import React, { useState, useEffect } from 'react';
import { Table, Form, Container } from 'react-bootstrap';

function GPXInfo({ data, onUpdate }) {
    const [features, setFeatures] = useState([]);

    // Inicializace dat z props
    useEffect(() => {
        if (data.length > 0) {
            const initialFeatures = data.map((feature) => ({
                ...feature,
                export: feature.export ?? true, // Výchozí hodnota
            }));
            setFeatures(initialFeatures);
        }
    }, [data]);

    // Aktualizace při změně export checkboxu
    const handleExportChange = (index, checked) => {
        console.log('Before update:', features);
        const updatedFeatures = features.map((feature, i) =>
            i === index ? { ...feature, export: checked } : feature
        );
        console.log('After update:', updatedFeatures);
        setFeatures(updatedFeatures);
        onUpdate(updatedFeatures); // Propagace změn
    };

    // Aktualizace při změně labelu
    const handleLabelChange = (index, newLabel) => {
        const updatedFeatures = [...features];
        updatedFeatures[index].label = newLabel;
        setFeatures(updatedFeatures);
        onUpdate(updatedFeatures); // Odeslání aktualizovaných dat
    };

    useEffect(() => {
        console.log('Re-render GPXInfo with features:', features);
    }, [features]);

    return (
        <Container>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Label</th>
                        <th>EPSG</th>
                        <th>Typ geometrie</th>
                        <th>Export</th>
                    </tr>
                </thead>
                <tbody>
                    {features.map((feature, index) => (
                        <tr key={index}>
                            <td>
                                <Form.Control
                                    type="text"
                                    value={feature.label || ''}
                                    onChange={(e) => handleLabelChange(index, e.target.value)}
                                />
                            </td>
                            <td>4326</td>
                            <td>{feature.geometryType}</td>
                            <td>
                                <Form.Check
                                    type="checkbox"
                                    checked={feature.export}
                                    onChange={(e) => handleExportChange(index, e.target.checked)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default React.memo(GPXInfo);
