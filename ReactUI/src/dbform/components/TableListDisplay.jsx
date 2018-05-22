import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Table, Button, Popconfirm } from 'antd';


const TableListDisplay = ({
  structures,
  editStructure,
  deleteStructure,
}) => {
  const columns = [{
    title: '#',
    dataIndex: 'structure',
    key: 'name',
  }, {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  }, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Actions',
    render: (text, record) => (
      <span>
        <Button
          icon="edit"
          onClick={() => editStructure(record.structure)}
        />
        <Popconfirm
          placement="top"
          title="Вы действительно хотите удалить запись?"
          onConfirm={() => deleteStructure(record.structure)}
          okText="Да"
          cancelText="Нет"
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
    />
  );
};


export default TableListDisplay;
