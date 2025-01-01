import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faTrashAlt, faUpload, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

function GPXExportData({ gpxData, onRefresh, onReupload }) {
    const [exportContent, setExportContent] = useState('');

    useEffect(() => {
        if (!gpxData || !gpxData.features) {
            setExportContent('');
            return;
        }

        // Generování CSV obsahu
        const header = `"label","epsg","geometry"`;
        const rows = gpxData.features
            .filter(feature => feature.export) // Pouze zaškrtnuté prvky
            .map(feature => {
                const label = feature.label || `Prvek`;
                const geometry = feature.geometry; // WKT formát geometrie přímo ze serveru
                return `"${label}","4326","${geometry}"`;
            });

        const content = rows.length > 0 ? [header, ...rows].join('\n') : '';
        setExportContent(content);
    }, [gpxData]);

    const handleCopyToClipboard = () => {
        if (exportContent) {
            navigator.clipboard.writeText(exportContent);
        }
    };

    const handleDownload = () => {
        if (exportContent) {
            const blob = new Blob([exportContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const cleanFileName = gpxData.fileName.toLowerCase().endsWith('.gpx')
                    ? gpxData.fileName.slice(0, -4)
                    : gpxData.fileName;

                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `${cleanFileName}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
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
                            <Button variant="outline-danger" onClick={onRefresh} className="w-100">
                                <FontAwesomeIcon icon={faTrashAlt} />&nbsp;Vyčistit
                            </Button>
                        </Col>
                        <Col md={4} sm={6} className="d-flex justify-content-center">
                            <Button variant="outline-primary" onClick={onReupload} className="w-100">
                                <FontAwesomeIcon icon={faUpload} />&nbsp;Vyčistit a nahrát další
                            </Button>
                        </Col>
                    </Row>
                </>
            ) : (
                <p><FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />&nbsp;Je nutné označit alespoň jeden prvek pro export.</p>
            )}
        </div>
    );
}

export default GPXExportData;
