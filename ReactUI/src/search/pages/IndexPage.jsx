import React from 'react';
import { connect } from 'react-redux';
import { SearchInput } from '../../components';
import { URLS } from '../../config';
import {
  SAGA_DRAW_STRUCTURE,
  SAGA_CREATE_TASK,
} from '../core/constants';

const mapStateToProps = () => ({
  buttonURL: [
    { name: 'Index page', url: URLS.INDEX },
    { name: 'Info', url: URLS.INFO },
    { name: 'Hisrory', url: URLS.HISTORY }],
});

const mapDispatchToProps = dispatch => ({
  drawStructure: () => dispatch({ type: SAGA_DRAW_STRUCTURE }),
  onSearchFormSubmit: data => dispatch({ type: SAGA_CREATE_TASK, data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchInput);
