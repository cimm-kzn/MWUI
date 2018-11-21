import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number, object } from '@storybook/addon-knobs/react';
import { Form, Row, Col } from 'antd';
import { ImageResult, TableResult, ChartResult, JsonTabs } from '../components';
import json from './dataOfStories';
import 'antd/dist/antd.min.css';

const stories = storiesOf('Storybook Knobs', module);
stories.addDecorator(withKnobs);

stories
  .add('Image', () => {
    const props = {
      data: object('data', json[2].data),
      props: {
        alt: text('alt', 'Not Found'),
        size: number('size', 128),
      },
    };

    object('json', json[2]);

    return (
      <Row>
        <Col span={6} offset={9}>
          <ImageResult {...props} />
        </Col>
      </Row>
    );
  })
  .add('Table', () => {
    const props = {
      data: object('data', json[0].data),
      fields: object('fields', json[0].fields),
    };

    object('json', json[0]);

    return (
      <Row>
        <Col span={6} offset={9}>
          <TableResult {...props} />
        </Col>
      </Row>
    );
  })
  .add('Charts', () => {
    const props = {
      data: object('data', json[1].data),
      fields: object('fields', json[1].fields),
    };

    object('json', json[1]);

    return (
      <Row>
          <ChartResult {...props} />
      </Row>
    );
  });

const stories1 = storiesOf('Табы', module);
stories1.addDecorator(withKnobs);

stories1
  .add('Компонент', () => {

    object('json', json);

    return (
      <Row>
        <Col span={9} offset={6}>
          <JsonTabs json={json} />
        </Col>
      </Row>
    );
  });
