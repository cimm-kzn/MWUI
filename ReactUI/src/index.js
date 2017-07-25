import React from 'react';
import ReactDOM from 'react-dom';
import Routers from './routers';
import MainLayout from './components/MainLayout';
import {Provider} from 'react-redux'
import {createStore} from 'redux';
import reducer from './reducers'

const store = createStore(reducer);

ReactDOM.render(
    <Provider store={store}>
        <MainLayout>
            <Routers />
        </MainLayout>
    </Provider>,
    document.getElementById('root')
);
