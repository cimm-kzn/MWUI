import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Table, Button, Popconfirm } from 'antd';


const TableListDisplay = ({
  structures,
  editStructure,
  deleteStructure
}) => {
  const columns = [{
    title: '#',
    dataIndex: 'structure',
    key: 'structure',
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
          onClick={() => editStructure(record.metadata)}
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

  return (
    <Table
      dataSource={structures}
      columns={columns}
      pagination={false}
    />
  );
};


export default TableListDisplay;
