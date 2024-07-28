// src/components/Hero.js
import React from 'react';
import { Row, Col } from 'react-bootstrap';

function Hero() {
    return (
        <Row className="justify-content-center py-4 bg-body-secondary">
            <Col md="12" className="text-center">
                <div className="mb-2">
                    <img
                        src="./logo.png"
                        alt="Shapefile to WKT conversion"
                        className=""
                        style={{ width: '120px', height: 'auto' }}
                    />
                </div>
                <h1 className='display-3 mb-3'>Konvertor z shapefile na WKT</h1>
                <p className='lead mb-4'>
                    Rychlý a jednoduchý nástroj pro převod vašich shapefile souborů do formátu WKT.
                </p>
                <p className='mb-0'>
                    <span className='fw-bold'>Nahrát. Převést. Exportovat.</span>
                </p>
            </Col>
        </Row>
    );
}

export default Hero;