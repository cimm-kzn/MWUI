import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import store from './core/store';
import history from '../base/history';
import Main from './Layout';

export default (
  <Provider store={store}>
    <Router history={history}>
      <Main />
    </Router>
  </Provider>
);
