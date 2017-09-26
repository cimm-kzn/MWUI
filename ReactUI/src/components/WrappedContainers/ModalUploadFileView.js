import queryString from 'query-string';
import { connect } from 'react-redux';
import { ModalUploadFileView } from '../../containers';
import { triggerFileUploadModal } from '../../core/actions/modalFileUpload';
import { uploadFileQuery } from '../../core/actions/queries';

import { URL } from '../../config';

const mapStateToProps = state => ({
  isShow: state.modalFileUpload.isShow,
});

const mapDispatchToProps = (dispatch, props) => ({
  closeModal: () => dispatch(triggerFileUploadModal()),
  uploadFile: file => dispatch(uploadFileQuery(file)).then((result) => {
    if (result.status >= 200 && result.status < 300) {
      props.history.push({
        pathname: URL.PREPARE,
        search: queryString.stringify({ task: result.transformed.task }),
      });
    }
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalUploadFileView);
