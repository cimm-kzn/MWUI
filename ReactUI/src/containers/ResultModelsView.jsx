import React from 'react';
import { Col, Panel } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ResultModelsView = ({ models }) => (
  <Col md={6}>
    {models.length ?
      <span>
        {models.map(model => (
          <Panel header={model.name} bsStyle="primary">
            <span>&#123;</span>
            {model.results.map(result => (<span>{result.key}: {result.value}</span>))}
            <span>&#125;</span>
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
