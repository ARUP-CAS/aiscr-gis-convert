import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

function ExportData({ exportContent, fileName }) {
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(exportContent);
    };

    const handleDownload = () => {
        const blob = new Blob([exportContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${fileName}.csv`);
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
                    <Row className="justify-content-center">
                        <Col md={4} sm={6} className="d-flex justify-content-center mb-2 mb-md-0">
                            <Button onClick={handleCopyToClipboard} className="w-100">
                                <FontAwesomeIcon icon={faCopy} />&nbsp;Kopírovat do schránky
                            </Button>
                        </Col>
                        <Col md={4} sm={6} className="d-flex justify-content-center">
                            <Button onClick={handleDownload} className="w-100">
                                <FontAwesomeIcon icon={faDownload} />&nbsp;Stáhnout CSV
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

export default ExportData;