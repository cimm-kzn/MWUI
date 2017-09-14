import { TRIGGER } from '../constants';

export const modal = (bool, id, cml) => ({
  type: TRIGGER, bool, id, cml,
});