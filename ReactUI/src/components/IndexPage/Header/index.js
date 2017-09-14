import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { URL } from '../../../config';
import Header from './Header';
import { modal } from '../../../core/actions/modal';
import { triggerFileUploadModal } from '../../../core/actions/modalFileUpload';
import { deleteTasks, selectAll, deselectAll, deleteSelected, deleteAllTasks } from '../../../core/actions/tasks'
import { validateTaskOuery } from '../../../core/actions/queries';

const mapStateToProps = state => ({
  tasks: state.tasks,
});

const mapDispatchToProps = (dispatch, props) => ({
  addTask: () => dispatch(modal(true)),
  validateQuery: tasks => dispatch(validateTaskOuery(tasks)).then((result) => {
    if (result.status > 200 && result.status < 300) {
      props.history.push({
        pathname: URL.PREPARE,
        search: queryString.stringify({ task: result.transformed.task }),
      });
    }
  }),
  selectAll: () => dispatch(selectAll()),
  deselectAll: () => dispatch(deselectAll()),
  deleteSelected: () => dispatch(deleteSelected()),
  deleteAll: () => dispatch(deleteAllTasks()),
  openFileUploadModal: () => dispatch(triggerFileUploadModal()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
