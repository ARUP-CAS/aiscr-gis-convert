import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import FileUpload from './components/FileUpload';
import WktOutput from './components/WktOutput';
import IndividualPolygons from './components/IndividualPolygons';
import { Container, Row, Col } from 'react-bootstrap';

function App() {
  const [wktOutput, setWktOutput] = useState('');
  const [individualPolygons, setIndividualPolygons] = useState([]);

  return (
    <Container fluid className="App">
      <div className="main-content container-fluid g-0">
        <Row className="justify-content-center py-5 bg-body-secondary g-0">
          <Col md="12">
            <h1 className='display-1'>Shapefile to WKT</h1>
            <p className='lead'>
              Tento nástroj převede shapefile do WKT formátu a zobrazí jednotlivé polygony.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-md-center py-3 g-0">
          <Col md="auto">
            <h2 className='display-6'>1. Nahrát soubor</h2>
            <FileUpload setWktOutput={setWktOutput} setIndividualPolygons={setIndividualPolygons} />
          </Col>
        </Row>
        <Row className="justify-content-center py-3 g-0">
          <Col md="10">
            <h2 className='display-6 mt-5 mb-4'>3. WKT výstup</h2>
            <WktOutput wktOutput={wktOutput} />
          </Col>
        </Row>
        <Row className="justify-content-center py-3 g-0">
          <Col md="10">
            <h2 className='display-6 mt-5 mb-4'>4. Jednotlivé polygony</h2>
            <IndividualPolygons polygons={individualPolygons} />
          </Col>
        </Row>
      </div>

      <footer className="footer bg-body-secondary mt-5 container-fluid g-0">
        <Row className='justify-content-center'>
          <Col md="12">
            <p>&copy; 2024 VOJTĚCHOVSKÝ Tomáš, všechna práva vyhrazena.</p>
            <p>
              Tato aplikace byla vytvořena pro snadný a rychlý převod SHP souborů do WKT formátu.
              I když není oficiální, doufáme, že vám dobře poslouží a usnadní vaši práci.
            </p>
          </Col>
        </Row>
      </footer>
    </Container>
  );
}

export default App;