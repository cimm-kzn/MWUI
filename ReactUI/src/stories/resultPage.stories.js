import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number, object } from '@storybook/addon-knobs/react';
import { Form, Row, Col } from 'antd';
import { ListResult, TableResult, ChartResult, JsonTabs } from '../components';
import json from './dataOfStories';
import 'antd/dist/antd.min.css';

const { list, table, charts } = json;

const stories = storiesOf('Storybook Knobs', module);
stories.addDecorator(withKnobs);

stories
  .add('List', () => {
    const props = {
      data: object('data', list.data),
      fields: object('fields', list.fields),
      props: {
        bordered: boolean('bordered', list.props.bordered),
        grid: object('grid', list.props.grid),
        split: boolean('split', list.props.split),
        pagination: boolean('pagination', list.props.pagination),
        header: text('header', list.props.header),
      },
    };

    object('json', list);

    return (
      <Row>
        <Col span={6} offset={9}>
          <ListResult {...props} />
        </Col>
      </Row>
    );
  })
  .add('Table', () => {
    const props = {
      data: object('data', table.data),
      fields: object('fields', table.fields),
    };

    object('json', table);

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
      data: object('data', charts.data),
      fields: object('fields', charts.fields),
    };

    object('json', charts);

    return (
      <Row>
        <Col span={6} offset={9}>
          <ChartResult {...props} />
        </Col>
      </Row>
    );
  });

const stories1 = storiesOf('Табы', module);
stories1.addDecorator(withKnobs);

stories1
  .add('Компонент', () => {
    // const props = {
    //   data: object('data', charts.data),
    //   fields: object('fields', charts.fields),
    // };

    object('json', json);

    return (
      <Row>
        <Col span={6} offset={9}>
          <JsonTabs json={json} />
        </Col>
      </Row>
    );
  });
