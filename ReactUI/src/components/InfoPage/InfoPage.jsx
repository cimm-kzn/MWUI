import React from 'react';
import { PageHeader, ButtonToolbar, Button, Row, Glyphicon } from 'react-bootstrap';

const InfoPage = ({ history }) => (
  <Row>
    <PageHeader>User manual</PageHeader>
    <ButtonToolbar>
      <Button
        bsStyle="info"
        onClick={() => {
          history.goBack();
        }}
      >
        <Glyphicon glyph="chevron-left" /> Back</Button>
    </ButtonToolbar>
    <hr />
    <p>This page a user manual</p>
  </Row>
);

export default InfoPage;
