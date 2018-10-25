import {
  ADD_STRUCTURE,
  ADD_STRUCTURES,
  EDIT_STRUCTURE,
  DELETE_STRUCTURE,
  ADD_SETTINGS,
  ADD_FIELDS,
  ADD_USERS,
  ADD_PAGES,
} from './constants';

export const addStructures = structures => ({
  type: ADD_STRUCTURES, structures,
});

export const addStructureRecord = (record, data) => ({
  type: ADD_STRUCTURE, record, data,
});

export const deleteStructure = record => ({
  type: DELETE_STRUCTURE, record,
});

export const editStructure = (record, data) => ({
  type: EDIT_STRUCTURE, record, data,
});

export const addSettings = settings => ({
  type: ADD_SETTINGS, settings,
});

export const addDBFields = fields => ({
  type: ADD_FIELDS, fields,
});

export const addUsers = users => ({
  type: ADD_USERS, users,
});

export const addPages = pages => ({
  type: ADD_PAGES, pages,
});
