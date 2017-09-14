import React from 'react';
import { Row } from 'react-bootstrap';
import Header from '../Header';
import TaskList from '../TaskList';

const Main = () => (
  <Row>
    <Header />
    <TaskList />
  </Row>
);

export default Main;
