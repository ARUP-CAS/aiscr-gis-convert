import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

import Hero from './components/Hero';
import MainContent from './components/MainContent';
import AlertModal from './components/AlertModal';
import Footer from './components/Footer';
import useShapefileProcessing from './hooks/useShapefileProcessing';
import useAlertModal from './hooks/useAlertModal';

function App() {
    const {
        shapefileData,
        setShapefileData,
        exportContent,
        fileUploadRef,
        handleExportSettingsChange,
        handleFeatureSelection,
        handleRefresh,
        handleReupload
    } = useShapefileProcessing();

    const { alertModal, showAlert, hideAlert, confirmAction } = useAlertModal();

    return (
        <div className="App d-flex flex-column min-vh-100">
            <Container fluid className="App">
                <Hero />
                <MainContent 
                    shapefileData={shapefileData}
                    setShapefileData={setShapefileData}
                    exportContent={exportContent}
                    onExportSettingsChange={handleExportSettingsChange}
                    onFeatureSelection={handleFeatureSelection}
                    onRefresh={() => showAlert('Potvrzení', 'Opravdu chcete vše smazat? Aktuální data budou nevratně ztracena.', 'refresh')}
                    onReupload={() => showAlert('Potvrzení', 'Opravdu chcete vymazat aktuální data a nahrát nový soubor?', 'reupload')}
                    fileUploadRef={fileUploadRef}
                />
            </Container>
            <Footer />
            <AlertModal
                show={alertModal.show}
                onHide={hideAlert}
                title={alertModal.title}
                message={alertModal.message}
                onConfirm={() => confirmAction(handleRefresh, handleReupload)}
            />
        </div>
    );
}

export default App;