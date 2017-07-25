import '../css/Pages.css'
import React, {Component} from 'react';
import {Col, PageHeader, ButtonToolbar, Button, Image, Row, Glyphicon, Table} from 'react-bootstrap';
import axios from 'axios';
import {API} from '../config';
import {URL} from '../constants';
import PrepareTaskItem from '../containers/PrepareTaskItem';
import {connect} from 'react-redux';
import queryString from 'query-string';
import {addBase64Arr} from '../functions/marvinAPI';
import {addTasks} from '../actions/tasks';
import Loader from 'react-loader';
import {REQUEST} from '../config';
import {Redirect} from 'react-router';


class ResultPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            taskId: "",
            isLoaded: false
        }
    }

    componentWillMount(){
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

    rewriteState(arr){
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
        return (
            <Row>
                <PageHeader>Result</PageHeader>

                <ButtonToolbar>
                    <Button bsStyle="primary" onClick={()=>{window.history.back()}}>
                        <Glyphicon glyph="chevron-left"/>
                        Back
                    </Button>
                    <Button bsStyle="primary" className="pull-right">
                        <Glyphicon glyph="play-circle"/>
                        Save
                    </Button>
                </ButtonToolbar>
                <hr/>
                <Col md={5}>
                    <Image src="img/startImage.svg"
                           thumbnail
                           className="ImagePointer"/>
                </Col>
                <Col md={7}>
                    <Table responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Table heading</th>
                            <th>Table heading</th>
                            <th>Table heading</th>
                            <th>Table heading</th>
                            <th>Table heading</th>
                            <th>Table heading</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>1</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                            <td>Table cell</td>
                        </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = (state) => ({ tasks: state.tasks });
export default connect(mapStateToProps)(ResultPage);
