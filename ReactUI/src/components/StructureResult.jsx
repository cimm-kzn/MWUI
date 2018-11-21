import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { convertCmlToBase64 } from '../base/marvinAPI';


const StructureResult = ({ data, props }) => (<Card
  hoverable
  style={{ width: 240 }}
  cover={<img alt={props.alt} src={convertCmlToBase64(data)} />}
/>);

StructureResult.proptypes = {
  props: PropTypes.object,
  data: PropTypes.array,
};

StructureResult.defaultProps = {
  props: {
    alt: 'Not Found',
    size: 128,
  },
};

export default StructureResult;
