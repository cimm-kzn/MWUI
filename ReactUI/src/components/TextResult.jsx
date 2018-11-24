import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';

const TextResult = ({ description, title }) => (
  <Card title={title} >{ description }</Card>
);

TextResult.proptypes = {
  description: PropTypes.string,
  title: PropTypes.string,
};

TextResult.defaultProps = {
  description: '',
};

export default TextResult;
