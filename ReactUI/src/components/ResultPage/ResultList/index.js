import { connect } from 'react-redux';
import { compose } from 'redux';
import { connectRequest, querySelectors, errorSelectors } from 'redux-query';
import { withRouter } from 'react-router-dom';
import { getResults, getTasks } from '../../../core/queries'
import ResultList from './ResultList';

const mapStateToProps = (state) => ({
    tasks: state.tasks,
    isLoading: querySelectors.isPending(state.queries, getResults()),
    errorRequest: errorSelectors.responseBody(state.errors, getResults()),
  });

export default withRouter(compose(
  connect(mapStateToProps),
  connectRequest(getResults))(ResultList));
