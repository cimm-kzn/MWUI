import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'antd';
import { MARVIN_PATH_IFRAME } from '../config';

const Modal = styled.div`
  opacity: ${props => (props.isShow ? 1 : 0)};
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${props => (props.isShow ? 10000 : -1)};
  overflow: auto;
  outline: 0;
  background: rgba(0,0,0,0.4);
`;

const Content = styled.div`
    position: relative;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,.2);
    outline: 0;
`;

const Body = styled.div`
  position: relative;
  padding: 5px;
`;

const Iframe = styled.iframe`
  border: 0;
`;

const MarvinEditor = ({
  modal,
  onCancel,
  onOk,
}) => {
  window.document.body.style.overflow = modal.visible ? 'hidden' : 'auto';
  return (
    <Modal isShow={modal.visible} role="dialog">
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
            <Iframe
              title="marvinjs"
              id="marvinjs"
              data-toolbars="reaction"
              src={MARVIN_PATH_IFRAME}
              width="100%"
              height={500}
            />
          </Body>
          <div className="modal-footer">
            <Button onClick={onOk}>Save</Button>
            <Button onClick={onCancel}>Discard</Button>
          </div>
        </Content>
      </div>
    </Modal>
  );
};

MarvinEditor.propTypes = {
  modal: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

MarvinEditor.defaultProps = {
  modal: null,
};

export default MarvinEditor;
