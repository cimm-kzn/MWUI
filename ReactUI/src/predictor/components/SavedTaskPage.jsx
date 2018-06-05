import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Table, Popconfirm, Button, Pagination } from 'antd';
import { getSavedTasks, getSavedTasksPage } from '../core/selectors';
import {
  SAGA_INIT_SAVED_TASKS_PAGE,
  SAGA_INIT_TASK_CONTENT,
  SAGA_DELETE_SAVED_TASK,
  SAGA_GET_SAVED_TASKS_FOR_PAGE,
} from '../core/constants';
import TaskContent from './TaskContent';

const PaginationWrap = styled.div`
  text-align: right;
  margin-bottom: 20px;
`;

class SavedTaskPage extends Component {
  constructor(props) {
    super(props);
    this.getTableExpandedContent = this.getTableExpandedContent.bind(this);
  }

  componentDidMount() {
    const { initPage } = this.props;
    initPage();
  }

  getTableExpandedContent(record) {
    return <TaskContent taskId={record.task} />;
  }


  render() {
    const { tasks, deleteTask, pages, changePage } = this.props;

    const columns = [
      { title: 'task', dataIndex: 'task', key: 'task' },
      { title: 'date', dataIndex: 'date', key: 'date' },
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
      <div>
        <PaginationWrap>
          <Pagination
            pageSize={15}
            total={pages && pages.data}
            showQuickJumper
            onChange={changePage}
          />
        </PaginationWrap>
        <Table
          columns={columns}
          expandedRowRender={this.getTableExpandedContent}
          dataSource={tasks}
          pagination={false}
        />
      </div>

    );
  }
}

SavedTaskPage.propTypes = {
  tasks: PropTypes.array,
  initPage: PropTypes.func.isRequired,
  initExpandedContent: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  tasks: getSavedTasks(state),
  pages: getSavedTasksPage(state),
});

const mapDispatchToProps = dispatch => ({
  initPage: () => dispatch({ type: SAGA_INIT_SAVED_TASKS_PAGE }),
  initExpandedContent: task => dispatch({ type: SAGA_INIT_TASK_CONTENT, task }),
  deleteTask: task => dispatch({ type: SAGA_DELETE_SAVED_TASK, task }),
  changePage: page => dispatch({ type: SAGA_GET_SAVED_TASKS_FOR_PAGE, page }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SavedTaskPage);
