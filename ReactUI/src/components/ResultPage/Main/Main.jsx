import React from 'react';
import { Row } from 'react-bootstrap';
import Header from '../Header';
import ResultList from '../ResultList';

export const Main = () =>
  (
    <Row>
      <Header />
      <hr />
      <ResultList />
    </Row>
  );
