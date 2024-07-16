import React from 'react';
import { Form } from 'react-bootstrap';

function WktOutput({ wktOutput }) {
  return (

    <Form.Group>
      <Form.Control as="textarea" value={wktOutput} readOnly rows="10" />
    </Form.Group>
  );
}

export default WktOutput;
