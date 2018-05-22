import * as CONST from './constants';

// Index page actions
export const addStructureIndex = obj => ({
  type: CONST.ADD_STRUCTURE_INDEX, obj,
});

export const deleteStructureIndex = structure => ({
  type: CONST.DELETE_STRUCTURE_INDEX, structure,
});

export const editStructureIndex = (structure, obj) => ({
  type: CONST.EDIT_STRUCTURE_INDEX, structure, obj,
});


// Validate page actions
export const addStructuresValidate = arr => ({
  type: CONST.ADD_STRUCTURES_VALIDATE, arr,
});

export const addStructuresResult = arr => ({
  type: CONST.ADD_STRUCTURE_RESULT, arr,
});

export const editStructureValidate = obj => ({
  type: CONST.EDIT_STRUCTURE_VALIDATE, obj,
});

