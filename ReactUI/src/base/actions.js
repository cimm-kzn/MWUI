import { REQUEST, TRIGGER, BASE_DATA } from './constants';

export const startRequest = () => ({
  type: REQUEST.START_REQUEST,
});

export const succsessRequest = () => ({
  type: REQUEST.SUCCESS_REQUEST,
});

export const errorRequest = (errText, lastActions) => ({
  type: REQUEST.ERROR_REQUEST, errText, lastActions,
});

export const modal = (visible, typeAction, structure) => ({
  type: TRIGGER, visible, typeAction, structure,
});

export const addAdditives = additives => ({
  type: BASE_DATA.ADD_ALL_ADDITIVES, additives,
});

export const addModels = models => ({
  type: BASE_DATA.ADD_ALL_MODELS, models,
});

export const addMagic = magics => ({
  type: BASE_DATA.ADD_MAGIC, magics,
});
