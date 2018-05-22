import React from 'react';
import { Button as BaseButton, Alert } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { MARVIN_EDITOR_IS_EMPTY } from '../config';


const Rigth = styled.div`
  position: absolute;
  top: 25px;
  right: 25px;
`;

const Button = styled(BaseButton)`
  border-color: #108ee9;
`;

const Thumbnail = ({ data, base64, onClickImage, revalidate }) => (
  <span
    className="thumbnail"
  >

    <Rigth>
      <Button
        type="primary"
        ghost
        shape="circle"
        icon="edit"
        size="large"
        onClick={() => onClickImage(data)}
      />
    </Rigth>
    <img
      style={{ width: '100%' }}
      src={base64}
      alt="Not found image"
    />
    {revalidate && <Alert message="Your structure has changed, please revalidate the structure" type="info" showIcon />}
  </span>
);

Thumbnail.propTypes = {
  data: PropTypes.string,
  base64: PropTypes.string,
  revalidate: PropTypes.bool,
  onClickImage: PropTypes.func.isRequired,
};

Thumbnail.defaultProps = {
  data: MARVIN_EDITOR_IS_EMPTY,
  base64: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22208%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20208%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_16310ca32d8%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A11pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_16310ca32d8%22%3E%3Crect%20width%3D%22208%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2267%22%20y%3D%22117.3%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E",
  revalidate: false,
};

export default Thumbnail;
