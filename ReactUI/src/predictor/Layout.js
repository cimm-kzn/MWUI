import React from 'react';
import { MarvinEditorView, PageStepsView, LoaderView, ErrorView } from '../base/wrapper';
import { Layout } from 'antd';
import { MainLayout } from '../components';

const { Header, Footer, Sider, Content } = Layout;

const Main = ({ children }) => (
  <MainLayout>
    <PageStepsView />
    <MarvinEditorView />
    <LoaderView />
    <ErrorView />
    {children}
  </MainLayout>
);

export default Main;
