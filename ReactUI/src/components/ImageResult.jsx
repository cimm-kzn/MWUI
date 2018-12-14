import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';


const ImageResult = ({ data, title, description, props }) => (<Card
  hoverable
  title={title}
  style={{ width: props.size }}
  cover={<img alt={props.alt} src={data} />}
>
  <Card.Meta
    description={description}
  />
</Card>);

ImageResult.proptypes = {
  props: PropTypes.object,
  data: PropTypes.array,
  title: PropTypes.string,
  description: PropTypes.string,
};

ImageResult.defaultProps = {
  props: {
    alt: 'Not Found',
    size: '100%',
  },
};

export default ImageResult;
