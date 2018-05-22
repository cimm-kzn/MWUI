import { takeEvery, put, call } from 'redux-saga/effects';
import { addStructure, addHistory, addResult, editStructure } from './actions';
import * as Request from '../../base/requests';
import history from '../../base/history';
import { URLS } from '../../config';
import { getUrlParams, stringifyUrl } from '../../base/parseUrl';
import { repeatedRequests, requestSaga, catchErrSaga, requestSagaContinius } from '../../base/sagas';
import { convertCmlToBase64, clearEditor, exportCml, importCml, convertCmlToBase64Arr } from '../../base/marvinAPI';
import {
  modal,
  addModels,
  addMagic,
} from '../../base/actions';
import {
  SAGA_CREATE_RESULT_TASK,
  SAGA_CREATE_TASK,
  SAGA_CREATE_TASK_SEARCH,
  SAGA_DRAW_STRUCTURE,
  SAGA_EDIT_STRUCTURE_1,
  SAGA_EDIT_TASK_SEARCH,
  SAGA_INIT_RESULT_PAGE,
  SAGA_INIT_VALIDATE_PAGE,
  SAGA_REVALIDATE_TASK,
  SAGA_DRAW_STRUCTURE_CALLBACK,
  SAGA_EDIT_STRUCTURE_CALLBACK,
} from './constants';

// Index Page

function* createTask({ data }) {
  const response = yield call(Request.createSearchTask, { data });
  yield call(history.push, stringifyUrl(URLS.VALIDATE, { task: response.data.task }));
}

function* drawStructure() {
  yield call(clearEditor);
  yield put(modal(true, SAGA_DRAW_STRUCTURE_CALLBACK));
}

function* drawStructureCallback() {
  const data = yield call(exportCml);
  yield put(modal(false));
  yield put({ type: SAGA_CREATE_TASK, data });
}

// Validate Page

function* validateTask() {
  const urlParams = yield getUrlParams();
  const models = yield call(Request.getModels);
  const magic = yield call(Request.getMagic);
  const task = yield call(repeatedRequests, Request.getSearchTask, urlParams.task);
  const structureAndBase64 = yield call(convertCmlToBase64Arr, task.data.structures);
  yield put(addStructure({ data: structureAndBase64, type: task.data.type }));
  yield put(addModels(models.data));
  yield put(addMagic(magic.data));
}

function* editStructureR({ data }) {
  yield call(importCml, data);
  yield put(modal(true, SAGA_EDIT_STRUCTURE_CALLBACK));
}

function* editStructureCallback() {
  const data = yield call(exportCml);
  const base64 = yield call(convertCmlToBase64, data);
  yield put(modal(false));
  yield put(editStructure({ data, base64 }));
}

function* revalidateTask(action) {
  yield call(createTask, action);
  yield call(validateTask);
}

function* createResultTask({ structure, selectModel }) {
  const urlParams = getUrlParams();
  const { data } = structure;
  const response = yield call(Request.createResultTask, { models: [{ model: selectModel.model, data }], structure: 1 }, urlParams.task);
  const resultTaskId = response.data.task;
  yield put(addHistory({ resultTaskId, selectModel, validateTaskId: urlParams.task, ...structure }));
  yield call(history.push, stringifyUrl(URLS.RESULT, { task: resultTaskId }));
}

// Result page

function* resultPage() {
  const urlParams = yield getUrlParams();
  const responce = yield call(repeatedRequests, Request.getResultTask, urlParams.task);
  const results = yield call(convertCmlToBase64Arr, responce.data.structures, { width: 700, height: 450, typeImg: 'image/png' });
  yield put(addResult(results));
}


function* createStructure() {
  const cml = yield call(exportCml);
  yield put(modal(false));
  yield put({ type: SAGA_CREATE_TASK, cml });
}

function* editTaskStructure() {
  const cml = yield call(exportCml);
  const base64 = yield call(convertCmlToBase64, cml);
  yield put(modal(false));
  yield put(editStructure(cml, base64));
}


export function* sagas() {
  // Index Page
  yield takeEvery(SAGA_CREATE_TASK, requestSagaContinius, createTask);
  yield takeEvery(SAGA_DRAW_STRUCTURE, catchErrSaga, drawStructure);
  yield takeEvery(SAGA_DRAW_STRUCTURE_CALLBACK, catchErrSaga, drawStructureCallback);
  // Validate Page
  yield takeEvery(SAGA_INIT_VALIDATE_PAGE, requestSaga, validateTask);
  yield takeEvery(SAGA_EDIT_STRUCTURE_1, catchErrSaga, editStructureR);
  yield takeEvery(SAGA_REVALIDATE_TASK, revalidateTask);
  yield takeEvery(SAGA_CREATE_RESULT_TASK, requestSagaContinius, createResultTask);
  yield takeEvery(SAGA_EDIT_STRUCTURE_CALLBACK, catchErrSaga, editStructureCallback);
  // Result Page
  yield takeEvery(SAGA_INIT_RESULT_PAGE, requestSaga, resultPage);
  yield takeEvery(SAGA_CREATE_TASK_SEARCH, catchErrSaga, createStructure);
  yield takeEvery(SAGA_EDIT_TASK_SEARCH, catchErrSaga, editTaskStructure);
}
