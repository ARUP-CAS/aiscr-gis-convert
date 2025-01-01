import React, { useState, useCallback } from 'react';
import { Row, Col, Nav } from 'react-bootstrap';

// SHP
import FileUpload from './FileUpload';
import ShapefileInfo from './ShapefileInfo';
import ExportData from './ExportData';

// DXF
import DXFUpload from './DXFUpload';
import DXFInfo from './DXFInfo';
import DXFExportData from './DXFExportData';

// GPX
import GPXUpload from './GPXUpload';
import GPXInfo from './GPXInfo';
import GPXExportData from './GPXExportData';

function MainContent({

    // Props pro SHP
    shapefileData,
    setShapefileData,
    exportContent,
    onExportSettingsChange,
    onFeatureSelection,
    onRefresh,
    onReupload,
    fileUploadRef,

    // Props pro DXF
    dxfData,
    setDXFData,
    dxfExportContent,
    dxfLabelAttribute,
    onDXFLabelAttributeChange,
    onDXFExportSettingsChange,
    onDXFFeatureSelection,
    onDXFRefresh,
    onDXFReupload,

    // Props pro GPX
    gpxData,
    setGPXData,
    gpxExportContent,
    handleGPXFeatureSelection,
    handleGPXRefresh,
    handleGPXReupload

}) {
    const [activeUploadTab, setActiveUploadTab] = useState('shp');

    // Výchozí stav - všechny prvky jsou zaškrtnuté po načtení souboru
    const handleGPXDataLoaded = (data) => {
        setGPXData(data);
        const initialFeatures = data.features.map(feature => ({
            ...feature,
            export: true, // Výchozí hodnota - všechny prvky zaškrtnuté
        }));
        setGPXData((prev) => ({ ...prev, features: initialFeatures }));
    };

    const handleReset = () => {
        setShapefileData(null);
        setDXFData(null);
        setGPXData(null);
    };

    return (
        <>
            <Row className="justify-content-md-center pt-4">
                <Col md="6">
                    <h2 className='display-6'>1. Nahrát soubory</h2>
                    <Nav variant="tabs" className="d-flex justify-content-center mb-3 nav nav-tabs" activeKey={activeUploadTab} onSelect={(k) => setActiveUploadTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="shp">SHP</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="gpx">GPX</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {/* Nahrávání SHP souborů */}
                    {activeUploadTab === 'shp' && (
                        <FileUpload
                            setShapefileData={setShapefileData}
                            ref={fileUploadRef}
                            onReset={handleReset}
                        />
                    )}

                    {/* Nahrávání GPX souborů */}
                    {activeUploadTab === 'gpx' && (
                        <GPXUpload
                            onGPXDataLoaded={handleGPXDataLoaded}
                            onReset={handleReset}
                        />
                    )}
                </Col>
            </Row>

            {/* Sekce pro zobrazení informací o SHP souboru */}
            {shapefileData && activeUploadTab === 'shp' && (
                <>
                    <Row className="justify-content-center py-2">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>2. Informace o shapefilu</h2>
                            <ShapefileInfo
                                shapefileData={shapefileData}
                                onSettingsChange={onExportSettingsChange}
                                onFeatureSelection={onFeatureSelection}
                            />
                        </Col>
                    </Row>
                    <Row className="justify-content-center py-2">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>3. Export dat</h2>
                            <ExportData
                                exportContent={exportContent}
                                fileName={shapefileData?.fileName}
                                onRefresh={onRefresh}
                                onReupload={onReupload}
                            />
                        </Col>
                    </Row>
                </>
            )}

            {/* Sekce pro zobrazení informací o GPX souboru */}
            {gpxData && activeUploadTab === 'gpx' && (
                <>
                    <Row className="justify-content-center py-2">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>2. Informace o GPX souboru</h2>
                            <GPXInfo
                                data={gpxData.features}
                                onUpdate={(updatedFeatures) => {
                                    setGPXData((prev) => ({
                                        ...prev,
                                        features: updatedFeatures,
                                    }));
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="justify-content-center py-2">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>3. Export dat</h2>
                            <GPXExportData
                                gpxData={gpxData}
                                checkedFeatures={new Set(gpxData.features.filter(feature => feature.export).map(feature => feature.systemoveID))}
                                onRefresh={handleGPXRefresh}
                                onReupload={handleGPXReupload}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
}

export default MainContent;
