import React, {Component} from 'react';
import {PageHeader, ButtonToolbar, Button,  Row, Glyphicon} from 'react-bootstrap';
import {URL} from '../constants'


class UserManual extends Component {
    render() {
        return (
            <Row>
                <PageHeader>User manual</PageHeader>
                <ButtonToolbar>
                    <Button href={'#'+URL.INDEX} bsStyle="info"><Glyphicon glyph="chevron-left"/> Back</Button>
                </ButtonToolbar>
                <hr/>
                <p>This page a user manual</p>
            </Row>
        );
    }
}

export default UserManual;
