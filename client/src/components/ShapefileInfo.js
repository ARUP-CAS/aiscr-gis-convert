import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Table, Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faUndo } from '@fortawesome/free-solid-svg-icons';

function ShapefileInfo({ shapefileData, onSettingsChange, onFeatureSelection }) {
    const [epsg, setEpsg] = useState('');
    const [labelAttribute, setLabelAttribute] = useState('');
    const [features, setFeatures] = useState(shapefileData.features || []);
    const [knownEpsg, setKnownEpsg] = useState(null);

    useEffect(() => {
        let newEpsg = '';
        if (shapefileData.epsg) {
            newEpsg = shapefileData.epsg;
            setKnownEpsg(shapefileData.epsg);
        } else if (shapefileData.attributes.includes('EPSG')) {
            newEpsg = shapefileData.features[0].properties.EPSG;
            setKnownEpsg(newEpsg);
        } else {
            newEpsg = '5514';
            setKnownEpsg(null);
        }
        setEpsg(newEpsg);

        if (shapefileData.attributes.includes('label')) {
            setLabelAttribute('label');
        } else {
            const suitableAttribute = shapefileData.attributes.find(attr =>
                !['EPSG', 'geometry', 'type'].includes(attr.toLowerCase())
            );
            setLabelAttribute(suitableAttribute || '');
        }
    }, [shapefileData]);

    useEffect(() => {
        onSettingsChange({ epsg, labelAttribute });
    }, [epsg, labelAttribute, onSettingsChange]);

    useEffect(() => {
        onFeatureSelection(features.filter(feature => feature.export !== false));
    }, [features, onFeatureSelection]);

    const handleEpsgChange = (e) => {
        setEpsg(e.target.value);
    };

    const handleLabelAttributeChange = (e) => {
        setLabelAttribute(e.target.value);
    };

    const handleExportChange = (index, checked) => {
        setFeatures(prevFeatures =>
            prevFeatures.map((feature, i) =>
                i === index ? { ...feature, export: checked } : feature
            )
        );
    };

    const handleLabelEdit = (index, newLabel) => {
        setFeatures(prevFeatures =>
            prevFeatures.map((feature, i) =>
                i === index ? { ...feature, editedLabel: newLabel } : feature
            )
        );
    };

    const resetLabels = () => {
        setFeatures(prevFeatures =>
            prevFeatures.map(feature => ({
                ...feature,
                editedLabel: undefined
            }))
        );
    };

    return (
        <Container>
            <p className='lead'>Načten soubor <strong>{shapefileData.fileName}</strong></p>

            <Row className="justify-content-md-center">
                <Col lg={8} md={10} sm={12}>
                    <Form className="mb-3">
                        <Row className="mb-3">
                            <Form.Group as={Col} sm={12} md={6}>
                                <Form.Label htmlFor="epsg">EPSG:</Form.Label>
                                <Form.Select id="epsg" value={epsg} onChange={handleEpsgChange}>
                                    <option value="">Vyberte EPSG</option>
                                    <option value="5514">
                                        5514 (S-JTSK)
                                    </option>
                                    <option value="4326">
                                        4326 (WGS 84)
                                    </option>
                                </Form.Select>
                                <Form.Text id="epsgHelpBlock" muted>
                                    Povolené EPSG jsou<br />5514 (S-JTSK) a 4326 (WGS 84).
                                    {knownEpsg ? (
                                        <>
                                            <br /><FontAwesomeIcon icon={faInfoCircle} /> EPSG {knownEpsg} bylo zjištěno z SHP.
                                        </>
                                    ) : (
                                        <>
                                            <br /><FontAwesomeIcon icon={faInfoCircle} /> V SHP nebylo zjištěno EPSG.
                                        </>
                                    )}
                                </Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} sm={12} md={6}>
                                <Form.Label htmlFor="labelAttribute">Název:</Form.Label>
                                <Form.Select id="labelAttribute" value={labelAttribute} onChange={handleLabelAttributeChange}>
                                    <option value="">Vyberte atribut</option>
                                    {shapefileData.attributes.map(attr => (
                                        <option key={attr} value={attr}>{attr}</option>
                                    ))}
                                </Form.Select>
                                <Form.Text id="labelHelpBlock" muted>
                                    Položka bude sloužit<br />jako label pro jednotlivé polygony.
                                </Form.Text>
                            </Form.Group>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row className="justify-content-md-center py-3">
                <Col lg={9} md={12}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>
                                    Label
                                    <Button variant="link" onClick={resetLabels} title="Resetovat na výchozí hodnoty">
                                        <FontAwesomeIcon icon={faUndo} />
                                    </Button>
                                </th>
                                <th>EPSG</th>
                                <th>Export</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, index) => (
                                <tr key={index}>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            value={feature.editedLabel !== undefined ? feature.editedLabel : (feature.properties[labelAttribute] || `Feature ${index + 1}`)}
                                            onChange={(e) => handleLabelEdit(index, e.target.value)}
                                        />
                                    </td>
                                    <td>{epsg}</td>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={feature.export !== false}
                                            onChange={(e) => handleExportChange(index, e.target.checked)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}

export default React.memo(ShapefileInfo);