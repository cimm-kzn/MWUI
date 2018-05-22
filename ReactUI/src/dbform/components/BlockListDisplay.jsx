import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Icon, List, Collapse, Popconfirm } from 'antd';

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
                onConfirm={() => deleteStructure(item.id)}
                okText="Yes"
                cancelText="No"
              >
                <Icon type="delete" />
              </Popconfirm>]}
        >
          <div style={{ lineHeight: 2, paddingLeft: 40 }}>
            Temperature: {item.condition && item.condition.temperature} K
          </div>
          <div style={{ lineHeight: 2, paddingLeft: 40 }}>Pressure: {item.condition && item.condition.pressure}
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
                {item.params && item.params.map((param, i) =>
                  <div key={i}>{param.key} : {param.value}</div>)}
              </div>
            </Panel>
          </Collapse>
        </Card>
      </List.Item>
    )}
  />
);


export default BlockListDisplay;
