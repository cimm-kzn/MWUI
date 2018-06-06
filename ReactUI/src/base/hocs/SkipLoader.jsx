import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spin, Button } from 'antd';
import styled from 'styled-components';
import { succsessRequest } from '../actions';


const TipWpap = styled.div`
    background: white;
    display: inline-block;
    margin: 10px;
    padding: 10px;
    border: 1px dashed #1890ff; 
`;


const SkipLoader = ({ loading, skip, children }) => {
  const customTip = () => (
    <TipWpap>
      <div>Loading...</div>
      <div>
        To process in background press SKIP
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

SkipLoader.propTypes = {
  loading: PropTypes.bool,
  skip: PropTypes.func.isRequired,
};

SkipLoader.defaultProps = {
  loading: false,
};

const mapStateToProps = state => ({
  loading: state.request.loading,
});

const mapDispatchToProps = dispatch => ({
  skip: () => dispatch(succsessRequest()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SkipLoader);