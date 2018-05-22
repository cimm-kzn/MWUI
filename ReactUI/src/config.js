export const MARVIN_PATH_IFRAME = '/static/marvinjs/editorws.html';
export const MARVIN_EDITOR_IS_EMPTY = '<cml><MDocument></MDocument></cml>';
export const MARVIN_ID = '#marvinjs';

const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://cimm.kpfu.ru' : 'http://localhost:3000';

const API = {
  CREATE_TASK_PREDICTOR: '/api/jobs/create/0',
  CREATE_TASK_SEARCH: '/api/jobs/create/1',
  CREATE_STRUCTUSE: '/structures',
  PREPARE_TASK: '/api/jobs/prepare/',
  RESULT: '/api/jobs/process/',
  ADDITIVES: '/api/jobs/additives',
  MODELS: '/api/jobs/models',
  UPLOAD_FILE: '/api/jobs/task/upload',
  SAVE_TASK: '/api/jobs/task/results/',
  USER_AUTH: '/api/jobs/auth',
  MAGIC: '/api/jobs/magic',

  RECORDS: '/api/db/db/:database/:table/records',
  RECORDS_METADATA: '/api/jobs/:database/:table/records/:metadata',
  CREATE_TASK_DBFORM: '/api/db/validate',
  SERVER_SIDE_SUBSCRIBE: '/api/jobs/subscribe/connect',
  DB_FIELDS: '/api/db/db',
  USERS: '/api/db/users',
  WHOAMI: '/api/db/auth',
};

const MODAL = {
  CREATE_TASK: 'CREATE_TASK_SEARCH',
  EDIT_TASK: 'EDIT_TASK_SEARCH',
};

const URLS = {
  INDEX: '/',
  VALIDATE: '/validate',
  RESULT: '/result/',
  MANUAL: '/manual/',
  PREPARE: '/prepare/',
  ERROR: '/error/',
  HISTORY: '/history/',
  INFO: '/info/',
  EDIT: '/edit/',
  SETTINGS: '/settings',
};

const REPEATED_REQUESTS = {
  TIMEOUT: 2000,
  RETRY: 5,
};

const API_URLS = Object.keys(API)
  .reduce((acc, key) => {
    acc[key] = BASE_URL + API[key];
    return acc;
  }, {});

export {
  API_URLS,
  BASE_URL,
  MODAL,
  URLS,
  REPEATED_REQUESTS,
};