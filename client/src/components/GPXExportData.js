import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faTrashAlt, faUpload, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * Komponenta pro export dat GPX ve formátu CSV.
 * 
 * @param {Object} gpxData - GPX data obsahující seznam prvků a další informace.
 * @param {Function} onRefresh - Callback pro vymazání aktuálních dat.
 * @param {Function} onReupload - Callback pro vymazání dat a nahrání nového souboru.
 */
function GPXExportData({ gpxData, onRefresh, onReupload }) {
    const [exportContent, setExportContent] = useState('');

    /**
     * Generování obsahu pro export při změně dat.
     */
    useEffect(() => {
        if (!gpxData || !gpxData.features) {
            setExportContent('');
            return;
        }

        // Vytvoření hlavičky a řádků CSV.
        const header = `"label","epsg","geometry"`;
        const rows = gpxData.features
            .filter(feature => feature.export) // Zahrnout pouze označené prvky
            .map(feature => {
                const label = feature.label || ( feature.systemoveID || `Prvek`); // Výchozí label, pokud chybí pak systemoveID, jinak "Prvek"
                const geometry = feature.geometry; // WKT geometrie
                return `"${label}","4326","${geometry}"`;
            });

        // Spojení hlavičky a řádků do CSV formátu.
        const content = rows.length > 0 ? [header, ...rows].join('\n') : '';
        setExportContent(content);
    }, [gpxData]);

    /**
     * Zkopírování CSV obsahu do schránky.
     */
    const handleCopyToClipboard = () => {
        if (exportContent) {
            navigator.clipboard.writeText(exportContent);
        }
    };

    /**
     * Stažení CSV souboru.
     */
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
                    {/* Textarea s obsahem exportu */}
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

                    {/* Akční tlačítka */}
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

                    {/* Tlačítka pro vyčištění nebo znovunahrání */}
                    <hr className="my-4" />
                    <Row className="justify-content-center">
                        <Col md={4} sm={6} className="d-flex justify-content-center mb-2 mb-md-0">
                            <Button variant="outline-danger" onClick={() => onRefresh('gpxRefresh')} className="w-100">
                                <FontAwesomeIcon icon={faTrashAlt} />&nbsp;Vyčistit
                            </Button>
                        </Col>
                        <Col md={4} sm={6} className="d-flex justify-content-center">
                            <Button variant="outline-primary" onClick={() => onReupload('gpxReupload')} className="w-100">
                                <FontAwesomeIcon icon={faUpload} />&nbsp;Vyčistit a nahrát další
                            </Button>
                        </Col>
                    </Row>
                </>
            ) : (
                // Zobrazení upozornění, pokud není co exportovat
                <p><FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />&nbsp;Je nutné označit alespoň jeden prvek pro export.</p>
            )}
        </div>
    );
}

export default GPXExportData;
