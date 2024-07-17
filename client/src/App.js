import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

import FileUpload from './components/FileUpload';
import ShapefileInfo from './components/ShapefileInfo';
import ExportData from './components/ExportData';
import Footer from './components/Footer';




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
                `${feature.editedLabel !== undefined ? feature.editedLabel : (feature.properties[exportSettings.labelAttribute] || '')},${exportSettings.epsg},${feature.wkt}`
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
        <div className="App d-flex flex-column min-vh-100">

            <Container fluid className="App">
                <Row className="justify-content-center py-4 bg-body-secondary">
                    <Col md="12" className="text-center">
                        <div className="mb-2">
                            {/* <FontAwesomeIcon icon={faExchangeAlt} size="4x" className="text-primary" /> */}
                            <img
                                src="./logo.png"
                                alt="Shapefile to WKT conversion"
                                className=""
                                style={{ width: '120px', height: 'auto' }}
                            />
                        </div>
                        <h1 className='display-3 mb-3'>Konvertor z shapefile na WKT</h1>
                        <p className='lead mb-4'>
                            Rychlý a jednoduchý nástroj pro převod vašich shapefile souborů do formátu WKT.
                        </p>
                        <p className='mb-0'>
                            <span className='fw-bold'>Nahrát. Převést. Exportovat.</span>
                        </p>
                    </Col>
                </Row>

                <Row className="justify-content-md-center pt-4">
                    <Col md="auto">
                        <h2 className='display-6'>1. Nahrát soubory SHP</h2>
                        <FileUpload setShapefileData={setShapefileData} />
                    </Col>
                </Row>

                {shapefileData && (
                    <>
                        <Row className="justify-content-center py-2">
                            <Col md="10">
                                <h2 className='display-6 mt-5 mb-4'>2. Informace o shapefilu</h2>
                                <ShapefileInfo
                                    shapefileData={shapefileData}
                                    onSettingsChange={handleExportSettingsChange}
                                    onFeatureSelection={handleFeatureSelection}
                                />
                            </Col>
                        </Row>
                        <Row className="justify-content-center py-2">
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
            <Footer />
        </div>
    );
}

export default App;