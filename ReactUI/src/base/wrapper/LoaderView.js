import { connect } from 'react-redux';
import { Loader } from '../../components/index';

const mapStateToProps = state => ({
  loading: state.request.loading,
});

export default connect(mapStateToProps)(Loader);
