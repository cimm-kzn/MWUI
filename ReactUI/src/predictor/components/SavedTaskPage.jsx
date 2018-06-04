import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Upload, Icon, List, Card, Popconfirm, Row, Col, Table } from 'antd';
import { getTasks } from '../core/selectors';
import {
  SAGA_INIT_SAVED_TASKS_PAGE,
  SAGA_INIT_TASK_CONTENT,
} from '../core/constants';


const columns = [
  { title: 'task', dataIndex: 'task', key: 'task' },
  { title: 'date', dataIndex: 'date', key: 'date' },
  { title: 'Action', dataIndex: '', key: 'x', render: () => <a href="javascript:;">Delete</a> },
];


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
    if (record.structures) {
      return record.structures;
    }
    const { initExpandedContent } = this.props;
    initExpandedContent(record.task);
    return false;
  }


  render() {
    const { tasks } = this.props;

    return (
      <Table
        columns={columns}
        expandedRowRender={this.getTableExpandedContent}
        dataSource={tasks}
      />
    );
  }
}

SavedTaskPage.propTypes = {
  tasks: PropTypes.array,
  initPage: PropTypes.func.isRequired,
  initExpandedContent: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  tasks: getTasks(state),
});

const mapDispatchToProps = dispatch => ({
  initPage: () => dispatch({ type: SAGA_INIT_SAVED_TASKS_PAGE }),
  initExpandedContent: task => dispatch({ type: SAGA_INIT_TASK_CONTENT, task }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SavedTaskPage);
