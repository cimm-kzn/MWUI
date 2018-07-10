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
  data: [],
  fields: [{
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
  }, {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  }],
};

export default TableResult;
