// src/components/Hero.js
import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { NavodModal } from './NavodModal';

function Hero() {
    return (
        <Container fluid className="bg-body-secondary">
            <Row className="justify-content-center pt-4 bg-body-secondary">
                <Col md="12" className="text-center">
                    <div className="mb-2">
                        <a href="https://www.aiscr.cz/" target='blank'>
                            <img
                                src="./images/AISCR_CZ_H_CMYK_Pozitiv.png"
                                alt="AMČR GIS konvertor"
                                className=""
                                style={{ width: '220px', height: 'auto' }}
                            />
                        </a>
                    </div>
                    <h1 className='display-3 mb-3'>AMČR GIS konvertor</h1>
                    <p className='lead mb-4'>
                        Nástroj k převodu vybraných formátů geoprostorových dat do formátu WKT ve struktuře vhodné pro import do <a src="https://amcr.aiscr.cz/" target='blank'>systému AMČR</a>.
                    </p>
                </Col>
            </Row>
            <Row className="justify-content-center pb-4 bg-body-secondary">
                <Col md="12" className="text-center">
                    <NavodModal />
                </Col>
            </Row>
        </Container>
    );
}

export default Hero;
