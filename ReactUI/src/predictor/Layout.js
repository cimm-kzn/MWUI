import React from 'react';
import { Tabs, Icon } from 'antd';
import { MarvinEditorView, PageStepsView, LoaderView, ErrorView } from '../base/wrapper';
import { MainLayout } from '../components';
import { SavedTaskPage } from './components';

const TabPlane = Tabs.TabPane;

const Main = ({ children }) => (
  <MainLayout>
    <MarvinEditorView />
    <LoaderView />
    <ErrorView />
    <Tabs defaultActiveKey="1">
      <TabPlane tab={<span><Icon type="file-add" />Create task</span>} key="1">
        <PageStepsView />
        {children}
      </TabPlane>
      <TabPlane tab={<span><Icon type="file-add" />Saved tasks</span>} key="2">
        <SavedTaskPage />
      </TabPlane>
      <TabPlane />
    </Tabs>
  </MainLayout>
);

export default Main;
