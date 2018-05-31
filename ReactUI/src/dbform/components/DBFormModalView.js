import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Row, Col, Form } from 'antd';
import { MARVIN_PATH_IFRAME } from '../../config';
import { DBConditionList } from '../hoc';
import { modal } from '../../base/actions';
import { getModalState, getConditionsByMetadata } from '../core/selectors';
import { SAGA_EDIT_STRUCTURE_ON_OK } from '../core/constants';
import { normalizeDBFormData } from '../../base/functions';

const Modal = styled.div`
  opacity: ${props => (props.isShow ? 1 : 0)};
  position: fixed;
  overflow: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${props => (props.isShow ? 2 : -1)};
  outline: 0;
  background: rgba(0,0,0,0.4);
`;

const Content = styled.div`
    position: relative;
    padding: 20px;
    margin: 100px 0;
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
    this.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentWillUpdate(nextProps) {
    const { form, modal } = this.props;

    if (nextProps.modal.visible && !modal.visible) {
      form.resetFields();
    }
  }

  onSubmitForm(e) {
    e.preventDefault();

    const { form, onOk, modal } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        const conditions = normalizeDBFormData(values);
        onOk(modal.structure, conditions);
      }
    });
  }

  render() {
    const { modal, conditions, onCancel, form } = this.props;
    window.document.body.style.overflow = modal.visible ? 'hidden' : 'auto';

    return (
      <Modal isShow={modal.visible}>
        <div className="modal-dialog modal-lg">
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
              <Form onSubmit={this.onSubmitForm}>
                <Row gutter={24} >
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
                      htmlType="submit"
                      icon="upload"
                      size="large"
                    >Edit</Button>
                  </Col>
                </Row>
              </Form>
            </Body>
          </Content>
        </div>
      </Modal>
    );
  }
}

DBFormModal.propTypes = {
  modal: PropTypes.object,
  conditions: PropTypes.object,
  form: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  modal: getModalState(state),
  conditions: getConditionsByMetadata(state),
});

const mapDispatchToProps = dispatch => ({
  onCancel: () => dispatch(modal(false)),
  onOk: (structure, conditions) => dispatch({ type: SAGA_EDIT_STRUCTURE_ON_OK, conditions, structure }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(DBFormModal));
