import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number, object, select } from '@storybook/addon-knobs/react';
import { Form, Row, Col, Table } from 'antd';
import { ImageResult, TableResult, ChartResult, JsonTabs } from '../components';
import json from './dataOfStories';
import 'antd/dist/antd.min.css';
import TextResult from '../components/TextResult';

const Header = ({ children }) => <h1 style={{ padding: '15px', margin: '0' }}>{ children }</h1>;
const SubHeader = ({ children }) => <h2 style={{ padding: '15px', margin: '0' }}>{ children }</h2>;

const stories = storiesOf('Виджеты', module);
stories.addDecorator(withKnobs);

stories
  .add('Image/Structure', () => {
    const props = {
      data: object('data', json[1].data),
      title: text('title', 'Pusheen'),
      description: text('description', 'Описание'),
      props: {
        alt: text('alt', 'Not Found'),
        size: text('size', '50%'),
      },
    };

    return (
      <Row>
        <Col span={12} offset={6} style={{ textAlign: 'center' }}>
          <Header>Компонент Image/Structure *</Header>
          <div>* - компоненты image и strucrure одинаковые за исключением посылаемых данных (data)</div>
          <ImageResult {...props} />
          <SubHeader>Основные свойства</SubHeader>
          <Table
            dataSource={[
              { id: 1, title: 'data', description: 'src изображения. Можно передать ссылку или изображение в base64 (Для type: Structure передается cml формат)', default: '[]' },
              { id: 2, title: 'tabName', description: 'Название таба. Обязателен иначе не будет отображаться в табах', default: '\'\'' },
              { id: 3, title: 'title', description: 'Заголовок изображения', default: '\'\'' },
              { id: 4, title: 'description', description: 'Описание изображения', default: '\'\'' },
              { id: 5, title: 'props', description: 'Дополнительные свойства компонента (см Ниже)', default: '{}' },
            ]}
            columns={
              [{
                title: '#',
                dataIndex: 'id',
              }, {
                title: 'Свойство',
                dataIndex: 'title',
              }, {
                title: 'Описание',
                dataIndex: 'description',
              }, {
                title: 'Дефолтное значени',
                dataIndex: 'default',
              }]
            }
            pagination={false}
          />
          <SubHeader>Свойства props</SubHeader>
          <Table
            dataSource={[
              { id: 1, title: 'alt', description: 'Текст если изображение не найдено', default: 'Not Found' },
              { id: 2, title: 'size', description: 'Ширина изображения в пикселях или процентах', default: '100%' },
            ]}
            columns={
              [{
                title: '#',
                dataIndex: 'id',
              }, {
                title: 'Свойство',
                dataIndex: 'title',
              }, {
                title: 'Описание',
                dataIndex: 'description',
              }, {
                title: 'Дефолтное значени',
                dataIndex: 'default',
              }]
            }
            pagination={false}
          />
          <div>Для того чтобы посмотреть как ведет себя компонент перейдите в правое боковое окно во вкладку KNOBS ------></div>
        </Col>
      </Row>
    );
  })
  .add('Table', () => {
    const props = {
      data: object('data', json[0].data),
      fields: object('fields', json[0].fields),
      title: text('title', 'Заголовок таблицы'),
      description: text('description', 'Описание таблицы'),
      props: {
        bordered: boolean('bordered', true),
        pagination: boolean('pagination', false),
        size: select('size', ['default', 'middle', 'small'], 'default'),
      },
    };

    return (
      <Row>
        <Col span={12} offset={6} style={{ textAlign: 'center' }}>
          <Header>Компонент Table</Header>
          <TableResult {...props} />
          <SubHeader>Основные свойства</SubHeader>
          <Table
            dataSource={[
              { id: 1, title: 'fields', description: 'Описание колонок таблицы (См Ниже)', default: '[]' },
              { id: 2, title: 'data', description: 'Данные для таблицы. В виде словаря с обьектами', default: '[]' },
              { id: 3, title: 'tabName', description: 'Название таба. Обязателен иначе не будет отображаться в табах', default: '\'\'' },
              { id: 4, title: 'title', description: 'Заголовок таблицы', default: '\'\'' },
              { id: 5, title: 'description', description: 'Описание таблицы', default: '\'\'' },
              { id: 6, title: 'props', description: 'Дополнительные свойства компонента (см Ниже)', default: '{}' },
            ]}
            columns={
              [{
                title: '#',
                dataIndex: 'id',
              }, {
                title: 'Свойство',
                dataIndex: 'title',
              }, {
                title: 'Описание',
                dataIndex: 'description',
              }, {
                title: 'Дефолтное значени',
                dataIndex: 'default',
              }]
            }
            pagination={false}
          />
          <SubHeader>Свойства fields</SubHeader>
          <Table
            dataSource={[
              { id: 1, title: 'title', description: 'Название колонки', default: '' },
              { id: 2, title: 'dataIndex', description: 'Ключ указывающии на ключ в данных (data)', default: '' },
            ]}
            columns={
              [{
                title: '#',
                dataIndex: 'id',
              }, {
                title: 'Свойство',
                dataIndex: 'title',
              }, {
                title: 'Описание',
                dataIndex: 'description',
              }, {
                title: 'Дефолтное значени',
                dataIndex: 'default',
              }]
            }
            pagination={false}
          />
          <SubHeader>Свойства props</SubHeader>
          <Table
            dataSource={[
              { id: 1, title: 'bordered', description: 'Внешняя рамка', type: 'boolean', default: 'false' },
              { id: 2, title: 'pagination', description: 'Как отображать паджинацию. Если значение false то не показывать', type: 'boolean', default: 'false' },
              { id: 3, title: 'scroll', description: 'Скроллинг таблицы. Подробнее в https://ant.design/components/table/', type: '{ x: number | true, y: number }', default: '-' },
              { id: 4, title: 'size', description: 'Размер таблицы', type: 'default | middle | small', default: 'default' },
            ]}
            columns={
              [{
                title: '#',
                dataIndex: 'id',
              }, {
                title: 'Свойство',
                dataIndex: 'title',
              }, {
                title: 'Описание',
                dataIndex: 'description',
              }, {
                title: 'Дефолтное значени',
                dataIndex: 'default',
              }]
            }
            pagination={false}
          />
          <div>Для того чтобы посмотреть как ведет себя компонент перейдите в правое боковое окно во вкладку KNOBS ------></div>
        </Col>
      </Row>
    );
  })
  .add('Text', () => {
    const props = {
      title: text('title', 'Заголовок'),
      description: text('description', 'Какой то текст'),
    };

    return (
      <Row>
        <Col span={12} offset={6} style={{ textAlign: 'center' }}>
          <Header>Компонент Table</Header>
          <TextResult {...props} />
          <SubHeader>Основные свойства</SubHeader>
          <Table
            dataSource={[
              { id: 1, title: 'title', description: 'Заголовок', default: '\'\'' },
              { id: 2, title: 'description', description: 'Текст', default: '\'\'' },
            ]}
            columns={
              [{
                title: '#',
                dataIndex: 'id',
              }, {
                title: 'Свойство',
                dataIndex: 'title',
              }, {
                title: 'Описание',
                dataIndex: 'description',
              }, {
                title: 'Дефолтное значени',
                dataIndex: 'default',
              }]
            }
            pagination={false}
          />
          <div>Для того чтобы посмотреть как ведет себя компонент перейдите в правое боковое окно во вкладку KNOBS ------></div>
        </Col>
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
