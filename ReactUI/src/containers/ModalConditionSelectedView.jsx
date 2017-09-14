import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import ConditionsView from './ConditionsView';

class ModalConditionSelectedView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      models: [],
      temperature: 298,
      pressure: 1,
      additives: [],
    };
  }

  addSolv(id, arr, total) {
    this.setState({
      additives: arr,
      total,
    });
  }

  addModel(id, arr) {
    this.setState({
      models: arr,
    });
  }

  addAmount(id, additive, amount, total) {
    this.setState({
      additives: this.state.additives.map(add => (add.additive === additive ?
        { ...add, amount } : add)),
      total,
    });
  }

  addTemp(id, arr) {
    this.setState({
      temperature: arr,
    });
  }

  addPress(id, arr) {
    this.setState({
      pressure: arr,
    });
  }

  render() {
    return (
      <Modal show={this.props.isShow} onHide={this.props.closeModal} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Set conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ConditionsView
            col={12}
            {...this.props}
            models={this.state.models}
            temperature={this.state.temperature}
            pressure={this.state.pressure}
            additives={this.state.additives}
            addSolv={this.addSolv.bind(this)}
            addModel={this.addModel.bind(this)}
            addAmount={this.addAmount.bind(this)}
            addTemp={this.addTemp.bind(this)}
            addPress={this.addPress.bind(this)}
            total={this.state.total}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.props.setCondition(this.state)}>Set conditions</Button>
          <Button onClick={this.props.closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ModalConditionSelectedView.propTypes = {
  isShow: PropTypes.bool,
  closeModal: PropTypes.func,
  setCondition: PropTypes.func,
};

ModalConditionSelectedView.defaultProps = {
  isShow: false,
};

export default ModalConditionSelectedView;

