import '../css/Pages.css'
import 'rc-slider/assets/index.css';
import '../css/PrepareTaskItem.css';
import React, {Component} from 'react';
import {Col, Button, Glyphicon, ButtonGroup, Thumbnail, ListGroup, ListGroupItem} from 'react-bootstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Slider from 'rc-slider';
import {triggerModal} from '../actions/modal';
import {deleteTask, addModel, addTemp, addPress, addSolv, addAmount, addTotal} from '../actions/tasks';
import {connect} from 'react-redux';

//const Range = Slider.Range;

const tempMarks = {
    200: {
        style: {
            color: '#337ab7',
            marginLeft: '-14%'
        },
        label: <strong>200</strong>,
    },
    400: {
        style: {
            color: '#337ab7',
            marginLeft: '-16%'
        },
        label: <strong>400</strong>,
    },
    298: '298',
    273: '273'
};

const pressMarks = {
    1: {
        style: {
            color: '#337ab7',
            marginLeft: '-45%'
        },
        label: <strong>1</strong>,
    },
    6: {
        style: {
            color: '#337ab7',
            marginLeft: '-45%'
        },
        label: <strong>6</strong>,
    }
};

class PrepareTaskItem extends Component {
    constructor(props) {
        super(props);
        this.handleSelectSolvChange = this.handleSelectSolvChange.bind(this);
    }

    addLabel(obj) {
        return this.props.solventOptions.filter(o => {return o.value === obj})[0].label
    }

    handleSelectChange(solventValue) {
        let solv,
            total = 100;

        solventValue = solventValue.split(",");
        if (solventValue[0] !== "") {
            switch(solventValue.length){
                case 1:
                    solv = solventValue.map(obj => {return {additive: obj, amount: 100, label: this.addLabel(obj)}});
                    break;
                case 2:
                    solv = solventValue.map(obj => {return {additive: obj, amount: 50, label: this.addLabel(obj)}});
                    break;
                case 3:
                    solv = solventValue.map(obj => {return {additive: obj, amount: 33, label: this.addLabel(obj)}});
                    break;
                default:
                    return false;
            }
        }
        else {
            solv = [];
            total = 0;
        }
        this.props.dispatch(addSolv(this.props.id, solv, total))
    }

    handleSelectSolvChange(additive, value) {
        let amounts = this.props.additives.map(obj => obj.additive !== additive ? obj.amount: value);
        let sum = amounts.reduce((a, b) => a + b, 0);
        if(sum <= 100) this.props.dispatch(addAmount(this.props.id, additive, value, sum));
    }

    handleSelectChangeModel(modelValue) {
        let models;
        if(modelValue)
            models = modelValue.split(",").map(obj => {return {model: obj}});
        else
            models = [];

        this.props.dispatch(addModel(this.props.id, models));
    }

    handleTempChange(temp) {
        this.props.dispatch(addTemp(this.props.id, temp));
    }

    handlePressChange(temp) {
        this.props.dispatch(addPress(this.props.id, temp));
    }

    openEditor(id) {
        this.props.dispatch(triggerModal(true,id,this.props.cml));
    }

    deleteTask(id) {
        this.props.dispatch(deleteTask(id));
    }

    infoModels() {
        console.log('hi')
    }

    render() {
        let solvents;
        let solventLen = this.props.additives ? this.props.additives.length : 0;

        if(solventLen){
            solvents = <div>
                <h4>Selected solvents:</h4>
                {this.props.additives.map(obj =>
                    <span>
                        <span>{obj.label}: {obj.amount}%</span>
                        <Slider value={Number(obj.amount)} min={0} max={100}
                                onChange={(value)=> {this.handleSelectSolvChange(obj.additive, value)}}
                        />
                    </span>
                )}
                <span>Total: {this.props.total}%</span>
            </div>;
        }
        else
            solvents = "";

        return (
            <div>
                <Col md={7}>
                    <Thumbnail src={this.props.base64} className={this.props.checked ? 'error': ''}>
                        <hr/>
                        <ButtonGroup>
                            <Button bsStyle="primary"
                                    onClick={this.openEditor.bind(this,this.props.id)} >
                                <Glyphicon glyph="pencil"/>
                                Edit
                            </Button>
                            &nbsp;
                            <Button bsStyle="default" onClick={this.deleteTask.bind(this, this.props.id)} ><Glyphicon glyph="trash"/></Button>
                        </ButtonGroup>
                    </Thumbnail>

                </Col>
                <Col md={5}>
                    <ListGroup>
                        <ListGroupItem className={this.props.modelErr ? "error-check" : ""}>
                            <h4>Models <Glyphicon glyph="info-sign" onClick={this.infoModels.bind(this)}/></h4>
                            <Select multi
                                    simpleValue
                                    disabled={false}
                                    value={this.props.models ? this.props.models.map(obj => obj.model): ""}
                                    placeholder="Select your model(s)"
                                    options={this.props.modelOptions.filter((obj)=> obj.type === this.props.type)}
                                    onChange={this.handleSelectChangeModel.bind(this)} />
                        </ListGroupItem>
                        <ListGroupItem className="list-gr-item">
                            <h4>Temperature: {this.props.temperature}(K)</h4>
                            <Slider value={this.props.temperature}
                                    min={200}
                                    max={400}
                                    marks={tempMarks}
                                    onChange={this.handleTempChange.bind(this)}
                                    trackStyle={[{ backgroundColor: '#96dbfa' }]}
                            />
                        </ListGroupItem>
                        <ListGroupItem className="list-gr-item" >
                            <h4>Pressure: {this.props.pressure}(atm)</h4>
                            <Slider min={1}
                                    max={6}
                                    step={0.1}
                                    marks={pressMarks}
                                    value={this.props.pressure}
                                    onChange={this.handlePressChange.bind(this)}
                                    trackStyle={[{ backgroundColor: '#96dbfa' }]}
                            />
                        </ListGroupItem>
                        <ListGroupItem className="list-gr-item" header="Catalysts">
                            <Select multi
                                    simpleValue
                                    disabled={false}
                                    value={this.props.solventValue}
                                    placeholder="Select your catalyst(s)"
                                    options={this.props.solventOptions.filter(obj => obj.type === 1)}
                                    onChange={this.handleSelectChange.bind(this)} />
                        </ListGroupItem>
                        <ListGroupItem className={this.props.solventErr ? "error-check" : ""}
                                       header="Solvents">
                            <Select multi
                                    simpleValue
                                    disabled={false}
                                    value={this.props.additives ? this.props.additives.map(obj => obj.additive) : ""}
                                    placeholder="Select your solvent(s)"
                                    options={this.props.solventOptions.filter(obj => obj.type === 0) }
                                    onChange={this.handleSelectChange.bind(this)} />
                            { solvents }
                        </ListGroupItem >
                    </ListGroup>
                </Col>
            </div>
        );
    }
}

export default connect()(PrepareTaskItem);
