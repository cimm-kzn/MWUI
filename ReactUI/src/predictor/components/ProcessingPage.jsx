import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Popconfirm, Button } from 'antd';
import { getProcess } from '../core/selectors';
import { URLS } from '../../config';

const ProcessingPage = ({ process, deleteTask }) => {
  const columns = [
    { title: '#', dataIndex: 'id', key: 'id' },
    { title: 'task',
      dataIndex: 'task',
      key: 'task',
      render: (text, record) => (<Link to={`${URLS.RESULT}?task=${record.task}`}>{record.task}</Link>),

    },
    { title: 'date', dataIndex: 'date', key: 'date' },
    { title: 'status', dataIndex: 'status', key: 'status' },
    { title: 'Action',
      dataIndex: '',
      key: 'x',
      render: (text, record) => (
        <span>
          <Popconfirm
            placement="top"
            title="Are you sure delete this structure?"
            onConfirm={() => deleteTask(record.task)}
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
      columns={columns}
      dataSource={process}
    />
  );
};

ProcessingPage.propTypes = {
  process: PropTypes.array,
};

const mapStateToProps = state => ({
  process: getProcess(state),
});

// const mapDispatchToProps = dispatch => ({
//   deleteTask: () => null,
// });

export default connect(mapStateToProps)(ProcessingPage);
