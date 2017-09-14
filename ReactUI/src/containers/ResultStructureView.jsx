import React from 'react';
import { Col, Thumbnail } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ResultStructureView = ({ base64 }) => (
  <Col md={6}>
    <Thumbnail src={base64} />
  </Col>
);

ResultStructureView.propTypes = {
  base64: PropTypes.string,
};

ResultStructureView.defaultProps = {
  base64: '',
};

export default ResultStructureView;
