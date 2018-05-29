import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import store from './core/store';
import history from '../base/history';
import Main from './Layout';

/* Antd styles */
import 'antd/lib/button/style/index.css';
import 'antd/lib/message/style/index.css';
import 'antd/lib/select/style/index.css';
import 'antd/lib/tabs/style/index.css';
import 'antd/lib/back-top/style/index.css';
import 'antd/lib/tooltip/style/index.css';
import 'antd/lib/layout/style/index.css';
import 'antd/lib/spin/style/index.css';
import 'antd/lib/row/style/css';
import 'antd/lib/col/style/css';

export default (
  <Provider store={store}>
    <Router history={history}>
      <Main />
    </Router>
  </Provider>
);
