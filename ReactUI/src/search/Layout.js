import React from 'react';
import { MainLayout } from '../components';
import { MarvinEditorView, PageStepsView, LoaderView, ErrorView } from '../base/wrapper';

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
