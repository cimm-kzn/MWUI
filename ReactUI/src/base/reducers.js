import { REQUEST, TRIGGER, BASE_DATA } from './constants';

const requestState = {
  loading: false,
  error: false,
  errorText: '',
  lastActions: '',
};

const request = (state = requestState, action) => {
  switch (action.type) {
    case REQUEST.START_REQUEST:
      return {
        loading: true,
        error: false,
        errorText: '',
        lastActions: '',
      };

    case REQUEST.SUCCESS_REQUEST:
      return {
        loading: false,
        error: false,
        errorText: '',
        lastActions: '',
      };

    case REQUEST.ERROR_REQUEST:
      return {
        loading: false,
        error: true,
        errorText: action.errText,
        lastActions: action.lastActions,
      };

    default:
      return state;
  }
};

const modal = (state = { visible: false }, action) => {
  switch (action.type) {
    case TRIGGER:
      const { type, ...rest } = action;
      return rest;
    default:
      return state;
  }
};

const additives = (state = null, action) => {
  switch (action.type) {
    case BASE_DATA.ADD_ALL_ADDITIVES:
      return action.additives;
    default:
      return state;
  }
};

const models = (state = null, action) => {
  switch (action.type) {
    case BASE_DATA.ADD_ALL_MODELS:
      return action.models;
    default:
      return state;
  }
};

const magic = (state = null, action) => {
  switch (action.type) {
    case BASE_DATA.ADD_MAGIC:
      return action.magics;
    default:
      return state;
  }
};


export { request, modal, additives, models, magic };
