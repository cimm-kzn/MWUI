import React, { createElement } from 'react';
import { Tabs } from 'antd';
import { forIn, uniqueId } from 'lodash';
import ListResult from './ListResult';
import TableResult from './TableResult';
import ChartResult from './ChartResult';

const TabPane = Tabs.TabPane;

const components = {
  list: ListResult,
  table: TableResult,
  charts: ChartResult,
};

const Comp = ({ keys, data }) => {
  const Component = components[keys];
  return <Component key={uniqueId('comp_')} {...data} />;
};

const JsonTabs = ({ json }) => (
  <Tabs defaultActiveKey="1">
    {
      json && Object.keys(json).map(key =>
        <TabPane tab={json[key].tabName} key={key}>
          <Comp keys={key} data={json[key]} />
        </TabPane>)
    }
  </Tabs>
);

export default JsonTabs;
