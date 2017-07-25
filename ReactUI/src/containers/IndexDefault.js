import React, {Component} from 'react';
import {Col, Button} from 'react-bootstrap';
import {URL} from '../constants'

class IndexDefault extends Component {
    render() {
        return (
            <Col lg={12}>
                <h4>Start modelling</h4>
                <p>This application is for modeling the behavior of chemical structures and reactions under
                    different conditions.
                    Click on the image and add a structure of a substance or a reaction. After drawing the structure
                    click on the
                    'Validate' button.</p>
                <p>On the next page choose the conditions: model of reactions,
                temperature, pressure and etc,
                press the 'Modelling' button</p>
                <Button href={'#' + URL.MANUAL}>More</Button>
            </Col>
        )
    }
}

export default IndexDefault;
