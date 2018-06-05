import { takeEvery, put, call } from 'redux-saga/effects';
import { message } from 'antd';
import {
  addStructureIndex,
  addStructuresValidate,
  editStructureIndex,
  addStructuresResult,
  editStructureValidate,
  addTasksSavePage,
  addSavedTaskContent,
  addSavedTaskPages,
  deleteSavedTaskPages,
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
import { requestSaga, catchErrSaga, requestSagaContinius } from '../../base/sagas';
import {
  convertCmlToBase64,
  clearEditor,
  exportCml,
  importCml,
  convertCmlToBase64Arr,
} from '../../base/marvinAPI';
import * as CONST from './constants';

const eventSource = new EventSource('http://localhost:3000/api/jobs/subscribe/connect', { withCredentials: true });


const listener = () => new Promise((resolve) => {
  eventSource.onmessage = (e) => {
    resolve(e.data);
  };
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

// Revalidating

function* revalidate() {
  const taskID = yield call(listener);
  const task = yield call(Request.getSearchTask, taskID);
  const structureAndBase64 = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructuresValidate({ data: structureAndBase64, type: task.data.type }));
}

// ------------

// Validate Page
function* initValidatePage() {
  const taskID = yield call(listener);
  const task = yield call(Request.getSearchTask, taskID);
  const structureAndBase64 = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructuresValidate({ data: structureAndBase64, type: task.data.type }));
}

function* initConstants() {
  const models = yield call(Request.getModels);
  const additives = yield call(Request.getAdditives);
  const magic = yield call(Request.getMagic);
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
  const taskID = yield call(listener);
  const responce = yield call(Request.getResultTask, taskID);
  const results = yield call(convertCmlToBase64Arr, responce.data.structures);
  yield put(addStructuresResult(results));
}

function* saveTask() {
  const urlParams = yield getUrlParams();
  yield call(Request.saveStructure, urlParams.task);
  yield put(succsessRequest());
  yield call(message.success, 'Task saved');
}

// Saved task page
function* initSavedTasksPage() {
  const tasks = yield call(Request.getSavedTask);
  const pages = yield call(Request.getSavedTaskPage);
  yield put(addTasksSavePage(tasks.data));
  yield put(addSavedTaskPages(pages.data));
}

function* getSavedTaskContent({ task }) {
  const content = yield call(Request.getSavedTaskContent, task);
  const results = yield call(convertCmlToBase64Arr, content.data.structures);

  console.log(results);

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

export function* sagas() {
  // Init constants

  yield takeEvery(CONST.SAGA_INIT_CONSTANTS, catchErrSaga, initConstants);
  // Index page
  yield takeEvery(CONST.SAGA_NEW_STRUCTURE, catchErrSaga, createNewStructure);
  yield takeEvery(CONST.SAGA_NEW_STRUCTURE_CALLBACK, catchErrSaga, createNewStructureCallback);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_INDEX, catchErrSaga, editSelectStructure);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_INDEX_CALLBACK, catchErrSaga, editSelectStructureCallback);
  yield takeEvery(CONST.SAGA_CREATE_TASK_INDEX, requestSagaContinius, createTaskIndex);

  // Validate Page
  yield takeEvery(CONST.SAGA_INIT_VALIDATE_PAGE, requestSaga, initValidatePage);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_VALIDATE, catchErrSaga, editStructureModalValidate);
  yield takeEvery(CONST.SAGA_EDIT_STRUCTURE_VALIDATE_CALLBACK, catchErrSaga, editStructureModalValidateCallback);
  yield takeEvery(CONST.SAGA_DELETE_STRUCRURES_VALIDATE_PAGE, requestSaga, deleteStructures);
  yield takeEvery(CONST.SAGA_REVALIDATE_VALIDATE_PAGE, requestSaga, revalidateValidatePage);
  yield takeEvery(CONST.SAGA_CREATE_RESULT_TASK, requestSagaContinius, createResultTask);

  // Result Page
  yield takeEvery(CONST.SAGA_INIT_RESULT_PAGE, requestSaga, resultPageInit);
  yield takeEvery(CONST.SAGA_SAVE_TASK, requestSagaContinius, saveTask);

  // Saved tasks page
  yield takeEvery(CONST.SAGA_INIT_SAVED_TASKS_PAGE, requestSaga, initSavedTasksPage);
  yield takeEvery(CONST.SAGA_INIT_TASK_CONTENT, requestSaga, getSavedTaskContent);
  yield takeEvery(CONST.SAGA_DELETE_SAVED_TASK, requestSaga, deleteSavedTask);
  yield takeEvery(CONST.SAGA_GET_SAVED_TASKS_FOR_PAGE, requestSaga, getSavesTasks);
}
