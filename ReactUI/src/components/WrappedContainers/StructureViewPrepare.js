import { connect } from 'react-redux';
import { modal } from '../../core/actions/modal';
import { deleteTask, structureCheck } from '../../core/actions/tasks';
import { StructureView } from '../../containers';
import { deleteTaskOuery } from '../../core/actions/queries';

const mapDispatchToProps = dispatch => ({
  deleteTask: id => dispatch(deleteTaskOuery([id])).then((result) => {
    if (result.status > 200 && result.status < 300) {
      dispatch(deleteTask(id));
    }
  }),
  openEditor: (id, cml) => dispatch(modal(true, id, cml)),
  structureCheck: (id, value) => dispatch(structureCheck(id, value)),
});

export default connect(null, mapDispatchToProps)(StructureView);
