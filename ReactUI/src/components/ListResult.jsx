import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

const ListResult = ({ props, data, fields: { key, value } }) => (
  <List
    dataSource={data}
    renderItem={item => (<Fragment><List.Item>{item[key]}:</List.Item><List.Item>{item[value]}</List.Item></Fragment>)}
    {...props}
  />
);

ListResult.proptypes = {
  props: PropTypes.object,
  data: PropTypes.array,
  fields: PropTypes.object,
};

ListResult.defaultProps = {
  props: {
    bordered: true,
    grid: {
      gutter: 16,
      column: 2,
    },
    split: true,
    pagination: false,
    header: null,
    footer: null,
  },
  data: null,
  fields: {
    key: 'key',
    value: 'value',
  },
};

export default ListResult;
