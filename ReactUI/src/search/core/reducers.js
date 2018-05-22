import { combineReducers } from 'redux';
import { HISTORY, RESULT, STRUCTURE, TRIGGER, REQUEST } from './constants';
import { request, modal, models, magic } from '../../base/reducers';

const histories = (state = [], action) => {
  switch (action.type) {
    case HISTORY.ADD:
      state.push(action.arr);
      return state;
    default:
      return state;
  }
};

const results = (state = null, action) => {
  switch (action.type) {
    case RESULT.ADD:
      return action.arr;
    default:
      return state;
  }
};

const structure = (state = null, action) => {
  switch (action.type) {
    case STRUCTURE.ADD_STRUCTURE:
      return action.arr;
    case STRUCTURE.EDIT_STRUCTURE:
      const data = state.data.map(item => ({
        ...item,
        ...action.obj,
        revalidate: true,
      }));

      return { ...state, data };
    default:
      return state;
  }
};

export default combineReducers({
  models,
  magic,
  modal,
  request,
  structure,
  results,
  histories,
});
