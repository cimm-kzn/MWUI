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

export const addStructureMetadata = (metadata, data) => ({
  type: ADD_STRUCTURE, metadata, data,
});

export const deleteStructure = metadata => ({
  type: DELETE_STRUCTURE, metadata,
});

export const editStructure = (metadata, data) => ({
  type: EDIT_STRUCTURE, metadata, data,
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
