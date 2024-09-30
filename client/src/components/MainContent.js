import React, { useState, useCallback } from 'react';
import { Row, Col, Nav } from 'react-bootstrap';
import FileUpload from './FileUpload';
import DXFUpload from './DXFUpload';
import ShapefileInfo from './ShapefileInfo';
import DXFInfo from './DXFInfo';
import ExportData from './ExportData';  // Původní export pro SHP
import DXFExportData from './DXFExportData';  // Nový export pro DXF

function MainContent({
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
    onDXFReupload
}) {
    const [activeUploadTab, setActiveUploadTab] = useState('shp');
    const [checkedFeatures, setCheckedFeatures] = useState(new Set());  // Stav pro zaškrtnuté prvky pro DXF

    // Výchozí stav - všechny prvky jsou zaškrtnuté po načtení souboru
    const handleDXFDataLoaded = (data) => {
        setDXFData(data);
        const allFeatureIds = new Set(data.features.map((feature) => feature.systemoveID));
        setCheckedFeatures(allFeatureIds);  // Zaškrtneme všechny prvky jako výchozí
    };

    const handleDXFLabelAttributeChange = useCallback((attribute) => {
        onDXFLabelAttributeChange(attribute);
        onDXFExportSettingsChange({ labelAttribute: attribute });
    }, [onDXFLabelAttributeChange, onDXFExportSettingsChange]);

    // Funkce pro správu zaškrtnutí/odškrtnutí prvků
    const handleCheckedFeatureToggle = (systemoveID) => {
        setCheckedFeatures((prevChecked) => {
            const newChecked = new Set(prevChecked);
            if (newChecked.has(systemoveID)) {
                newChecked.delete(systemoveID);
            } else {
                newChecked.add(systemoveID);
            }
            return newChecked;
        });
    };

    const handleReset = () => {
        setShapefileData(null);
        setDXFData(null);
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
                        {/* <Nav.Item>
                            <Nav.Link eventKey="dxf">DXF</Nav.Link>
                        </Nav.Item>*/}
                    </Nav>

                    {/* Nahrávání SHP souborů */}
                    {activeUploadTab === 'shp' && (
                        <FileUpload
                            setShapefileData={setShapefileData}
                            ref={fileUploadRef}
                            onReset={handleReset}
                        />
                    )}

                    {/* Nahrávání DXF souborů */}
                    {activeUploadTab === 'dxf' && (
                        <DXFUpload
                            onDXFDataLoaded={handleDXFDataLoaded}
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

            {/* Sekce pro zobrazení informací o DXF souboru */}
            {dxfData && activeUploadTab === 'dxf' && (
                <>
                    <Row className="justify-content-center py-2">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>2. Informace o DXF souboru</h2>
                            <DXFInfo
                                dxfData={dxfData}
                                dxfLabelAttribute={dxfLabelAttribute}
                                onLabelAttributeChange={handleDXFLabelAttributeChange}
                                checkedFeatures={checkedFeatures}
                                onCheckedFeatureToggle={handleCheckedFeatureToggle}
                            />
                        </Col>
                    </Row>
                    <Row className="justify-content-center py-2">
                        <Col md="10">
                            <h2 className='display-6 mt-5 mb-4'>3. Export dat</h2>
                            {/* Export dat pro DXF */}
                            <DXFExportData
                                activeTab={activeUploadTab}
                                dxfData={dxfData}
                                dxfLabelAttribute={dxfLabelAttribute}
                                epsg={'4326'}  // Můžeme později dynamizovat výběr EPSG
                                checkedFeatures={checkedFeatures}
                                onRefresh={onDXFRefresh}
                                onReupload={onDXFReupload}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
}

export default MainContent;
