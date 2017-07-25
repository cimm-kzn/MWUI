export const MARVIN_PATH_IFRAME = '/static/marvinjs/editorws.html';

const BASE_URL =  'http://localhost/'//window.location.protocol + "//" + window.location.host + "/";

export const API = {
    CREATE_TASK: BASE_URL + 'api/task/create/0',
    PREPARE_TASK: BASE_URL + 'api/task/prepare/',
    RESULT: BASE_URL + 'api/task/model/',
    ADDITIVES: BASE_URL + 'api/resources/additives',
    MODELS: BASE_URL + 'api/resources/models',
    UPLOAD_FILE: BASE_URL + 'api/task/upload/0',
    SAVE_TASK: BASE_URL + 'api/task/results/',
    USER_AUTH: BASE_URL + 'api/auth'
};

export const REQUEST = {
    TIME_OUT: 2000,
    COUNT: 10,
    INCREMENT: 400
};
