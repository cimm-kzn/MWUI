import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';


const ImageResult = ({ data, props }) => (<Card
  hoverable
  style={{ width: 240 }}
  cover={<img alt={props.alt} src={data} />}
/>);

ImageResult.proptypes = {
  props: PropTypes.object,
  data: PropTypes.array,
};

ImageResult.defaultProps = {
  props: {
    alt: 'Not Found',
    size: 128,
  },
};

export default ImageResult;
