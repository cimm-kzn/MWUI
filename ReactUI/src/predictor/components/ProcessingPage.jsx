import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Icon } from 'antd';
import styled from 'styled-components';
import { getProcess, getSavedTasks } from '../core/selectors';
import { URLS } from '../../config';

const ProcessStatus = styled.span`
  padding: 5px;
  background: #f5222d;
  border-radius: 3px;
  color: white;
`;

const FinishStatus = styled.span`
  padding: 5px;
  background: #1890ff;
  border-radius: 3px;
  color: white;
`;

const ProcessingPage = ({ process, savedTasks }) => {
  const columns = [
    { title: '#', dataIndex: 'id', key: 'id' },
    { title: 'task',
      dataIndex: 'task',
      key: 'task',
      render: (text, record) => (record.status !== 'Processing' ? <Link to={`${URLS.RESULT}?task=${text}`}>{text}</Link> : text),

    },
    { title: 'date', dataIndex: 'date', key: 'date' },
    { title: 'status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        if (text === 'Processing') {
          return (<ProcessStatus>{text}</ProcessStatus>);
        }
        return (<FinishStatus>{text}</FinishStatus>);
      }},
    { title: 'saved',
      dataIndex: 'saved',
      key: 'saved',
      render: (text, record) => (savedTasks.some(s => s.task === record.task) ? 'Yes' : 'No'),
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
  savedTasks: getSavedTasks(state),
});

export default connect(mapStateToProps)(ProcessingPage);
