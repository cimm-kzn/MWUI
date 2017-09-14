import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TaskList from './TaskList';


const mapStateToProps = state => ({
  tasks: state.tasks,
});

export default withRouter(connect(mapStateToProps)(TaskList));