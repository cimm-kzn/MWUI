import {TRIGGER} from '../constants'

export const triggerModal = (bool, id, cml) => ({
    type: TRIGGER, bool, id, cml
});
