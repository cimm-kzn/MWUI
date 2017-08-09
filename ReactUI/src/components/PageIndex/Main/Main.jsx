import Header from '../Header'
import TaskList from '../TaskList'

import React, {Component} from 'react';
import { Row } from 'react-bootstrap';

export default class Main extends Component{
    render(){
        return(
            <Row>
                <Header/>
                <hr/>
                <TaskList/>
            </Row>
        )
    }
}