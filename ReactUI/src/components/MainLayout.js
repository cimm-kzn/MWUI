import React, {Component} from 'react';
import {Grid} from 'react-bootstrap';
import EditorStructure from './EditorStructure'

class IndexApp extends Component {
    render() {
        return (
            <Grid>
                { this.props.children }
                <EditorStructure/>
            </Grid>
        );
    }
}

export default IndexApp;
