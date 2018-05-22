import { takeEvery, put, call } from 'redux-saga/effects';
import {
  addStructureIndex,
  addStructuresValidate,
  editStructureIndex,
  addStructuresResult,
  editStructureValidate,
} from './actions';
import {
  modal,
  addModels,
  addAdditives,
  addMagic,
} from '../../base/actions';
import * as Request from '../../base/requests';
import history from '../../base/history';
import { URLS } from '../../config';
import { getUrlParams, stringifyUrl } from '../../base/parseUrl';
import { repeatedRequests, requestSaga, catchErrSaga, requestSagaContinius } from '../../base/sagas';
import {
  convertCmlToBase64,
  clearEditor,
  exportCml,
  importCml,
  convertCmlToBase64Arr,
} from '../../base/marvinAPI';
import {
  SAGA_EDIT_STRUCTURE_INDEX,
  SAGA_NEW_STRUCTURE,
  SAGA_CREATE_TASK_INDEX,
  SAGA_INIT_VALIDATE_PAGE,
  SAGA_CREATE_RESULT_TASK,
  SAGA_INIT_RESULT_PAGE,
  SAGA_NEW_STRUCTURE_CALLBACK,
  SAGA_EDIT_STRUCTURE_VALIDATE,
  SAGA_DELETE_STRUCRURES_VALIDATE_PAGE,
  SAGA_EDIT_STRUCTURE_VALIDATE_CALLBACK,
  SAGA_EDIT_STRUCTURE_INDEX_CALLBACK,
  SAGA_REVALIDATE_VALIDATE_PAGE,
} from './constants';

// Index Page

function* createNewStructure() {
  yield call(clearEditor);
  yield put(modal(true, SAGA_NEW_STRUCTURE_CALLBACK));
}

function* createNewStructureCallback() {
  const data = yield call(exportCml);
  yield put(modal(false));
  const base64 = yield call(convertCmlToBase64, data);
  yield put(addStructureIndex({ data, base64 }));
}

function* editSelectStructure({ data, structure }) {
  yield call(importCml, data);
  yield put(modal(true, SAGA_EDIT_STRUCTURE_INDEX_CALLBACK, structure));
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
  const urlParams = yield getUrlParams();
  const task = yield call(repeatedRequests, Request.getSearchTask, urlParams.task);
  const structureAndBase64 = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructuresValidate({ data: structureAndBase64, type: task.data.type }));
}

// ------------

// Validate Page
function* initValidatePage() {
  const urlParams = yield getUrlParams();
  const models = yield call(Request.getModels);
  const additives = yield call(Request.getAdditives);
  const magic = yield call(Request.getMagic);
  const task = yield call(repeatedRequests, Request.getSearchTask, urlParams.task);
  const structureAndBase64 = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructuresValidate({ data: structureAndBase64, type: task.data.type }));
  yield put(addAdditives(additives.data));
  yield put(addModels(models.data));
  yield put(addMagic(magic.data));
}

function* editStructureModalValidate({ data, structure }) {
  yield call(importCml, data);
  yield put(modal(true, SAGA_EDIT_STRUCTURE_VALIDATE_CALLBACK, structure));
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
  const urlParams = yield getUrlParams();
  const responce = yield call(repeatedRequests, Request.getResultTask, urlParams.task);
  const results = yield call(convertCmlToBase64Arr, responce.data.structures);
  yield put(addStructuresResult(results));
}

export function* sagas() {
  // Index page
  yield takeEvery(SAGA_NEW_STRUCTURE, catchErrSaga, createNewStructure);
  yield takeEvery(SAGA_NEW_STRUCTURE_CALLBACK, catchErrSaga, createNewStructureCallback);
  yield takeEvery(SAGA_EDIT_STRUCTURE_INDEX, catchErrSaga, editSelectStructure);
  yield takeEvery(SAGA_EDIT_STRUCTURE_INDEX_CALLBACK, catchErrSaga, editSelectStructureCallback);
  yield takeEvery(SAGA_CREATE_TASK_INDEX, requestSagaContinius, createTaskIndex);

  // Validate Page
  yield takeEvery(SAGA_INIT_VALIDATE_PAGE, requestSaga, initValidatePage);
  yield takeEvery(SAGA_EDIT_STRUCTURE_VALIDATE, catchErrSaga, editStructureModalValidate);
  yield takeEvery(SAGA_EDIT_STRUCTURE_VALIDATE_CALLBACK, catchErrSaga, editStructureModalValidateCallback);
  yield takeEvery(SAGA_DELETE_STRUCRURES_VALIDATE_PAGE, requestSaga, deleteStructures);
  yield takeEvery(SAGA_REVALIDATE_VALIDATE_PAGE, requestSaga, revalidateValidatePage);
  yield takeEvery(SAGA_CREATE_RESULT_TASK, requestSagaContinius, createResultTask);

  // Result Page
  yield takeEvery(SAGA_INIT_RESULT_PAGE, requestSaga, resultPageInit);
}
