import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Table, Container, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTriangleExclamation, faTag, faGlobe, faBan, faRandom, faArrowRight, faInfoCircle, faUndo, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './ShapefileInfo.module.scss'; // Import SCSS modulu
import { getEpsgName, getEpsgFullName } from '../utils/epsgUtils';

// Mapování EPSG kódů na jejich názvy
const epsgMapping = {
    '5514': 'S-JTSK / Krovak East North',
    '4326': 'WGS84 - World Geodetic System 1984'
};

// Funkce pro získání názvu EPSG systému podle kódu
// function getEpsgName(code) {
//     return epsgMapping[code] || 'Neznámý systém';
// }



function ShapefileInfo({ shapefileData, onSettingsChange, onFeatureSelection }) {
    const [epsg, setEpsg] = useState('');
    const [supportedEpsg, setSupportedEpsg] = useState(null);

    const [reprojected, setReprojected] = useState(null);
    const [originalEPSG, setOriginalEPSG] = useState(null);
    const [currentEPSG, setCurrentEPSG] = useState(null);

    const [labelAttribute, setLabelAttribute] = useState('');
    const [features, setFeatures] = useState(shapefileData.features || []);

    useEffect(() => {
        let newEpsg = '';
        let reprojected = shapefileData.epsg.reprojected;
        let originalEPSG = shapefileData.epsg.originalEPSG;
        let currentEPSG = shapefileData.epsg.currentEPSG;

        console.log("reprojected: ", reprojected, typeof reprojected);
        console.log("originalEPSG: ", originalEPSG, typeof originalEPSG);
        console.log("currentEPSG: ", currentEPSG, typeof currentEPSG);

        if (!reprojected) {
            setReprojected(false);

            if (originalEPSG === 5514 || originalEPSG === 4326) {
                console.log(`Reprojekce není potřeba. Data zůstávají v původním EPSG (${originalEPSG}).`);
                setOriginalEPSG(originalEPSG);
                newEpsg = originalEPSG;
                setSupportedEpsg(originalEPSG);
            } else {
                console.warn(`Reprojekce neproběhla`);
                console.warn(`/t- EPSG ${originalEPSG} není podporován. (pouze 5514 a 4326).`);
                console.warn(`/t- EPSG ${originalEPSG} (${getEpsgName(originalEPSG)}) není v seznamu známých variant Křováka.`);
                setOriginalEPSG(originalEPSG);
                console.log(`Reprojekce proběhla. Data jsou v EPSG ${originalEPSG}.`);
                // newEpsg = '5514';

                setSupportedEpsg(null);
            }
        } else {
            setReprojected(true);
            console.log(`Reprojekce proběhla. Data byla převedena z EPSG ${originalEPSG} na EPSG ${currentEPSG}.`);
            setOriginalEPSG(originalEPSG);
            setCurrentEPSG(currentEPSG);
            newEpsg = currentEPSG;
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

    // Funkce pro vykreslení tabulky
    const renderTable = (features) => (
        <div className={styles.tableContainer}>
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
                                    value={feature.editedLabel !== undefined ? feature.editedLabel : (feature.properties[labelAttribute] || feature.properties["vygenerovaneID"])}
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
        </div>
    );

    return (
        <Container>
            <p className='lead'>Načten soubor <strong>{shapefileData.fileName}</strong></p>

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

            <Row className="justify-content-md-center">
                <Col lg={9} md={12}>
                    <Form className="mb-3">
                        <Row className="mb-3">
                            <Form.Group as={Col} sm={12} md={6}>
                                <Form.Label htmlFor="labelAttribute" className='fs-3'>
                                    <FontAwesomeIcon icon={faTag} className="text-secondary" />&nbsp;
                                    Název:</Form.Label>
                                <Form.Select id="labelAttribute" value={labelAttribute} onChange={handleLabelAttributeChange}>
                                    <option value="">Vyberte atribut</option>
                                    {shapefileData.attributes.map(attr => (
                                        <option key={attr} value={attr}>{attr}</option>
                                    ))}
                                </Form.Select>
                                <Form.Text id="labelHelpBlock" muted>
                                    Položka bude sloužit<br />jako label pro jednotlivé prvky.
                                </Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} sm={12} md={6}>
                                <Form.Label htmlFor="epsg" className='fs-3'>
                                    <FontAwesomeIcon icon={faGlobe} className="text-secondary" />&nbsp;
                                    EPSG:
                                </Form.Label>
                                {!reprojected ? (
                                    <div>
                                        {supportedEpsg ? (
                                            <div>
                                                <p className="">
                                                    <FontAwesomeIcon icon={faCheck} className="text-success" />&nbsp;
                                                    <strong>{getEpsgFullName(supportedEpsg)}</strong>
                                                </p>
                                                <p className="d-inline-block small text-muted">Zjištěno z nahraného SHP souboru.</p>

                                            </div>
                                        ) : (
                                            <div>
                                                {originalEPSG ? (
                                                    <div>
                                                        <p className="">
                                                            <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning" />&nbsp;
                                                            <strong>{getEpsgFullName(originalEPSG)}</strong>                                                </p>
                                                        <p className="d-inline-block small text-muted">
                                                            Zdá se, že nahraný SHP soubor je v souřadnicovém systému,&nbsp;který
                                                            <br />
                                                            <strong>není podporován jako import do systému AMČR</strong>.
                                                            <br /><br />
                                                            <FontAwesomeIcon icon={faInfoCircle} />&nbsp;
                                                            Povolené souřadnicové systémy pro nahrání jsou 
                                                            varianty S-JTSK a {getEpsgFullName(4326)}.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="">
                                                            <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning" />&nbsp;
                                                            <strong>Neznámý souřadnicový systém.</strong>                                                </p>
                                                        <p className="d-inline-block small text-muted">
                                                            U nahraného SHP souboru nebyl rozpoznán souřadnicový systém.
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <Form.Select id="epsg" value={epsg} onChange={handleEpsgChange}>
                                                        <option value="">Vyberte EPSG</option>
                                                        {Object.entries(epsgMapping).map(([code, name]) => (
                                                            <option key={code} value={code}>{code} ({name})</option>
                                                        ))}
                                                    </Form.Select>
                                                </div>

                                            </div>

                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="">
                                            <FontAwesomeIcon icon={faCheck} className="text-warning" />&nbsp;
                                            <strong>{getEpsgFullName(currentEPSG)}</strong>
                                        </p>
                                        <p className='d-inline-block small'>
                                            Došlo k automatické transformaci souřadnicového systému:
                                            <br /><br />
                                            <strong>
                                                {getEpsgFullName(originalEPSG)}
                                                <FontAwesomeIcon icon={faArrowRight} className="mx-2" />
                                                {getEpsgFullName(currentEPSG)}
                                            </strong>
                                        </p>
                                    </div>
                                )}
                            </Form.Group>
                        </Row>
                    </Form>
                </Col>
            </Row>
            {epsg ? (

                <Row className="justify-content-md-center py-3">
                    <Col lg={9} md={12}>
                        {renderTable(features)}
                    </Col>
                </Row>
            ) : (
                null
            )}
        </Container>
    );
}

export default React.memo(ShapefileInfo);
