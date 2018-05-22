import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Button, message, Row, Col } from 'antd';
import DynamicForm from './DynamicForm';
import { MARVIN_PATH_IFRAME, MARVIN_EDITOR_IS_EMPTY } from '../config';
import { exportCml, clearEditor, importCml } from '../base/marvinAPI';

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
    const { onCancel, visible, id, structures } = this.props;

    visible && this.init(structures, id);
    window.document.body.style.overflow = visible ? 'hidden' : 'auto';

    return (
      <Modal isShow={visible}>
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
              <Col md={10}>

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

DBFormModal.propTypes = {
  condition: PropTypes.object,
};

DBFormModal.defaultProps = {
  condition: {},
};

export default DBFormModal;
