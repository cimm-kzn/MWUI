import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, message, Input, Icon } from 'antd';
import { textToCml } from '../../base/marvinAPI';
import history from '../../base/history';
import { URLS } from '../../config';
import {
  SAGA_DRAW_STRUCTURE,
  SAGA_CREATE_TASK,
} from '../core/constants';

const Search = Input.Search;

message.config({
  top: 100,
  duration: 2,
});

const SearchInput = ({ drawStructure, onSearchFormSubmit, buttonURL }) => {
  const onSearch = (value) => {
    value && textToCml(value)
      .then(onSearchFormSubmit)
      .catch(() => message.error('Structure not found'));
  };

  const suffix = (<Icon
    type="picture"
    style={{
      cursor: 'pointer',
      paddingRight: '10px',
      fontSize: 16,
    }}
    onClick={drawStructure}
  />);

  return (
    <div >

      <Search
        placeholder="input search text"
        enterButton="Search"
        size="large"
        onSearch={onSearch}
        suffix={suffix}
        style={{
          marginBottom: 5,
        }}
      />
      <div>
        {buttonURL && buttonURL.map((link, i) =>
          <Button key={i} type="dashed" onClick={() => history.push(link.url)}>{link.name}</Button>,
        )}
      </div>
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

const mapStateToProps = () => ({
  buttonURL: [
    { name: 'Index page', url: URLS.INDEX },
    { name: 'Hisrory', url: URLS.HISTORY }],
});

const mapDispatchToProps = dispatch => ({
  drawStructure: () => dispatch({ type: SAGA_DRAW_STRUCTURE }),
  onSearchFormSubmit: data => dispatch({ type: SAGA_CREATE_TASK, data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchInput);
