import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Tabs } from 'antd';
import {
  SAGA_INIT_TASK_CONTENT,
} from '../core/constants';
import { getSavedTasks } from '../core/selectors';

const Conditions = styled.div`
  border: 1px dashed #1890ff;
  padding: 10px;
  margin-bottom: 20px;
`;

const ResultImg = styled.img`
  width: 100%;
  border: 1px dashed #1890ff;
  padding: 10px;
`;


const TabPane = Tabs.TabPane;

class TaskContent extends Component {
  componentDidMount() {
    const { initPage, taskId } = this.props;
    taskId && initPage(taskId);
  }

  render() {
    const { tasks, taskId } = this.props;
    const task = tasks.filter(t => t.task === taskId)[0];

    return (
      <div>
        {task.structures && task.structures.map((result, key) =>
          (<Row>
            <Col span={10} style={{ paddingRight: '10px' }}>
              <ResultImg
                src={result.base64}
              />
            </Col>
            <Col span={14}>
              <Conditions>
                <p>Temperature(K): {result.temperature}</p>
                <p>Pressure(atm): {result.pressure}</p>
                { result.additives && result.additives.length &&
                (<div>
                  <p>Additives:</p>
                  {result.additives.map((item, i) =>
                    <p key={i + item.name}>{item.name} : { item.amount }</p>,
                  )}
                </div>)
                }
              </Conditions>
              <Tabs defaultActiveKey="1">
                { result.models && result.models.map((model, idx) =>
                  (<TabPane tab={model.name} key={idx.toString()}>
                    { model.results.map((res, i) =>
                      <p>{res.key}: {res.value}</p>,
                    )}
                  </TabPane>),
                )}
              </Tabs>
            </Col>
          </Row>),
        )}
      </div>
    );
  }
}

TaskContent.propTypes = {
  tasks: PropTypes.array,
  taskId: PropTypes.string,
  initPage: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  tasks: getSavedTasks(state),
});

const mapDispatchToProps = dispatch => ({
  initPage: task => dispatch({ type: SAGA_INIT_TASK_CONTENT, task }),
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskContent);
