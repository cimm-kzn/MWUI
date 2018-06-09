import { takeEvery, put, call, fork } from 'redux-saga/effects';
import { message } from 'antd';
import {
  addStructureIndex,
  addStructuresValidate,
  editStructureIndex,
  addStructuresResult,
  editStructureValidate,
  addTasksSavePage,
  addOneTaskSavePage,
  addSavedTaskContent,
  addSavedTaskPages,
  deleteSavedTaskPages,
  addProcess,
  finishProcess,
} from './actions';
import {
  modal,
  addModels,
  addAdditives,
  addMagic,
  succsessRequest,
} from '../../base/actions';
import * as Request from '../../base/requests';
import history from '../../base/history';
import { URLS } from '../../config';
import { getUrlParams, stringifyUrl } from '../../base/parseUrl';
import { requestSaga, catchErrSaga, requestSagaContinius, SSE_Listener, SSE } from '../../base/sagas';
import {
  convertCmlToBase64,
  clearEditor,
  exportCml,
  importCml,
  convertCmlToBase64Arr,
} from '../../base/marvinAPI';
import * as CONST from './constants';

message.config({
  top: 100,
});

// Index Page

function* createNewStructure() {
  yield call(clearEditor);
  yield put(modal(true, CONST.SAGA_NEW_STRUCTURE_CALLBACK));
}

function* createNewStructureCallback() {
  const data = yield call(exportCml);
  yield put(modal(false));
  const base64 = yield call(convertCmlToBase64, data);
  yield put(addStructureIndex({ data, base64 }));
}

function* editSelectStructure({ data, structure }) {
  yield call(importCml, data);
  yield put(modal(true, CONST.SAGA_EDIT_STRUCTURE_INDEX_CALLBACK, structure));
}

function* editSelectStructureCallback({ structure }) {
  const data = yield call(exportCml);
  yield put(modal(false));
  const base64 = yield call(convertCmlToBase64, data);
  yield put(editStructureIndex(structure, { data, base64 }));
}

function* createTaskIndex({ structures }) {
  const response = yield call(Request.createModellingTask, structures);
  yield call(history.push, stringifyUrl(URLS.VALIDATE, { task: response.data.task }));
}

function* uploadFile({ formData }) {
  const response = yield call(Request.uploadFile, formData);
  yield call(history.push, stringifyUrl(URLS.VALIDATE, { task: response.data.task }));
}

// Revalidating

function* revalidate() {
  const urlParams = yield getUrlParams();
  const task = yield call(SSE_Listener, Request.getSearchTask, urlParams.task);
  const structureAndBase64 = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructuresValidate({ data: structureAndBase64, type: task.data.type }));
}

// ------------

// Validate Page
function* initValidatePage() {
  const urlParams = yield getUrlParams();
  const task = yield call(SSE_Listener, Request.getSearchTask, urlParams.task);
  const structureAndBase64 = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructuresValidate({ data: structureAndBase64, type: task.data.type }));
}

function* initConstants() {
  const models = yield call(Request.getModels);
  const additives = yield call(Request.getAdditives);
  const magic = yield call(Request.getMagic);
  const tasks = yield call(Request.getSavedTask);
  const pages = yield call(Request.getSavedTaskPage);
  yield put(addTasksSavePage(tasks.data));
  yield put(addSavedTaskPages(pages.data));
  yield put(addAdditives(additives.data));
  yield put(addModels(models.data));
  yield put(addMagic(magic.data));
}

function* editStructureModalValidate({ data, structure }) {
  yield call(importCml, data);
  yield put(modal(true, CONST.SAGA_EDIT_STRUCTURE_VALIDATE_CALLBACK, structure));
}

function* editStructureModalValidateCallback({ structure }) {
  const data = yield call(exportCml);
  yield put(modal(false));
  const base64 = yield call(convertCmlToBase64, data);
  yield put(editStructureValidate({ data, base64, structure }));
}

function* deleteStructures({ structuresId }) {
  const urlParams = yield getUrlParams();
  const structuresToDelete = structuresId.map(structure => ({ structure, todelete: true }));
  const response = yield call(Request.deleteStructure, urlParams.task, structuresToDelete);
  yield call(history.push, stringifyUrl(URLS.VALIDATE, { task: response.data.task }));
  yield call(catchErrSaga, revalidate);
}

function* createResultTask({ data }) {
  const urlParams = yield getUrlParams();
  const response = yield call(Request.createResultTask, data, urlParams.task);
  yield put(addProcess(response.data.task));
  yield call(history.push, stringifyUrl(URLS.RESULT, { task: response.data.task }));
}

function* revalidateValidatePage({ data }) {
  const urlParams = yield getUrlParams();
  const response = yield call(Request.revalidateStructure, urlParams.task, data);
  yield call(history.push, stringifyUrl(URLS.VALIDATE, { task: response.data.task }));
  yield call(catchErrSaga, revalidate);
}

// Result page
function* resultPageInit() {
  const urlParams = yield getUrlParams();
  const task = yield call(SSE_Listener, Request.getResultTask, urlParams.task);
  const results = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructuresResult(results));
}

function* saveTask() {
  const urlParams = yield getUrlParams();
  const result = yield call(Request.saveStructure, urlParams.task);
  yield put(addOneTaskSavePage(result.data));
  yield put(succsessRequest());
  yield call(message.success, 'Task saved');
}

// Saved task page

function* getSavedTaskContent({ task }) {
  const content = yield call(Request.getSavedTaskContent, task);
  const results = yield call(convertCmlToBase64Arr, content.data.structures);
  yield put(addSavedTaskContent(task, results));
}

function* deleteSavedTask({ task }) {
  const deletedTask = yield call(Request.deleteSavedTaskContent, task);
  yield put(deleteSavedTaskPages(deletedTask.data.task));
}

function* getSavesTasks({ page }) {
  const tasks = yield call(Request.getSavedTask, page);
  yield put(addTasksSavePage(tasks.data));
}

function* skipRedirectPage() {
  yield put(succsessRequest());
  yield call(history.push, URLS.PROCESSING);
}

function* saga1() {
  // Init constants

  yield takeEvery(CONST.SAGA_INIT_CONSTANTS, catchErrSaga, initConstants);
  // Index page
  yield takeEvery(CONST.SAGA_NEW_STRUCTURE, catchErrSaga, createNewStructure);
  yield takeEvery(CONST.SAGA_NEW_STRUCTURE_CALLBACK, catchErrSaga, createNewStructureCallback);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_INDEX, catchErrSaga, editSelectStructure);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_INDEX_CALLBACK, catchErrSaga, editSelectStructureCallback);
  yield takeEvery(CONST.SAGA_CREATE_TASK_INDEX, catchErrSaga, createTaskIndex);
  yield takeEvery(CONST.SAGA_UPLOAD_FILE, catchErrSaga, uploadFile);

  // Validate Page
  yield takeEvery(CONST.SAGA_INIT_VALIDATE_PAGE, requestSaga, initValidatePage);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_VALIDATE, catchErrSaga, editStructureModalValidate);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_VALIDATE_CALLBACK, catchErrSaga, editStructureModalValidateCallback);
  yield takeEvery(CONST.SAGA_DELETE_STRUCRURES_VALIDATE_PAGE, requestSaga, deleteStructures);
  yield takeEvery(CONST.SAGA_REVALIDATE_VALIDATE_PAGE, requestSaga, revalidateValidatePage);
  yield takeEvery(CONST.SAGA_CREATE_RESULT_TASK, requestSagaContinius, createResultTask);

  // Result Page
  yield takeEvery(CONST.SAGA_INIT_RESULT_PAGE, requestSaga, resultPageInit);
  yield takeEvery(CONST.SAGA_SAVE_TASK, catchErrSaga, saveTask);
  yield takeEvery(CONST.SAGA_SKIP_REDIRECT_PROCESSING, catchErrSaga, skipRedirectPage);

  // Saved tasks page
  yield takeEvery(CONST.SAGA_INIT_TASK_CONTENT, requestSaga, getSavedTaskContent);
  yield takeEvery(CONST.SAGA_DELETE_SAVED_TASK, requestSaga, deleteSavedTask);
  yield takeEvery(CONST.SAGA_GET_SAVED_TASKS_FOR_PAGE, requestSaga, getSavesTasks);
}

function* saga2() {
  while (true) {
    const taskID = yield call(SSE);
    yield put(finishProcess(taskID));
  }
}

export function* sagas() {
  yield [
    fork(saga1),
    fork(saga2),
  ];
}
