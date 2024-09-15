import React, { useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

import Hero from './components/Hero';
import MainContent from './components/MainContent';
import AlertModal from './components/AlertModal';
import Footer from './components/Footer';
import useShapefileProcessing from './hooks/useShapefileProcessing';
import useDXFProcessing from './hooks/useDXFProcessing';
import useAlertModal from './hooks/useAlertModal';

function App() {
    // Použití custom hooku pro zpracování shapefile dat
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

    // Použití custom hooku pro zpracování DXF dat
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

    // Použití custom hooku pro zobrazení alert modalu
    const { alertModal, showAlert, hideAlert, confirmAction } = useAlertModal();

    // Wrapper pro setShapefileData s logováním
    const setShapefileData = useCallback((data) => {
        originalSetShapefileData(data);
    }, [originalSetShapefileData]);

    return (
        <div className="App d-flex flex-column min-vh-100">
            <Container fluid className="App">
                {/* Komponenta pro zobrazení hlavičky */}
                <Hero />
                {/* Hlavní obsah aplikace */}
                <MainContent
                    shapefileData={shapefileData}
                    setShapefileData={setShapefileData}
                    exportContent={exportContent}
                    onExportSettingsChange={handleExportSettingsChange}
                    onFeatureSelection={handleFeatureSelection}
                    onRefresh={() => showAlert('Potvrzení', 'Opravdu chcete vše smazat? Aktuální data budou nevratně ztracena.', 'refresh')}
                    onReupload={() => showAlert('Potvrzení', 'Opravdu chcete vymazat aktuální data a nahrát nový soubor?', 'reupload')}
                    fileUploadRef={fileUploadRef}

                    // Podpora pro DXF
                    dxfData={dxfData}
                    setDXFData={setDXFData}
                    dxfExportContent={dxfExportContent}
                    dxfLabelAttribute={dxfLabelAttribute}
                    onDXFLabelAttributeChange={setDXFLabelAttribute}
                    onDXFExportSettingsChange={handleDXFExportSettingsChange}
                    onDXFFeatureSelection={handleDXFFeatureSelection}
                    onDXFRefresh={() => showAlert('Potvrzení', 'Opravdu chcete smazat DXF data?', 'dxfRefresh')}
                    onDXFReupload={() => showAlert('Potvrzení', 'Opravdu chcete vymazat DXF data a nahrát nový DXF soubor?', 'dxfReupload')}
                />
            </Container>
            {/* Patička aplikace */}
            <Footer />
            {/* Modální okno pro potvrzení akcí */}
            <AlertModal
                show={alertModal.show}
                onHide={hideAlert}
                title={alertModal.title}
                message={alertModal.message}
                onConfirm={() => confirmAction(handleRefresh, handleReupload, handleDXFRefresh, handleDXFReupload)}
            />
        </div>
    );
}

export default App;