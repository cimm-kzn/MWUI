import React from 'react';
import { MainLayout } from '../components';
import { MarvinEditorView, PageStepsView, LoaderView, ErrorView } from '../base/wrapper';
import Searcher from './pages/IndexPage';
import { Layout } from 'antd';

const Main = ({ children }) => (
  <MainLayout>
    <PageStepsView />
    <Searcher />
    <MarvinEditorView />
    <LoaderView />
    <ErrorView />
    <div
      style={{ padding: '50px 0', background: 'white' }}
    >
      {children}
    </div>
  </MainLayout>
);

export default Main;
