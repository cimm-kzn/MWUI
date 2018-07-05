import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

const ListResult = ({ props, data, fields: { key, value } }) => (
  <List
    header={<div>Header</div>}
    footer={<div>Footer</div>}
    dataSource={data}
    renderItem={item => (<List.Item>{item[key]} : {item[value]}</List.Item>)}
    {...props}
  />
);

ListResult.proptypes = {
  props: PropTypes.object,
  data: PropTypes.array,
  fields: PropTypes.object,
};

ListResult.defaultProps = {
  props: PropTypes.object,
  data: null,
  fields: {
    key: 'key',
    value: 'value',
  },
};

export default ListResult;
