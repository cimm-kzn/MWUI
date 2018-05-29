import { createSelector } from 'reselect';
import * as Serialize from '../../base/magic';

export const getSettings = state => state.settings;

export const getUsers = state => state.users;

export const getDatabase = state => state.database;

export const getAdditives = state => state.additives;

export const getMagic = state => state.magic;

export const getStructures = state => state.structures;

export const getPages = state => state.pages;

export const getModalState = state => state.modal;

export const getRequest = state => state.request;

export const getAdditivesForSelect = createSelector(
  [
    getAdditives,
    getMagic,
  ],
  (additives, magic) => {
    if (additives && magic) {
      return Serialize.additivesOfType(additives, magic);
    }
    return {};
  });

export const getConditionsByMetadata = createSelector(
  [
    getModalState,
    getStructures,
    getMagic,
  ],
  (modal, structures, magic) => {
    if(modal.visible && structures){
      const data = structures.filter(struct => struct.metadata === modal.structure.metadata)[0];
      const additives = Serialize.additivesOfType(data.additives, magic);
      return { ...data, ...additives };
    }
    return null;
  },
);
