import { MarvinEditor } from './MarvinEditor';
import { modal } from '../../core/actions/modal';
import { addTask, editTask } from '../../core/actions/tasks';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  modal: state.modal });

const mapDispatchToProps = dispatch => ({
  closeModal: () => dispatch(modal(false)),
  addStruct: cmlBase64 => dispatch(addTask(cmlBase64)),
  editStruct: (id, cmlBase64) => dispatch(editTask(id, cmlBase64)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MarvinEditor);
