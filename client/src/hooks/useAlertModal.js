// src/hooks/useAlertModal.js
import { useState } from 'react';

function useAlertModal() {
    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', action: null });

    const showAlert = (title, message, action) => {
        setAlertModal({ show: true, title, message, action });
    };

    const hideAlert = () => {
        setAlertModal({ show: false, title: '', message: '', action: null });
    };

    const confirmAction = (onRefresh, onReupload) => {
        const action = alertModal.action;
        hideAlert();
        if (action === 'refresh') {
            onRefresh();
        } else if (action === 'reupload') {
            onReupload();
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