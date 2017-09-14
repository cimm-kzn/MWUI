import { connect } from 'react-redux';
import { ConditionsView } from '../../containers';
import { addModel, addTemp, addPress, addSolv, addAmount } from '../../core/actions/tasks';

const mapDispatchToProps = dispatch => ({
  addSolv: (id, arr, total) => dispatch(addSolv(id, arr, total)),
  addModel: (id, arr) => dispatch(addModel(id, arr)),
  addTemp: (id, arr) => dispatch(addTemp(id, arr)),
  addPress: (id, arr) => dispatch(addPress(id, arr)),
  addAmount: (id, additive, value, sum) => dispatch(addAmount(id, additive, value, sum)),
});

export default connect(null, mapDispatchToProps)(ConditionsView);