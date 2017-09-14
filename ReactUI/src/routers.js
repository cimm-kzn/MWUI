import React, { Component } from 'react';
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { entitiesReducer, queriesReducer, errorsReducer, queryMiddleware } from 'redux-query';
import { tasks } from './core/reducers/tasks';
import { triggerModal } from './core/reducers/modal';
import { fileUploadModal } from './core/reducers/fileUploadModal';
import { conditionSelectedModal } from './core/reducers/conditionSelectedModal';
import App from './App';
import { pointer } from './core/pointerMiddleware';
import { IndexPage, InfoPage, ModellingPage, ResultPage } from './components';
import { URL, requestConfig } from './config';

const reducer = combineReducers({
  tasks,
  modalConditionSelected: conditionSelectedModal,
  modalFileUpload: fileUploadModal,
  modal: triggerModal,
  queries: queriesReducer,
  entities: entitiesReducer,
  errors: errorsReducer,
});

const getQueries = state => state.queries;
const getEntities = state => state.entities;

const query = queryMiddleware(getQueries, getEntities, requestConfig);

const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(query, pointer)),
);

class Routers extends Component {
  render() {
    return (
      <Provider store={store}>
        <HashRouter>
          <App>
            <Route path={URL.INDEX} component={IndexPage} exact />
            <Route path={`${URL.PREPARE}:name?`} component={ModellingPage } />
            <Route path={`${URL.RESULT}:name?`} component={ResultPage} exact />
            <Route path={URL.MANUAL} component={InfoPage} exact />
          </App>
        </HashRouter>
      </Provider>
    );
  }
}

export default Routers;
