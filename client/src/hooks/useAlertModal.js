import { useState } from 'react';

function useAlertModal() {
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', action: null });

    const showAlert = (title, message, action) => {
        setAlertModal({ show: true, title, message, action });
    };

    const hideAlert = () => {
        setAlertModal({ show: false, title: '', message: '', action: null });
    };

    const confirmAction = (onRefreshSHP, onReuploadSHP, onRefreshDXF, onReuploadDXF, onRefreshGPX, onReuploadGPX) => {
        const action = alertModal.action;
        hideAlert();
        
        // Pro SHP akce
        if (action === 'refresh') {
            onRefreshSHP();
        } else if (action === 'reupload') {
            onReuploadSHP();
        }
        
        // Pro DXF akce
        else if (action === 'dxfRefresh') {
            onRefreshDXF();
        } else if (action === 'dxfReupload') {
            onReuploadDXF();
        }

        // Pro GPX akce
        else if (action === 'gpxRefresh') {
            onRefreshGPX();
        } else if (action === 'gpxReupload') {
            onReuploadGPX();
        }
    };

    return {
        alertModal,
        showAlert,
        hideAlert,
        confirmAction
    };
}

export default useAlertModal;
