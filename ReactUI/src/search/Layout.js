import React from 'react';
import { MainLayout } from '../components';
import { MarvinEditorView, PageStepsView, LoaderView, ErrorView } from '../base/wrapper';
import { SearchInput } from './hoc';

const Main = ({ children }) => (
  <MainLayout>
    <PageStepsView />
    <SearchInput />
    <MarvinEditorView />
    <LoaderView />
    <ErrorView />
    {children}
  </MainLayout>
);

export default Main;
