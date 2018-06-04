import { createSelector } from 'reselect';
import * as Serialize from '../../base/magic';

export const getStructure = state => state.structure;

export const getModels = state => state.models;

export const getMagic = state => state.magic;

export const getRequest = state => state.request;

export const getResults = state => state.results;

export const getStructures = createSelector(
  [getModels,
    getMagic,
    getStructure],
  (models, magic, structures) => {
    if(models && magic && structures) {
      const structureAddModel = Serialize.models(structures, models, magic);
      return structureAddModel[0];
    }
    return null;
  },
);