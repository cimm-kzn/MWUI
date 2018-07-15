import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip,
} from 'recharts';

const ChartResult = ({ props, data, fields }) => (
  <LineChart
    width={730}
    height={250}
    data={data}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="key" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
  </LineChart>
);

ChartResult.proptypes = {
  props: PropTypes.object,
  data: PropTypes.array,
  fields: PropTypes.object,
};

ChartResult.defaultProps = {
  props: PropTypes.object,
  data: [],
  fields: [{
    title: 'Key',
    dataIndex: 'key',
  }, {
    title: 'Value',
    dataIndex: 'value',
  }],
};

export default ChartResult;
