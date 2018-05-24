import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button, Row, Col, Form } from 'antd';
import { MARVIN_PATH_IFRAME } from '../../config';
import { DBConditionList } from '../hoc';
import { modal } from '../../base/actions';
import { getModalState, getConditionsByMetadata } from '../core/selectors';
import { SAGA_EDIT_STRUCTURE_ON_OK } from '../core/constants';

const Modal = styled.div`
  opacity: ${props => (props.isShow ? 1 : 0)};
  position: fixed;
  overflow: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${props => (props.isShow ? 500 : -1)};
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
  constructor(props) {
    super(props);
  }


  render() {
    const { modal, conditions, onCancel, onOk, form } = this.props;
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
              <Form>
                <Col md={10} >

                  <DBConditionList
                    form={form}
                    formComponent={Form}
                    data={conditions}
                  />
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
              </Form>
            </Row>
          </Body>
        </Content>
      </Modal>
    );
  }
}


const mapStateToProps = state => ({
  modal: getModalState(state),
  conditions: getConditionsByMetadata(state),
});

const mapDispatchToProps = dispatch => ({
  onCancel: () => dispatch(modal(false)),
  onOk: (conditions, metadata) => dispatch({ type: SAGA_EDIT_STRUCTURE_ON_OK, conditions, metadata }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(DBFormModal));
