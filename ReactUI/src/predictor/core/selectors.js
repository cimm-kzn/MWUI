import { createSelector } from 'reselect';
import * as Serialize from '../../base/magic';


export const getIndexPageStructure = state => state.indexPageStructures;

export const getValidateStructure = state => state.validatePageStructure;

export const getResultPageStructure = state => state.resultPageStructure;

export const getModels = state => state.models;

export const getAdditives = state => state.additives;

export const getMagic = state => state.magic;

export const isLoading = state => state.request.loading;

export const getStructuresValidatePage = createSelector(
  [getModels,
    getAdditives,
    getMagic,
    getValidateStructure],
  (models, additives, magic, structures) => {
    if(models && additives && magic && structures) {
      const structureAddModel = Serialize.models(structures, models, magic);
      const structureAddAdditives = Serialize.additives(structureAddModel, additives, magic);
      return structureAddAdditives;
    }
    return [];
  },
);

