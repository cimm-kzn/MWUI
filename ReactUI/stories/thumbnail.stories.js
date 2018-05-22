import React from 'react';
import { storiesOf } from '@storybook/react';
import { Form, Row, Col, Button } from 'antd';
import { Thumbnail } from '../src/components';
import { action } from '@storybook/addon-actions';
import 'antd/dist/antd.min.css';


storiesOf('Thumbnail', module)
  .add('default', () => (
    <Row>
      <Col span={6} offset={9}>
        <Thumbnail />
      </Col>
    </Row>
  ))
  .add('add revalidate ', () => (
    <Row>
      <Col span={6} offset={9}>
        <Thumbnail revalidate={true} />
      </Col>
    </Row>
  ));
