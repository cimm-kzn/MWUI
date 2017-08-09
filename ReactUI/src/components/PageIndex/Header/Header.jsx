import '../../../css/Pages.css'
import React, {Component} from 'react';
import {PageHeader, ButtonToolbar, Button, Glyphicon} from 'react-bootstrap';
import {URL} from '../../../constants'


export default class Header extends Component {
    render(){
        return (
            <div>
                <PageHeader>Modelling</PageHeader>
                <ButtonToolbar>
                    <Button href={'#' + URL.MANUAL}
                            bsStyle="info">User Manual
                    </Button>
                    <Button className="pull-right"
                            bsStyle="primary"
                            onClick={this.validateTasks}
                            disabled={!this.props.tasks.length}>
                        <Glyphicon glyph="share-alt"/>
                        Validate
                    </Button>
                    <Button className="pull-right"
                            onClick={this.addTask}>
                        <Glyphicon glyph="plus"/>
                        Add task
                    </Button>
                </ButtonToolbar>
            </div>
        )
    }
};