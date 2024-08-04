import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Table, Container, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faInfoCircle, faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';

// Mapování EPSG kódů na jejich názvy
const epsgMapping = {
    '5514': 'S-JTSK / Krovak East North',
    '4326': 'WGS84 - World Geodetic System 1984'
};

// Funkce pro získání názvu EPSG systému podle kódu
function getEpsgName(code) {
    return epsgMapping[code] || 'Neznámý systém';
}

// Komponenta pro zobrazení informací o shapefilu
function ShapefileInfo({ shapefileData, onSettingsChange, onFeatureSelection }) {
    // State pro EPSG kód, atribut pro label a features
    const [epsg, setEpsg] = useState('');
    const [labelAttribute, setLabelAttribute] = useState('');
    const [features, setFeatures] = useState(shapefileData.features || []);
    const [knownEpsg, setKnownEpsg] = useState(null);

    // Effect pro inicializaci EPSG a label atributu
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

        // Nastavení výchozího atributu pro label
        if (shapefileData.attributes.includes('label')) {
            setLabelAttribute('label');
        } else {
            const suitableAttribute = shapefileData.attributes.find(attr =>
                !['EPSG', 'geometry', 'type'].includes(attr.toLowerCase())
            );
            setLabelAttribute(suitableAttribute || '');
        }
    }, [shapefileData]);

    // Effect pro aktualizaci nastavení exportu
    useEffect(() => {
        onSettingsChange({ epsg, labelAttribute });
    }, [epsg, labelAttribute, onSettingsChange]);

    // Effect pro aktualizaci vybraných features
    useEffect(() => {
        onFeatureSelection(features.filter(feature => feature.export !== false));
    }, [features, onFeatureSelection]);

    // Handlery pro změnu EPSG a label atributu
    const handleEpsgChange = (e) => {
        setEpsg(e.target.value);
    };

    const handleLabelAttributeChange = (e) => {
        setLabelAttribute(e.target.value);
    };

    // Handler pro změnu exportu feature
    const handleExportChange = (index, checked) => {
        setFeatures(prevFeatures =>
            prevFeatures.map((feature, i) =>
                i === index ? { ...feature, export: checked } : feature
            )
        );
    };

    // Handler pro úpravu labelu feature
    const handleLabelEdit = (index, newLabel) => {
        setFeatures(prevFeatures =>
            prevFeatures.map((feature, i) =>
                i === index ? { ...feature, editedLabel: newLabel } : feature
            )
        );
    };

    // Funkce pro reset labelů na výchozí hodnoty
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

            {/* Tabulka s informacemi o nahraných souborech */}
            <Row className="justify-content-md-center mb-3">
                <Col lg={8} md={10} sm={12}>
                    <Table striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Soubor</th>
                                <th>Stav</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(shapefileData.uploadedFiles).map(([ext, uploaded]) => (
                                <tr key={ext}>
                                    <td>{ext.toUpperCase()}</td>
                                    <td>
                                        {uploaded ? (
                                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                                        ) : (
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {shapefileData.warning && (
                        <Alert variant="warning">{shapefileData.warning}</Alert>
                    )}
                </Col>
            </Row>

            {/* Formulář pro nastavení EPSG a label atributu */}
            <Row className="justify-content-md-center">
                <Col lg={8} md={10} sm={12}>
                    <Form className="mb-3">
                        <Row className="mb-3">
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
                            <Form.Group as={Col} sm={12} md={6}>
                                <Form.Label htmlFor="epsg">EPSG:</Form.Label>
                                {knownEpsg ? (
                                    <div>
                                        <p className="">
                                            <FontAwesomeIcon icon={faCheck} className="text-success" />&nbsp;
                                            <strong>{knownEpsg} ({getEpsgName(knownEpsg)})</strong>
                                        </p>
                                        <p className="d-inline-block small text-muted">Zjištěno z nahraného souboru</p>
                                    </div>
                                ) : (
                                    <>
                                        <Form.Select id="epsg" value={epsg} onChange={handleEpsgChange}>
                                            <option value="">Vyberte EPSG</option>
                                            {Object.entries(epsgMapping).map(([code, name]) => (
                                                <option key={code} value={code}>{code} ({name})</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text id="epsgHelpBlock" muted>
                                            Povolené EPSG jsou uvedeny výše.
                                            <br /><FontAwesomeIcon icon={faInfoCircle} /> V SHP nebylo zjištěno EPSG.
                                        </Form.Text>
                                    </>
                                )}
                            </Form.Group>


                        </Row>
                    </Form>
                </Col>
            </Row>

            {/* Tabulka s features */}
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