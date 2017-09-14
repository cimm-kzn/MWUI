import { TRIGGER_MODAL_CONDITION_SELECT } from '../constants';

const initState = {
  isShow: false,
};

export const conditionSelectedModal = (state = initState, action) => {
  switch (action.type) {
    case TRIGGER_MODAL_CONDITION_SELECT:
      return { isShow: !state.isShow };
    default:
      return state;
  }
};
