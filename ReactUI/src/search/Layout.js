import React from 'react';
import { MainLayout } from '../components';
import { MarvinEditorView, PageStepsView, LoaderView, ErrorView } from '../base/wrapper';
import { SearchInput } from './hoc';

const Main = ({ children }) => (
  <LoaderView>
    <MainLayout>
      <PageStepsView />
      <SearchInput />
      <MarvinEditorView />
      <ErrorView />
      {children}
    </MainLayout>
  </LoaderView>
);

export default Main;
