import queryString from 'query-string';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { connectRequest } from 'redux-query';
import { getTasks } from '../../../core/queries';
import { withRouter } from 'react-router-dom';
import Header from './Header';
import { modal } from '../../../core/actions/modal';
import { addModelErr, addSolvErr, selectAll, deselectAll, deleteSelected, deleteAllTasks } from '../../../core/actions/tasks';
import { deleteTaskOuery, modellingStructuresQuery, revalidatingStructuresQuery } from '../../../core/actions/queries';
import { triggerConditionModal } from '../../../core/actions/modalConditionSelect';
import { URL } from '../../../config';

const mapStateToProps = state => ({
  tasks: state.tasks,
});

const mapDispatchToProps = (dispatch, props) => ({
  addTask: () => dispatch(modal(true)),
  addModelErr: id => dispatch(addModelErr(id)),
  addSolvErr: id => dispatch(addSolvErr(id)),
  selectAll: () => dispatch(selectAll()),
  deselectAll: () => dispatch(deselectAll()),
  deleteSelected: (arr) => {
    dispatch(deleteTaskOuery(arr)).then((result) => {
      if (result.status >= 200 && result.status < 300) {
        dispatch(deleteSelected(arr));
      }
    });
  },
  openComditionModal: () => dispatch(triggerConditionModal()),
  modellingStructures: (tasks) => {
    dispatch(modellingStructuresQuery(tasks)).then((result) => {
      if (result.status >= 200 && result.status < 300) {
        props.history.push({
          pathname: URL.RESULT,
          search: queryString.stringify({ task: result.transformed.task }),
        });
      }
    });
  },
  revalidateStructure: (tasks) => {
    dispatch(revalidatingStructuresQuery(tasks)).then((result) => {
      if (result.status >= 200 && result.status < 300) {
        props.history.push({
          pathname: URL.PREPARE,
          search: queryString.stringify({ task: result.transformed.task }),
        });
        props.forceRequest();
      }
    });
  },
});

export default withRouter(compose(connect(mapStateToProps, mapDispatchToProps),connectRequest(getTasks))(Header));
