import { connect } from 'react-redux';
import { modal } from '../../core/actions/modal';
import { deleteTask, structureCheck } from '../../core/actions/tasks';
import { StructureView } from '../../containers';

const mapDispatchToProps = dispatch => ({
  deleteTask: id => dispatch(deleteTask(id)),
  openEditor: (id, cml) => dispatch(modal(true, id, cml)),
  structureCheck: (id, value) => dispatch(structureCheck(id, value)),
});

export default connect(null, mapDispatchToProps)(StructureView);
