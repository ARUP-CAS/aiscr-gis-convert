import React, { useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

// Import hlavních komponent
import Hero from './components/Hero';
import MainContent from './components/MainContent';
import AlertModal from './components/AlertModal';
import Footer from './components/Footer';

// Import vlastních hooků
import useShapefileProcessing from './hooks/useShapefileProcessing';
import useDXFProcessing from './hooks/useDXFProcessing';
import useGPXProcessing from './hooks/useGPXProcessing';
import useAlertModal from './hooks/useAlertModal';

function App() {
    /**
     * Hook pro zpracování SHP dat.
     * Obsahuje stav a funkce pro správu shapefile souborů.
     */
    const {
        shapefileData,
        setShapefileData: originalSetShapefileData,
        exportContent,
        fileUploadRef,
        handleExportSettingsChange,
        handleFeatureSelection,
        handleRefresh,
        handleReupload
    } = useShapefileProcessing();

    /**
     * Hook pro zpracování DXF dat.
     * Obsahuje stav a funkce pro správu DXF souborů.
     */
    const {
        dxfData,
        setDXFData,
        dxfExportContent,
        dxfLabelAttribute,
        setDXFLabelAttribute,
        handleDXFExportSettingsChange,
        handleDXFFeatureSelection,
        handleDXFRefresh,
        handleDXFReupload
    } = useDXFProcessing();

    /**
     * Hook pro zpracování GPX dat.
     * Obsahuje stav a funkce pro správu GPX souborů.
     */
    const {
        gpxData,
        setGPXData,
        gpxExportContent,
        handleGPXFeatureSelection,
        handleGPXRefresh,
        handleGPXReupload
    } = useGPXProcessing();

    /**
     * Hook pro zobrazení a správu alert modalu.
     */
    const { alertModal, showAlert, hideAlert, confirmAction } = useAlertModal();

    /**
     * Wrapper pro setShapefileData s přidaným logováním.
     */
    const setShapefileData = useCallback((data) => {
        originalSetShapefileData(data);
    }, [originalSetShapefileData]);

    return (
        <div className="App d-flex flex-column min-vh-100">
            <Container fluid className="App">
                {/* Hlavní hlavička aplikace */}
                <Hero />
                
                {/* Hlavní obsah aplikace */}
                <MainContent
                    // Props pro SHP
                    shapefileData={shapefileData}
                    setShapefileData={setShapefileData}
                    exportContent={exportContent}
                    onExportSettingsChange={handleExportSettingsChange}
                    onFeatureSelection={handleFeatureSelection}
                    onRefresh={() => showAlert(
                        'Potvrzení', 
                        'Opravdu chcete vše smazat? Aktuální data budou nevratně ztracena.', 
                        'refresh'
                    )}
                    onReupload={() => showAlert(
                        'Potvrzení', 
                        'Opravdu chcete vymazat aktuální data a nahrát nový soubor?', 
                        'reupload'
                    )}
                    fileUploadRef={fileUploadRef}

                    // Props pro DXF
                    dxfData={dxfData}
                    setDXFData={setDXFData}
                    dxfExportContent={dxfExportContent}
                    dxfLabelAttribute={dxfLabelAttribute}
                    onDXFLabelAttributeChange={setDXFLabelAttribute}
                    onDXFExportSettingsChange={handleDXFExportSettingsChange}
                    onDXFFeatureSelection={handleDXFFeatureSelection}
                    onDXFRefresh={() => showAlert(
                        'Potvrzení', 
                        'Opravdu chcete smazat DXF data?', 
                        'dxfRefresh'
                    )}
                    onDXFReupload={() => showAlert(
                        'Potvrzení', 
                        'Opravdu chcete vymazat DXF data a nahrát nový DXF soubor?', 
                        'dxfReupload'
                    )}

                    // Props pro GPX
                    gpxData={gpxData}
                    setGPXData={setGPXData}
                    gpxExportContent={gpxExportContent}
                    onGPXFeatureSelection={handleGPXFeatureSelection}
                    onGPXRefresh={() => showAlert(
                        'Potvrzení', 
                        'Opravdu chcete smazat GPX data?', 
                        'gpxRefresh'
                    )}
                    onGPXReupload={() => showAlert(
                        'Potvrzení', 
                        'Opravdu chcete vymazat GPX data a nahrát nový GPX soubor?', 
                        'gpxReupload'
                    )}
                />
            </Container>
            
            {/* Patička aplikace */}
            <Footer />

            {/* Alert Modal pro potvrzení akcí */}
            <AlertModal
                show={alertModal.show}
                onHide={hideAlert}
                title={alertModal.title}
                message={alertModal.message}
                onConfirm={() => confirmAction(
                    handleRefresh, handleReupload,
                    handleDXFRefresh, handleDXFReupload,
                    handleGPXRefresh, handleGPXReupload
                )}
            />
        </div>
    );
}

export default App;
