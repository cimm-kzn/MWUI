import { connect } from 'react-redux';
import { DBFormModal } from '../../components/index';
import { showModal } from '../core/actions';
import { SAGA_EDIT_STRUCTURE } from '../core/constants';

const mapStateToProps = state => ({
  visible: state.modal.visible,
  id: state.modal.id,
  structures: state.structures,
  condition: (state.settings && state.settings.condition) || {},
});

const mapDispatchToProps = dispatch => ({
  onOk: (id, data, params, condition) => dispatch({ type: SAGA_EDIT_STRUCTURE, id, data, params, condition }),
  onCancel: () => dispatch(showModal(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DBFormModal);
