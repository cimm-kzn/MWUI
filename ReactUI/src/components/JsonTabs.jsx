import React from 'react';
import { Tabs } from 'antd';
import ImageResult from './ImageResult';
import TableResult from './TableResult';
import ChartResult from './ChartResult';
import StructureResult from './StructureResult';
import TextResult from './TextResult';

const TabPane = Tabs.TabPane;

const components = {
  table: TableResult,
  charts: ChartResult,
  image: ImageResult,
  structure: StructureResult,
  text: TextResult,
};

const Comp = ({ type, props }) => {
  const Component = components[type];
  return Component ? <Component key={`comp_${Math.random()}`} {...props} /> : null;
};

const JsonTabs = ({ json }) => (
  <Tabs defaultActiveKey="1">
    {
      json && json.map((item, key) =>
        (<TabPane tab={item.tabName} key={`tab_${key}`}>
          <Comp type={item.type} props={item} />
        </TabPane>))
    }
  </Tabs>
);

export default JsonTabs;
