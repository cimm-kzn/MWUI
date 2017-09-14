import { connect } from 'react-redux';
import TaskList from './TaskList';
import { modal } from '../../../core/actions/modal';
import { deleteTasks } from '../../../core/actions/tasks';

const mapDispatchToProps = dispatch => ({
  deleteTask: id => dispatch(deleteTasks(id)),
  openEditor: (id, cml) => dispatch(modal(true, id, cml)),
});

export default connect(null, mapDispatchToProps)(TaskList);
