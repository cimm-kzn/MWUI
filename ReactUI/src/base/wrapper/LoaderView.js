import { connect } from 'react-redux';
import { Loader } from '../../components';
import { succsessRequest } from '../actions';

const mapStateToProps = state => ({
  loading: state.request.loading,
});

const mapDispatchToProps = dispatch => ({
  skip: () => dispatch(succsessRequest()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Loader);
