// src/components/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-light py-4 mt-5">
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-0">AIS CR 2024</p>
            <p className="mb-0"><small>Verze 1.0</small></p>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md="12" className="text-center">
            <div className="mb-2">
              <a href="https://www.aiscr.cz/" target='blank'>
                <img
                  src="./images/AISCR_CZ_H_CMYK_Pozitiv.png"
                  alt="Shapefile to WKT conversion"
                  className=""
                  style={{ width: '220px', height: 'auto' }}
                />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;