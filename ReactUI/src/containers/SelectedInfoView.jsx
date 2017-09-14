import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
margin: 7px;
display: inline-block;
`;

const SelectedInfoView = ({ tasks }) => {
  const len = tasks.filter(task => task.isCheking === 1).length;
  return (
    <Wrapper>
      { len ? <span> Selected: {len} item(s) </span> : '' }
    </Wrapper>
  );
};

export default SelectedInfoView;
