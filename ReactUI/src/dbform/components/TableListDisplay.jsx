import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Table, Button, Popconfirm } from 'antd';
import { getRequest } from '../core/selectors';


const TableListDisplay = ({
  structures,
  editStructure,
  deleteStructure,
  request: { loading },
}) => {
  const columns = [{
    title: '#',
    dataIndex: 'metadata',
    key: 'metadata',
  }, {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  }, {
    title: 'Actions',
    render: (text, record) => (
      <span>
        <Button
          icon="edit"
          onClick={() => editStructure(record.metadata, record.data)}
        />
        <Popconfirm
          placement="top"
          title="Are you sure delete this structure?"
          onConfirm={() => deleteStructure(record.metadata)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="danger"
            icon="delete"
          />
        </Popconfirm>
      </span>
    ),
  }];

  return !loading && (
    <Table
      dataSource={structures}
      columns={columns}
      pagination={false}
    />
  );
};

TableListDisplay.propTypes = {
  structures: PropTypes.array,
  editStructure: PropTypes.func.isRequired,
  deleteStructure: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  request: getRequest(state),
});


export default connect(mapStateToProps)(TableListDisplay);
