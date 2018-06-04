import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Pagination, BackTop } from 'antd';
import { ResultItem, ModalIncrease } from '../../components';
import { getRequest, getResults } from '../core/selectors';
import {
  SAGA_CREATE_TASK,
  SAGA_INIT_RESULT_PAGE,
} from '../core/constants';


class ResultPage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.initPage();
  }

  render() {
    const {
      results,
      showIncreaseModel,
      onSearchImg,
      request: { loading, error },
    } = this.props;

    return !loading && !error && results && (
      <div
        style={{ padding: '50px 0', background: 'white' }}
      >
        {results && results.map((result, count) =>
          (<ResultItem
            count={count}
            base64={result.base64}
            onClickIcrease={() => showIncreaseModel(result.base64)}
            result={result.models[0].results}
            onSearchImage={() => onSearchImg(result.data)}
          />),
        )
        }
        <BackTop />
      </div>
    );
  }
}

ResultPage.propTypes = {

};

const mapStateToProps = state => ({
  results: getResults(state),
  request: getRequest(state),
});

const mapDispatchToProps = dispatch => ({
  showIncreaseModel: () => null,
  onSearchImg: data => dispatch({ type: SAGA_CREATE_TASK, data }),
  initPage: () => dispatch({ type: SAGA_INIT_RESULT_PAGE }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ResultPage);
