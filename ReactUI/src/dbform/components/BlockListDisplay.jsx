import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Icon, List, Collapse, Popconfirm, Card as BaseCard } from 'antd';

const Card = styled(BaseCard)`
    .ant-card-body {
        padding: 0;
        margin: 0;
    }
`;

const Panel = Collapse.Panel;

const BlockListDisplay = ({
  gridSettings,
  structures,
  editStructure,
  deleteStructure,
}) => (
  <List
    grid={{ ...gridSettings, gutter: 20 }}
    dataSource={structures}
    renderItem={item => (
      <List.Item
        key={item.id}
      >
        <Card
          style={{ width: '100%' }}
          cover={<img alt="example" src={item.base64} />}
          actions={
            [<Icon type="edit" onClick={() => editStructure(item.id)} />,
              <Popconfirm
                placement="topLeft"
                title="Are you sure delete this structure?"
                onConfirm={() => deleteStructure(item.metadata)}
                okText="Yes"
                cancelText="No"
              >
                <Icon type="delete" />
              </Popconfirm>]}
        >
          <div style={{ lineHeight: 2, paddingLeft: 40 }}>
            Temperature: {item.temperature} K
          </div>
          <div style={{ lineHeight: 2, paddingLeft: 40 }}>Pressure: {item.pressure}
            atm
          </div>
          <Collapse bordered={false} style={{ height: 50, padding: 0, margin: 0 }}>
            <Panel
              header="Parameters"
              key="1"
              style={{
                position: 'absolute',
                width: '100%',
                background: 'white',
                zIndex: 1,
                border: '1px solid gray',
              }}
            >
              <div>
                <b>Descriptions:</b>
                {item.description && item.description.map((param, i) =>
                  <div key={i}>{param.key} : {param.value}</div>)}
              </div>
              <div>
                <b>Additives:</b>
                {item.additives && item.additives.map((param, i) =>
                  <div key={i}>{param.name} : {param.amount}</div>)}
              </div>
            </Panel>
          </Collapse>
        </Card>
      </List.Item>
    )}
  />
);


export default BlockListDisplay;
