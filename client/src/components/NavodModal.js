// src/components/NavodModal.js
import React, { useState } from 'react';
import { Modal, Button, Accordion } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '../config'; // Předpokládám, že config je v adresáři src

export function NavodModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const maxFileSizeMB = MAX_FILE_SIZE / (1024 * 1024);

  return (
    <>
      <Button variant="info" onClick={handleShow}>
        <FontAwesomeIcon icon={faBook} /> Návod
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Návod k použití</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Nástroj k převodu vybraných formátů geoprostorových dat do formátu WKT ve struktuře vhodné pro import do systému AMČR.
          </p>
          
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>1. Nahrát soubory SHP</Accordion.Header>
              <Accordion.Body>
                <ol>
                  <li>Vyberte soubory, které chcete převést. Žádný z nahraných souborů nemůže být větší než {maxFileSizeMB} MB.</li>
                  <li>Konvertor akceptuje data v souřadnicových systémech <strong>WGS 84</strong> (EPSG 4326) a <strong>S-JTSK / Krovak East North</strong> (EPSG 5514).</li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>2. Informace o souboru</Accordion.Header>
              <Accordion.Body>
                <ol>
                  <li>Načten soubor <strong>XXX</strong></li>
                  <li>
                    EPSG:
                    <ul>
                      <li>Zvolte kód EPSG souřadnicového systému zdrojových dat (zdrojová data informace o souřadnicovém systému neobsahují).</li>
                      <li>Volba souřadnicového systému <strong>neslouží</strong> k převodu dat mezi souřadnicovými systémy!</li>
                    </ul>
                  </li>
                  <li>
                    Název geometrie:
                    <ul>
                      <li>Zvolte pole, které obsahuje popisky jednotlivých prvků pro jejich snadné a jednoznačné rozlišení (např. identifikátor).</li>
                      <li>Obsah pole bude použit pro pole label ve výsledném CSV souboru.</li>
                      <li>Názvy prvků je možné editovat ručně v tabulce níže.</li>
                      <li>Zaškrtávacím polem Export můžete zvolit které geometrie se mají exportovat.</li>
                    </ul>
                  </li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>3. Export dat</Accordion.Header>
              <Accordion.Body>
                <ol>
                  <li>Náhled dat po převodu.</li>
                  <li>Data lze zkopírovat do schránky, nebo lze stáhnout CSV soubor připravený pro import do AMČR.</li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Zavřít
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
