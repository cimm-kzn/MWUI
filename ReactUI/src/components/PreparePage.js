import React, {Component} from 'react';
import {PageHeader, ButtonToolbar, Button, Row, Glyphicon, Col, Alert} from 'react-bootstrap';
import axios from 'axios';
import {API} from '../config';
import {URL} from '../constants';
import PrepareTaskItem from '../containers/PrepareTaskItem';
import {connect} from 'react-redux';
import queryString from 'query-string';
import {addBase64Arr} from '../functions/marvinAPI';
import {addTasks, addModelErr, addSolvErr} from '../actions/tasks';
import Loader from 'react-loader';
import {REQUEST} from '../config';
import {Redirect} from 'react-router';


class PreparePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            modelOptions: [],
            solventOptions: [],
            taskId: "",
            revalidate: false,
            modellingPage: false,
            alertVisible: false
        };
    }

    componentWillMount() {
        let taskId = queryString.parse(window.location.hash)['/prepare/task'];
        this.setState({taskId: taskId});
        let _this = this;

        this.getModelAdditives();
        setTimeout(function tick() {
            axios({
                method: 'get',
                url: API.PREPARE_TASK + taskId,
                withCredentials: true
            })
            .then(response => {
                _this.rewriteState(response.data.structures);
                return false;
            })
            .catch(error => {
                if (error.response.status === 512)
                    setTimeout(tick, REQUEST.TIME_OUT);
            });
        }, REQUEST.TIME_OUT);
    }

    getModelAdditives() {
        axios({
            method: 'get',
            url: API.ADDITIVES,
            withCredentials: true
        })
        .then(response => {
            this.setState({solventOptions: response.data.map((obj)=>({
                    label: obj.name,
                    value: obj.additive.toString(),
                    type: obj.type
                }))
            })
        })
        .catch(error => {console.log(error)});

        axios({
            method: 'get',
            url: API.MODELS,
            withCredentials: true
        })
        .then(response => {
            this.setState({modelOptions: response.data.map((obj)=>({
                    label: obj.name,
                    value: obj.model.toString(),
                    type: obj.type
                }))
            })
        })
        .catch(error => {console.log(error)});
    }

    handleAlertDismiss(){
        this.setState({alertVisible: false});
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
                            models: obj.models.filter(obj => obj.model === 1 || obj.model === 2) || [],
                            additives: obj.additives || [],
                            modelErr: false,
                            solventErr: false
                        }
                    }
                );
                this.props.dispatch(addTasks(dataRed));
                this.setState({isLoaded: true});
            }
        )
    }

    revalidate() {
        axios({
            method: 'post',
            url: API.PREPARE_TASK + this.state.taskId,
            withCredentials: true,
            data: this.props.tasks.map((obj) => {
                return {
                    data: obj.cml,
                    temperature: obj.temperature,
                    pressure: obj.pressure,
                    additives: obj.additives,
                    total: obj.total,
                    structure: 1
                }
            })
        })
        .then(response => {
            this.setState({revalidate: response.data.task});
            window.location.reload();
        })
        .catch(error => {console.log(error)});
    }

    modeling() {
        let err = false;

        this.props.tasks.forEach((obj) => {
            if (!obj.models.length) {
                this.props.dispatch(addModelErr(obj.id));
                err = true;
            }
            if (obj.total < 100) {
                this.props.dispatch(addSolvErr(obj.id));
                err = true;
            }
        });

        if (err) {
            this.setState({alertVisible:true});
            return false;
        }

        axios({
            method: 'post',
            url: API.RESULT + this.state.taskId,
            withCredentials: true,
            data: this.props.tasks.map((obj) => {
                return {
                    data: obj.cml,
                    temperature: obj.temperature,
                    pressure: obj.pressure,
                    additives: obj.additives,
                    total: obj.total,
                    structure: 1
                }

            })
        })
            .then(response => {
                this.setState({modellingPage: response.data.task})
            })
            .catch(error => {console.log(error)});
    }

    render() {
        const { isLoaded } = this.state;

        const buttonType = this.props.tasks.filter((obj)=> obj.checked === true).length;
        let {revalidate, modellingPage} = this.state;

        if (revalidate) return <Redirect to={URL.PREPARE + queryString.stringify({task: revalidate}) }/>;

        if (modellingPage) return <Redirect to={URL.RESULT + queryString.stringify({task: modellingPage}) }/>;

        return (
            <Row>
                <Loader loaded={isLoaded}>
                </Loader>
                <PageHeader>Prepare</PageHeader>
                <ButtonToolbar>
                    <Button bsStyle="primary" href={'#'+URL.INDEX}>
                        <Glyphicon glyph="chevron-left"/>
                        Back to index
                    </Button>
                    {this.props.tasks.length ?
                        buttonType ?
                        <Button bsStyle="danger" className="pull-right" onClick={this.revalidate.bind(this)}>
                            <Glyphicon glyph="play-circle"/>
                            Revalidate
                        </Button> :
                        <Button bsStyle="primary" className="pull-right" onClick={this.modeling.bind(this)}>
                            <Glyphicon glyph="play-circle"/>
                            Modeling
                        </Button>:
                        ""
                    }
                </ButtonToolbar>
                <hr/>

                { this.state.alertVisible ?
                    <Alert bsStyle="danger"  onDismiss={this.handleAlertDismiss.bind(this)}>
                        <h4>Error</h4>
                        <p>Please correct errors</p>
                    </Alert>: ""
                }


                {this.props.tasks.map(obj =>
                    <div>
                        <PrepareTaskItem key={obj.id}
                                         {...obj}
                                         solventOptions={this.state.solventOptions}
                                         modelOptions={this.state.modelOptions}
                        />
                        <Col lg={12}>
                            <hr/>
                        </Col>
                    </div>
                )}
            </Row>
        );
    }
}

const mapStateToProps = (state) => ({ tasks: state.tasks });
export default connect(mapStateToProps)(PreparePage);
