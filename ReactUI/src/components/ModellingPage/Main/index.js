import { connect } from 'react-redux';
import { compose } from 'redux';
import { connectRequest, querySelectors } from 'redux-query';
import { withRouter } from 'react-router-dom';
import { getModels, getAdditives, getTasks } from '../../../core/queries';
import { Main } from './Main';

const mapStateToProps = state => ({
  tasks: state.tasks,
  additives: state.entities.additives,
  models: state.entities.models,
  constants: state.entities.constants,
  isLoading: querySelectors.isPending(state.queries, getTasks()),
});

export default withRouter(compose(
  connect(mapStateToProps),
  connectRequest(getModels),
  connectRequest(getAdditives),
  connectRequest(getTasks))(Main));
