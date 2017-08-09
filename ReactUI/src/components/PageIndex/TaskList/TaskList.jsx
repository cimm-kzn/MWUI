import '../../../css/Pages.css'
import React, {Component} from 'react';
import {Col, Button, Glyphicon, ButtonGroup, Thumbnail} from 'react-bootstrap';

export default class TaskList extends Component {
    render(){
        return(
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