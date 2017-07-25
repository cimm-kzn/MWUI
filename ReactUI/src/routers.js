import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import IndexPage from './components/IndexPage';
import PreparePage from './components/PreparePage';
import ResultPage from './components/ResultPage';
import UserManual from './components/UserManual';
import {URL} from './constants';

class Routers extends Component {
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route path={URL.INDEX} component={ IndexPage } exact></Route>
                    <Route path={URL.PREPARE + ':id'} component={ PreparePage } exact></Route>
                    <Route path={URL.RESULT + ':id'} component={ ResultPage } exact></Route>
                    <Route path={URL.MANUAL} component={ UserManual } exact></Route>
                </Switch>
            </HashRouter>
        );
    }
}

export default Routers;
