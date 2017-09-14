export const MARVIN_PATH_IFRAME = '/static/marvinjs/editorws.html';
export const MARVIN_EDITOR_IS_EMPTY = '<cml><MDocument></MDocument></cml>';

const BASE_URL = 'http://localhost/';// window.location.protocol + "//" + window.location.host + "/";

export const API = {
  CREATE_TASK: `${BASE_URL}api/task/create/0`,
  PREPARE_TASK: `${BASE_URL}api/task/prepare/`,
  RESULT: `${BASE_URL}api/task/model/`,
  ADDITIVES: `${BASE_URL}api/resources/additives`,
  MODELS: `${BASE_URL}api/resources/models`,
  UPLOAD_FILE: `${BASE_URL}api/task/upload`,
  SAVE_TASK: `${BASE_URL}api/task/results/`,
  USER_AUTH: `${BASE_URL}api/auth`,
  CONSTANTS: `${BASE_URL}api/resources/magic`,
};

export const CONST = {
  TaskStatus: {
    MODELING: 3,
    PREPARED: 2,
    PREPARING: 1,
    DONE: 4 },
  ResultType: {
    IMAGE: 3,
    TABLE: 2,
    GTM: 5,
    STRUCTURE: 1,
    TEXT: 0,
    GRAPH: 4 },
  StructureType: {
    UNDEFINED: 0,
    REACTION: 2,
    MOLECULE: 1 },
  AdditiveType: {
    SOLVENT: 0,
    OVER: 2,
    CATALYST: 1,
  },
  StructureStatus: {
    RAW: 0,
    HAS_ERROR: 1,
    CLEAR: 2 },
  TaskType: {
    MODELING: 0,
    SEARCHING: 1 },
  ModelType: {
    PREPARER: 0,
    REACTION_SEARCHING: 4,
    REACTION_MODELING: 2,
    MOLECULE_SEARCHING: 3,
    MOLECULE_MODELING: 1,
  } };

const statusCodes = {
  UNKNOWN: 0,
  REQUEST_TIMEOUT: 408,
  TOO_MANY_REQUESTS: 512,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const requestConfig = {
  backoff: {
    maxAttempts: 10,
    minDuration: 3000,
    maxDuration: 5000,
  },
  retryableStatusCodes: [
    statusCodes.UNKNOWN,
    statusCodes.REQUEST_TIMEOUT,
    statusCodes.TOO_MANY_REQUESTS,
    statusCodes.SERVICE_UNAVAILABLE,
    statusCodes.GATEWAY_TIMEOUT,
  ],
};

export const URL = {
  INDEX: '/',
  MANUAL: '/manual/',
  PREPARE: '/prepare/',
  RESULT: '/result/',
  ERROR: '/error/',
};
