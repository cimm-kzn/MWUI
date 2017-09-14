import { TRIGGER_MODAL_FILE_UPLOAD } from '../constants';

const initState = {
  isShow: false,
};

export const fileUploadModal = (state = initState, action) => {
  switch (action.type) {
    case TRIGGER_MODAL_FILE_UPLOAD:
      return { isShow: !state.isShow };
    default:
      return state;
  }
};
