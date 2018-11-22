import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const TableResult = ({ props, data, fields, title, description }) => (
  <div>
    { title && <h3 style={{ textAlign: 'left' }}>{ title }</h3> }
    { description && <h4 style={{ textAlign: 'left' }}>{ description }</h4> }
    <Table
      columns={fields}
      dataSource={data}
      {...props}
    />
  </div>
);

TableResult.proptypes = {
  props: PropTypes.object,
  title: PropTypes.string,
  description: PropTypes.string,
  data: PropTypes.array,
  fields: PropTypes.object,
};

TableResult.defaultProps = {
  props: PropTypes.object,
  title: '',
  description: '',
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
