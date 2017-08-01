import '../css/Pages.css'
import React, {Component} from 'react';
import {Col, PageHeader, ButtonToolbar, Button, Image, Row, Glyphicon} from 'react-bootstrap';
import axios from 'axios';
import {API} from '../config';
import {connect} from 'react-redux';
import queryString from 'query-string';
import {addBase64Arr} from '../functions/marvinAPI';
import {addTasks} from '../actions/tasks';
import Loader from 'react-loader';
import {REQUEST} from '../config';


class ResultPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            taskId: "",
            isLoaded: false
        }
    }

    componentWillMount() {
        let taskId = queryString.parse(window.location.hash)['/result/task'];
        this.setState({taskId: taskId});
        let _this = this;

        setTimeout(function tick() {
            axios({
                method: 'get',
                url: API.RESULT + taskId,
                withCredentials: true
            }).then(response => {
                _this.rewriteState(response.data.structures);
                return false;
            }).catch(error => {
                if (error.response.status === 512) {
                    setTimeout(tick, REQUEST.TIME_OUT);
                }
            });
        }, REQUEST.TIME_OUT);
    }

    rewriteState(arr) {
        addBase64Arr(arr,
            (data) => {
                let dataRed = data.map((obj, key) => {
                        return {
                            id: key,
                            cml: obj.data,
                            base64: obj.base64,
                            temperature: obj.temperature,
                            pressure: obj.pressure,
                            type: obj.type,
                            checked: false,
                            models: obj.models || [],
                            additives: obj.additives || []
                        }
                    }
                );

                this.props.dispatch(addTasks(dataRed));
                this.setState({isLoaded: true});
            }
        )
    }

    render() {
        const {isLoaded} = this.state;
        return (
            <Row>
                <Loader loaded={isLoaded} />
                    <PageHeader>Result</PageHeader>

                    <ButtonToolbar>
                        <Button bsStyle="primary" onClick={() => {
                            window.history.back()
                        }}>
                            <Glyphicon glyph="chevron-left"/>
                            Back
                        </Button>
                        <Button bsStyle="primary" className="pull-right">
                            <Glyphicon glyph="play-circle"/>
                            Save
                        </Button>
                    </ButtonToolbar>
                    <hr/>
                    { this.props.cml ?
                        <div>
                            <Col md={5}>
                                <Image src={this.props.base64}
                                       thumbnail
                                       className="ImagePointer"/>
                            </Col>
                            <Col md={7}>
                                Result
                            </Col>
                        </div>
                        : "Result is empty"
                    }
            </Row>
        )
    }
}

const mapStateToProps = (state) => ({ tasks: state.tasks });
export default connect(mapStateToProps)(ResultPage);
