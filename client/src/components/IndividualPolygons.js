import React from 'react';
import { Tabs, Tab, Form } from 'react-bootstrap';

function IndividualPolygons({ polygons }) {
  return (
    <Tabs defaultActiveKey="polygon0" id="polygon-tabs">
      {polygons.map((polygon, index) => (
        <Tab 
          eventKey={`polygon${index}`} 
          title={`Polygon ${index + 1}${polygon.name !== `Polygon ${index + 1}` ? ` (${polygon.name})` : ''}`} 
          key={index}
        >
          <Form.Control as="textarea" value={polygon.wkt} readOnly rows="5" />
        </Tab>
      ))}
    </Tabs>
  );
}

export default IndividualPolygons;