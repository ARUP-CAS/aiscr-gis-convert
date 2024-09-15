import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faTrashAlt, faUpload } from '@fortawesome/free-solid-svg-icons';

function DXFExportData({ 
    activeTab, 
    dxfData, 
    dxfLabelAttribute, 
    epsg, 
    checkedFeatures,  // Zkontrolované prvky
    onRefresh, 
    onReupload 
}) {
    const [exportContent, setExportContent] = useState('');

    // Generování exportního obsahu na základě záložky, vybraných prvků a EPSG
    useEffect(() => {
        if (!dxfData || !dxfLabelAttribute || !epsg) {
            setExportContent('');
            return;
        }

        // Filtrování prvků podle aktivní záložky
        const filterFeaturesByTab = () => {
            switch (activeTab) {
                case 'points':
                    return dxfData.features.filter(f => f.geometryType === 'point');
                case 'lines':
                    return dxfData.features.filter(f => f.geometryType === 'line');
                case 'polygons':
                    return dxfData.features.filter(f => f.geometryType === 'polygon');
                default:
                    return dxfData.features;
            }
        };

        const filteredFeatures = filterFeaturesByTab();

        // Generování CSV obsahu
        const header = `"label","epsg","geometry"`;
        const rows = filteredFeatures
            .filter(feature => checkedFeatures.has(feature.systemoveID)) // Pouze zaškrtnuté prvky
            .map(feature => {
                const label = feature.properties[dxfLabelAttribute] || `Prvek`;
                const geometry = feature.wkt; // WKT formát geometrie
                return `"${label}","${epsg}","${geometry}"`;
            });

        const content = [header, ...rows].join('\n');
        setExportContent(content);
    }, [dxfData, dxfLabelAttribute, epsg, checkedFeatures, activeTab]);

    // Funkce pro kopírování do schránky
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(exportContent);
    };

    // Funkce pro stažení CSV
    const handleDownload = () => {
        const blob = new Blob([exportContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const cleanFileName = dxfData.fileName.toLowerCase().endsWith('.dxf')
                ? dxfData.fileName.slice(0, -4)
                : dxfData.fileName;

            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${cleanFileName}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            {exportContent ? (
                <>
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="exportTextarea">
                                <Form.Label>Exportovaný obsah:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    value={exportContent}
                                    readOnly
                                    rows="10"
                                    style={{ fontFamily: 'monospace' }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="justify-content-center mb-3">
                        <Col md={4} sm={6} className="d-flex justify-content-center mb-2 mb-md-0">
                            <Button variant="success" onClick={handleCopyToClipboard} className="w-100">
                                <FontAwesomeIcon icon={faCopy} />&nbsp;Kopírovat do schránky
                            </Button>
                        </Col>
                        <Col md={4} sm={6} className="d-flex justify-content-center">
                            <Button variant="success" onClick={handleDownload} className="w-100">
                                <FontAwesomeIcon icon={faDownload} />&nbsp;Stáhnout CSV
                            </Button>
                        </Col>
                    </Row>
                    <hr className="my-4" />
                    <Row className="justify-content-center">
                        <Col md={4} sm={6} className="d-flex justify-content-center mb-2 mb-md-0">
                            <Button variant="outline-danger" onClick={() => onRefresh('refresh')} className="w-100">
                                <FontAwesomeIcon icon={faTrashAlt} />&nbsp;Vyčistit
                            </Button>
                        </Col>
                        <Col md={4} sm={6} className="d-flex justify-content-center">
                            <Button variant="outline-primary" onClick={() => onReupload('reupload')} className="w-100">
                                <FontAwesomeIcon icon={faUpload} />&nbsp;Vyčistit a nahrát další
                            </Button>
                        </Col>
                    </Row>
                </>
            ) : (
                <p>Vyberte EPSG a atribut pro label, a označte prvky pro export.</p>
            )}
        </div>
    );
}

export default DXFExportData;
