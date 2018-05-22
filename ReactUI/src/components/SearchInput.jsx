import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, message } from 'antd';
import { textToCml } from '../base/marvinAPI';
import history from '../base/history';

const ButtonWrap = styled.div`
  padding-top: 10px;
`;


const getInputStyle = {
  height: '46px',
  padding: '10px 16px',
  fontSize: '18px',
  lineHeight: '1.3333333',
  width: '100%',
  borderRadius: '0px',
  border: '1px solid #cccccc',
};

const SearchInputWrapper = styled.div`
  -webkit-box-shadow: 3px 3px 14px -4px rgba(0,0,0,0.75);
  -moz-box-shadow: 3px 3px 14px -4px rgba(0,0,0,0.75);
  box-shadow: 3px 3px 14px -4px rgba(0,0,0,0.75);
`;

const SubmitBtn = styled.button`
  height: 46px;
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.3333333;
  display: inline-block;
  margin-bottom: 0;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 0px;
`;

const Error = styled.span`
  color: red;
`;

message.config({
  top: 100,
  duration: 2,
});

export { getInputStyle, SearchInputWrapper, SubmitBtn, Error };

const SearchInput = ({ drawStructure, onSearchFormSubmit, buttonURL }) => {
  let inputText;
  const errorText = '';

  const submitForm = () => {
    inputText.value && textToCml(inputText.value)
      .then((cml) => { onSearchFormSubmit(cml); })
      .catch(() => message.error('Structure not found'));
  };

  return (
    <div className="row" >
      <SearchInputWrapper className="input-group input-group-lg">
        <input
          name="searchText"
          type="text"
          style={getInputStyle}
          ref={el => inputText = el}
          placeholder="Search for..."
          onKeyPress={e => (e.key === 'Enter' ? submitForm() : false)}
        />
        <div className="input-group-btn input-group-lg">
          <button
            onClick={() => drawStructure()}
            className="btn btn-default btn-left-right"
          >
            <span className="glyphicon glyphicon-picture" />
          </button>
          <SubmitBtn
            className="btn-primary"
            onClick={submitForm}
          >
            <span className="glyphicon glyphicon-search" />
          </SubmitBtn>
        </div>
        {errorText}
      </SearchInputWrapper>
      <ButtonWrap>
        {buttonURL && buttonURL.map(link =>
          <Button type="dashed" onClick={() => history.push(link.url)}>{link.name}</Button>,
        )}
      </ButtonWrap>
    </div>);
};

SearchInput.propTypes = {
  drawStructure: PropTypes.func.isRequired,
  onSearchFormSubmit: PropTypes.func.isRequired,
  buttonURL: PropTypes.arrayOf(PropTypes.object),
};

SearchInput.defaultProps = {
  buttonURL: null,
};

export default SearchInput;
