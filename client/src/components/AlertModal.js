import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function AlertModal({ show, onHide, title, message, onConfirm }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Zrušit
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                    Potvrdit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AlertModal;