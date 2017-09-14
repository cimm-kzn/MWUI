import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Header from './Header';
import { saveTaskQuery } from '../../../core/queries';

const mapStateToProps = state => ({
  tasks: state.tasks,
});

const mapDispatchToProps = dispatch => ({
  saveTask: () => dispatch(saveTaskQuery()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
