import '../css/Pages.css'
import React, {Component} from 'react';
import {PageHeader, ButtonToolbar, Button, Row, Glyphicon} from 'react-bootstrap';
import {URL} from '../constants'
import {triggerModal} from '../actions/modal';
import {deleteTasks} from '../actions/tasks';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import IndexTaskItem from '../containers/IndexTaskItem';
import IndexDefault from '../containers/IndexDefault'
import axios from 'axios';
import {API} from '../config';
import queryString from 'query-string'


class IndexPage extends Component {
    constructor(props) {
        super(props);
        this.state = {redirect: false};
        this.validateTasks = this.validateTasks.bind(this);
        this.addTask = this.addTask.bind(this);
    }

    componentWillMount() {
        if (this.props.tasks.length) this.props.dispatch(deleteTasks());
    }

    validateTasks() {
        axios({
            method: 'post',
            url: API.CREATE_TASK,
            withCredentials: true,
            data: this.props.tasks.map((obj) => {return {data: obj.cml}})
        })
        .then(response => {this.setState({redirect: response.data.task})})
        .catch(error => {console.log(error)});
    }

    addTask() {
        this.props.dispatch(triggerModal(true));
    }

    render() {
        let {redirect} = this.state;
        if (redirect) return <Redirect to={URL.PREPARE + queryString.stringify({task: redirect}) }/>;

        return (
            <Row>
                <PageHeader>Modelling</PageHeader>
                <ButtonToolbar>
                    <Button href={'#' + URL.MANUAL} bsStyle="info">User Manual</Button>
                    <Button className="pull-right" bsStyle="primary" onClick={this.validateTasks}
                            disabled={!this.props.tasks.length}>
                        <Glyphicon glyph="share-alt"/>
                        Validate
                    </Button>
                    <Button className="pull-right" onClick={this.addTask}>
                        <Glyphicon glyph="plus"/>
                        Add task
                    </Button>
                </ButtonToolbar>
                <hr/>
                {this.props.tasks.length ?
                    this.props.tasks.map((obj) => <IndexTaskItem key={obj.id} {...obj}/>) : <IndexDefault/>}
            </Row>
        );
    }
}

const mapStateToProps = (state) => ({tasks: state.tasks});
export default connect(mapStateToProps)(IndexPage);
