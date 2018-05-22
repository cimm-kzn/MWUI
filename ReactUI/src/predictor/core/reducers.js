import { combineReducers } from 'redux';
import * as CONST from './constants';
import { request, modal, magic, models, additives } from '../../base/reducers';

const indexPageStructures = (state = [], action) => {
  switch (action.type) {
    case CONST.ADD_STRUCTURE_INDEX:
      return [
        {
          structure: state.reduce((maxId, task) => Math.max(task.structure, maxId), -1) + 1,
          ...action.obj,
        },
        ...state,
      ];
    case CONST.DELETE_STRUCTURE_INDEX:
      return state.filter(item => item.structure !== action.structure);
    case CONST.EDIT_STRUCTURE_INDEX:
      return state.map(item =>
        (item.structure === action.structure ?
          { structure: action.structure, ...action.obj } :
          item),
      );
    default:
      return state;
  }
};

const validatePageStructure = (state = null, action) => {
  switch (action.type) {
    case CONST.ADD_STRUCTURES_VALIDATE:
      return action.arr;
    case CONST.EDIT_STRUCTURE_VALIDATE:
      const data = state.data.map(item =>
        (item.structure === action.obj.structure ?
          {
            ...item,
            ...action.obj,
            revalidate: true,
          } :
          item),
      );
      return {  ...state, data };
    default:
      return state;
  }
};

const resultPageStructure = (state = [], action) => {
  switch (action.type) {
    case CONST.ADD_STRUCTURE_RESULT:
      return action.arr.map((s, i) => ({ id: i, ...s }));
    default:
      return state;
  }
};


export default combineReducers({
  modal,
  models,
  additives,
  magic,
  request,
  indexPageStructures,
  validatePageStructure,
  resultPageStructure,
});
