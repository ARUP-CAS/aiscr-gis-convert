import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import FileUpload from './components/FileUpload';
import ShapefileInfo from './components/ShapefileInfo';
import ExportData from './components/ExportData';
import { Container, Row, Col } from 'react-bootstrap';


function App() {
    const [shapefileData, setShapefileData] = useState(null);
    const [exportSettings, setExportSettings] = useState({ epsg: '', labelAttribute: '' });
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [exportContent, setExportContent] = useState('');

    const handleExportSettingsChange = useCallback((settings) => {
        setExportSettings(settings);
    }, []);

    const handleFeatureSelection = useCallback((features) => {
        setSelectedFeatures(features);
    }, []);

    const generateExportContent = useCallback(() => {
        if (exportSettings.epsg && exportSettings.labelAttribute && selectedFeatures.length > 0) {
            const header = 'label,epsg,geometry';
            const rows = selectedFeatures.map(feature =>
                `${feature.properties[exportSettings.labelAttribute] || ''},${exportSettings.epsg},${feature.wkt}`
            );
            const content = [header, ...rows].join('\n');
            setExportContent(content);
        } else {
            setExportContent('');
        }
    }, [selectedFeatures, exportSettings]);

    useEffect(() => {
        generateExportContent();
    }, [generateExportContent]);

    return (
        <Container fluid className="App">
            <Row className="justify-content-center py-5 bg-body-secondary">
                <Col md="12">
                    <h1 className='display-1'>Shapefile to WKT</h1>
                    <p className='lead'>
                        Tento nástroj převede shapefile do WKT formátu a zobrazí jednotlivé polygony.
                    </p>
                </Col>
            </Row>

            <Row className="justify-content-md-center py-3">
                <Col md="auto">
                    <h2 className='display-6'>1. Nahrát soubor</h2>
                    <FileUpload setShapefileData={setShapefileData} />
                </Col>
            </Row>

            {shapefileData && (
                <>
                    <Row className="justify-content-center py-3">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>2. Informace o shapefilu</h2>
                            <ShapefileInfo
                                shapefileData={shapefileData}
                                onSettingsChange={handleExportSettingsChange}
                                onFeatureSelection={handleFeatureSelection}
                            />
                        </Col>
                    </Row>
                    <Row className="justify-content-center py-3">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>3. Export dat</h2>
                            <ExportData
                                exportContent={exportContent}
                                fileName={shapefileData.fileName}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
}

export default App;