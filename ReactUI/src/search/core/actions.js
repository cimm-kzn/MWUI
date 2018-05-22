import { HISTORY, RESULT, STRUCTURE } from './constants';

export const addStructure = arr => ({
  type: STRUCTURE.ADD_STRUCTURE, arr,
});

export const editStructure = obj => ({
  type: STRUCTURE.EDIT_STRUCTURE, obj,
});

export const addSelectModel = model => ({
  type: STRUCTURE.ADD_SELECTED_MODEL, model,
});


export const addResult = arr => ({
  type: RESULT.ADD, arr,
});

export const addHistory = arr => ({
  type: HISTORY.ADD, arr,
});
