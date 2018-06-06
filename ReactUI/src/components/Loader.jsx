import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Spin, Button } from 'antd';
import styled from 'styled-components';

const TipWpap = styled.div`
    background: white;
    display: inline-block;
    margin: 10px;
    padding: 10px;
    border: 1px dashed #1890ff; 
`;


const Loader = ({ loading, skip, children }) => {
  const customTip = () => (
    <TipWpap>
      <div>Loading...</div>
      <div>
      If you skip process. Press button.
      </div>
      <Button onClick={skip}>SKIP</Button>
    </TipWpap>
  );

  const tip = customTip();

  return (
    <Spin
      size="large"
      tip={tip}
      spinning={loading}
    >
      { children }
    </Spin>
  );
};

Loader.propTypes = {
  loading: PropTypes.bool,
};

Loader.defaultProps = {
  loading: false,
};

export default Loader;
