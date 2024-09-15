import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Table, Nav, Form } from 'react-bootstrap';
import styles from './DXFInfo.module.scss';

const epsgMapping = {
    '4326': 'WGS 84',
    '5514': 'S-JTSK / Krovak East North'
};

function DXFInfo({ dxfData, dxfLabelAttribute, onLabelAttributeChange, checkedFeatures, onCheckedFeatureToggle }) {
    const [activeTab, setActiveTab] = useState('all');
    const [epsg, setEpsg] = useState('4326');

    const allFeatures = dxfData.features || [];
    const pointFeatures = allFeatures.filter(f => f.geometryType === 'point');
    const lineFeatures = allFeatures.filter(f => f.geometryType === 'line');
    const polygonFeatures = allFeatures.filter(f => f.geometryType === 'polygon');

    const featureCounts = {
        all: allFeatures.length,
        points: pointFeatures.length,
        lines: lineFeatures.length,
        polygons: polygonFeatures.length
    };

    const labelOptions = useMemo(() => {
        return allFeatures.length > 0 ? Object.keys(allFeatures[0].properties) : [];
    }, [allFeatures]);

    useEffect(() => {
        if (labelOptions.length > 0 && !dxfLabelAttribute && onLabelAttributeChange) {
            onLabelAttributeChange(labelOptions[0]);
        }
    }, [labelOptions, dxfLabelAttribute, onLabelAttributeChange]);

    const getFeatureLabel = (feature) => {
        return feature.properties[dxfLabelAttribute] || 'N/A';
    };

    const renderTable = (features) => (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Label</th>
                    <th>Typ geometrie</th> {/* Nový sloupec */}
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
                                value={getFeatureLabel(feature)}
                                readOnly
                            />
                        </td>
                        <td>{feature.geometryType}</td> {/* Typ geometrie */}
                        <td>{epsg}</td>
                        <td>
                            <Form.Check
                                type="checkbox"
                                checked={checkedFeatures.has(feature.systemoveID)}
                                onChange={() => onCheckedFeatureToggle(feature.systemoveID)}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );

    const renderNavItem = (key, label, features) => {
        const count = featureCounts[key];
        const checkedCount = features.filter(feature => checkedFeatures.has(feature.systemoveID)).length; // Počet zaškrtnutých
        const isEmpty = count === 0;
        const isActive = activeTab === key;

        return (
            <Nav.Item>
                <Nav.Link
                    eventKey={key}
                    className={`
                        ${styles.navLink}
                        ${isEmpty ? styles.empty : styles.notEmpty}
                        ${isActive ? styles.active : ''}
                    `}
                >
                    {`${label} (${checkedCount}/${count})`} {/* Zobrazení počtu zaškrtnutých */}
                </Nav.Link>
            </Nav.Item>
        );
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h4>DXF Informace</h4>
                    <p>Soubor: {dxfData.fileName}</p>
                    <p>EPSG: {dxfData.epsgInfo?.epsg ? epsgMapping[dxfData.epsgInfo.epsg] || dxfData.epsgInfo.epsg : 'Neurčeno'}</p>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Vyberte atribut pro label:</Form.Label>
                        <Form.Select value={dxfLabelAttribute}
                            onChange={(e) => onLabelAttributeChange(e.target.value)}>
                            {labelOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Vyberte EPSG:</Form.Label>
                        <Form.Select value={epsg} onChange={(e) => setEpsg(e.target.value)}>
                            {Object.entries(epsgMapping).map(([code, name]) => (
                                <option key={code} value={code}>{code} - {name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedTab) => setActiveTab(selectedTab)}>
                        {renderNavItem('all', 'Vše', allFeatures)}
                        {renderNavItem('points', 'Body', pointFeatures)}
                        {renderNavItem('lines', 'Linie', lineFeatures)}
                        {renderNavItem('polygons', 'Polygony', polygonFeatures)}
                    </Nav>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    {activeTab === 'all' && renderTable(allFeatures)}
                    {activeTab === 'points' && renderTable(pointFeatures)}
                    {activeTab === 'lines' && renderTable(lineFeatures)}
                    {activeTab === 'polygons' && renderTable(polygonFeatures)}
                </Col>
            </Row>
        </Container>
    );
}

export default DXFInfo;
