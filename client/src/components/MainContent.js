// src/components/MainContent.js
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import FileUpload from './FileUpload';
import ShapefileInfo from './ShapefileInfo';
import ExportData from './ExportData';

function MainContent({
    shapefileData,
    setShapefileData,
    exportContent,
    onExportSettingsChange,
    onFeatureSelection,
    onRefresh,
    onReupload,
    fileUploadRef
}) {
    return (
        <>
            <Row className="justify-content-md-center pt-4">
                <Col md="auto">
                    <h2 className='display-6'>1. Nahrát soubory SHP</h2>
                    <FileUpload setShapefileData={setShapefileData} ref={fileUploadRef} />
                </Col>
            </Row>

            {shapefileData && (
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
        </>
    );
}

export default MainContent;