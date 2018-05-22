import { createSelector } from 'reselect';
import * as Serialize from '../../base/magic';

export const getSettings = state => state.settings;

export const getUsers = state => state.users;

export const getDatabase = state => state.database;

export const getAdditives = state => state.additives;

export const getMagic = state => state.magic;

export const getAdditivesForSelect = createSelector(
  [
    getAdditives,
    getMagic,
  ],
  (additives, magic) => Serialize.additivesOfType(additives, magic));
