import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const TableResult = ({ props, data, fields }) => (
  <Table
    columns={fields}
    dataSource={data}
    {...props}
  />
);

TableResult.proptypes = {
  props: PropTypes.object,
  data: PropTypes.array,
  fields: PropTypes.object,
};

TableResult.defaultProps = {
  props: PropTypes.object,
  data: null,
  fields: {
    key: 'key',
    value: 'value',
  },
};

export default TableResult;
