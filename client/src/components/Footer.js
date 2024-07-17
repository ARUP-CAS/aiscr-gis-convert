// src/components/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-light py-4 mt-5">
      <Container>
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; 2024 Konvertor z shapefile na WKT. Všechna práva vyhrazena.</p>
            <p className="mb-0"><small>Verze 1.0</small></p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;