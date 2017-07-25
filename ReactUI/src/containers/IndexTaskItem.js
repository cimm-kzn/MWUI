import '../css/Pages.css'
import React, {Component} from 'react';
import {Col, Button, Glyphicon, ButtonGroup, Thumbnail} from 'react-bootstrap';
import {triggerModal} from '../actions/modal';
import {deleteTask} from '../actions/tasks';
import {connect} from 'react-redux';


class IndexTaskItem extends Component {
    constructor(props) {
        super(props);
    }

    openEditor(id) {
        this.props.dispatch(triggerModal(true,id,this.props.cml));
    }

    deleteTask(id) {
        this.props.dispatch(deleteTask(id));
    }

    render() {
        return (
            <Col md={6}>
                <Thumbnail src={this.props.base64} >
                    <h3>Structure #{this.props.id + 1}</h3>
                    <hr/>
                    <ButtonGroup>
                        <Button bsStyle="primary" onClick={this.openEditor.bind(this, this.props.id)}><Glyphicon glyph="pencil"/> Edit</Button>&nbsp;
                        <Button bsStyle="default" onClick={this.deleteTask.bind(this, this.props.id)}><Glyphicon glyph="trash"/></Button>
                    </ButtonGroup>
                </Thumbnail>
            </Col>
        )
    }
}

export default connect()(IndexTaskItem);
