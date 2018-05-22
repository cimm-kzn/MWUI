import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'antd';

const Error = ({ visible, message, cancelBtn, refreshBtn }) => visible && (
  <Modal
    visible={visible}
    title="Error"
    onOk={refreshBtn}
    onCancel={cancelBtn}
    footer={[
      <Button key="back" onClick={cancelBtn}>Cancel</Button>,
      <Button key="submit" type="primary" onClick={refreshBtn}>
                Refresh
      </Button>,
    ]}
  >
    <p>{ message }</p>
  </Modal>
);

Error.propTypes = {
  visible: PropTypes.bool,
  message: PropTypes.string,
  cancelBtn: PropTypes.func.isRequired,
  refreshBtn: PropTypes.func.isRequired,
};

export default Error;
