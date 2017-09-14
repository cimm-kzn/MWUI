import { connect } from 'react-redux';
import { ModalConditionSelectedView } from '../../containers';
import { triggerConditionModal } from '../../core/actions/modalConditionSelect';
import { setSelectedCondition } from '../../core/actions/tasks';

const mapStateToProps = state => ({
  isShow: state.modalConditionSelected.isShow,
});

const mapDispatchToProps = dispatch => ({
  closeModal: () => dispatch(triggerConditionModal()),
  setCondition: obj => { dispatch(setSelectedCondition(obj)); dispatch(triggerConditionModal()) },
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalConditionSelectedView);
