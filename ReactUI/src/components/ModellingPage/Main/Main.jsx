import React from 'react';
import { Row } from 'react-bootstrap';
import Header from '../Header';
import TaskList from '../TaskList';

export const Main = props =>
  (
    <Row>
      <Header {...props} />
      <hr />
      <TaskList {...props} />
    </Row>
  );
