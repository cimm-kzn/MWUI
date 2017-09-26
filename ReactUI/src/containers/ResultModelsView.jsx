import React from 'react';
import { Col, Panel, Row } from 'react-bootstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const RightCol = styled(Col)`
text-align: right;
padding: 2px 2px;
`;

const LeftCol = styled(Col)`
text-align: left;
padding: 2px 2px;
`;

const ResultModelsView = ({ models }) => (
  <Col md={6}>
    {models.length ?
      <span>
        {models.map(model => (
          <Panel header={model.name} bsStyle="primary">
            {model.results.map(result => (<Row>
              <RightCol md={4}><b>{result.key}:</b></RightCol>
              <LeftCol md={8}><b>{result.value}</b></LeftCol>
            </Row>))}
          </Panel>
        ))}
      </span> : ''}
  </Col>
);

ResultModelsView.propTypes = {
  models: PropTypes.array,
};

ResultModelsView.defaultProps = {
  models: [],
};

export default ResultModelsView;
