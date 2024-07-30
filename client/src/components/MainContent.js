import React from 'react';
import { Row, Col } from 'react-bootstrap';
import FileUpload from './FileUpload';
import ShapefileInfo from './ShapefileInfo';
import ExportData from './ExportData';

// Hlavní komponenta pro zobrazení obsahu aplikace
function MainContent({
    shapefileData,          // Data načteného shapefilu
    setShapefileData,       // Funkce pro nastavení dat shapefilu
    exportContent,          // Obsah pro export
    onExportSettingsChange, // Funkce pro změnu nastavení exportu
    onFeatureSelection,     // Funkce pro výběr prvků
    onRefresh,              // Funkce pro obnovení aplikace
    onReupload,             // Funkce pro opětovné nahrání souborů
    fileUploadRef           // Reference na komponentu pro nahrávání souborů
}) {
    // Funkce pro reset dat shapefilu
    const handleReset = () => {
        setShapefileData(null);
    };

    return (
        <>
            {/* Sekce pro nahrání souborů */}
            <Row className="justify-content-md-center pt-4">
                <Col md="auto">
                    <h2 className='display-6'>1. Nahrát soubory SHP</h2>
                    <FileUpload 
                        setShapefileData={setShapefileData} 
                        ref={fileUploadRef}
                        onReset={handleReset}
                    />
                </Col>
            </Row>

            {/* Pokud jsou načtena data shapefilu, zobrazí se další sekce */}
            {shapefileData && (
                <>
                    {/* Sekce s informacemi o shapefilu */}
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
                    {/* Sekce pro export dat */}
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