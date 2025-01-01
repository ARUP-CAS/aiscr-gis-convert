import React, { useState, useEffect } from 'react';
import { Table, Form, Container } from 'react-bootstrap';

/**
 * Komponenta pro zobrazení a úpravu informací o GPX datech.
 * 
 * @param {Array} data - Pole prvků GPX (obsahuje label, typ geometrie, atd.).
 * @param {Function} onUpdate - Callback pro aktualizaci dat při změnách.
 */
function GPXInfo({ data, onUpdate }) {
    const [features, setFeatures] = useState([]);

    // Inicializace dat z props do lokálního stavu komponenty.
    useEffect(() => {
        if (data.length > 0) {
            const initialFeatures = data.map((feature) => ({
                ...feature,
                // Přidáme výchozí hodnotu pro vlastnost 'export', pokud chybí.
                export: feature.export ?? true,
            }));
            setFeatures(initialFeatures);
        }
    }, [data]);

    /**
     * Změna stavu vlastnosti 'export' pro daný prvek.
     * 
     * @param {number} index - Index prvku v poli features.
     * @param {boolean} checked - Nový stav checkboxu.
     */
    const handleExportChange = (index, checked) => {
        const updatedFeatures = features.map((feature, i) =>
            i === index ? { ...feature, export: checked } : feature
        );
        setFeatures(updatedFeatures);
        onUpdate(updatedFeatures); // Propagace změn zpět do MainContent
    };

    /**
     * Změna labelu pro daný prvek.
     * 
     * @param {number} index - Index prvku v poli features.
     * @param {string} newLabel - Nový text pro label.
     */
    const handleLabelChange = (index, newLabel) => {
        const updatedFeatures = [...features];
        updatedFeatures[index].label = newLabel;
        setFeatures(updatedFeatures);
        onUpdate(updatedFeatures); // Odeslání aktualizovaných dat
    };

    // Logování změn stavu features (pro ladění).
    useEffect(() => {
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
