import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button, Row, Col, Form } from 'antd';
import { MARVIN_PATH_IFRAME } from '../../config';
import { DBConditionList } from '../hoc';
import { modal } from '../../base/actions'
import { getModalState, getStructures } from '../core/selectors';

const Modal = styled.div`
  opacity: ${props => (props.isShow ? 1 : 0)};
  position: fixed;
  overflow: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${props => (props.isShow ? 100500 : -1)};
  outline: 0;
  background: rgba(0,0,0,0.4);
`;

const Content = styled.div`
    position: relative;
    margin: 20px;
    padding: 20px;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,.2);
    outline: 0;
`;

const Body = styled.div`
  position: relative;
  padding: 5px;
`;


class DBFormModal extends Component {
  render() {
    const { modal, structures, onCancel, onOk, form } = this.props;

    window.document.body.style.overflow = modal.visible ? 'hidden' : 'auto';

    return (
      <Modal isShow={modal.visible}>
        <Content>
          <div className="modal-header">
            <button
              type="button"
              className="close"
              onClick={onCancel}
            >
              &times;
            </button>
          </div>
          <Body>
            <Row gutter={30} >
              <Col md={14}>
                <iframe
                  title="marvinjs"
                  id="marvinjs"
                  data-toolbars="reaction"
                  src={MARVIN_PATH_IFRAME}
                  width="100%"
                  height={500}
                  style={{ border: '1px dashed #d9d9d9', padding: '10px' }}
                />
              </Col>
              <Col md={10} >
              <Form>
                <DBConditionList
                  form={form}
                  formComponent={Form}
                />
              </Form>
              </Col>
              <Col md={24}>
                <Button
                  size="large"
                  onClick={onCancel}
                >
                Cancel
                </Button>
                <Button
                  className="pull-right"
                  type="primary"
                  icon="upload"
                  size="large"
                >Edit</Button>
              </Col>
            </Row>
          </Body>
        </Content>
      </Modal>
    );
  }
}


const mapStateToProps = state => ({
  modal: getModalState(state),
});

const mapDispatchToProps = dispatch => ({
  onCancel: () => dispatch(modal(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(DBFormModal));
