import { takeEvery, call, put } from 'redux-saga/effects';
import { message } from 'antd';
import { Structures, Records, Settings, Users } from './requests';
import { getAdditives, getMagic } from '../../base/requests';
import { addAdditives, addMagic } from '../../base/actions';
import { addStructures, deleteStructure, addStructure, editStructure, showModal, addDBFields, addUsers } from './actions';
import { catchErrSaga, requestSaga, requestSagaContinius, repeatedRequests } from '../../base/sagas';
import { convertCmlToBase64, convertCmlToBase64Arr, exportCml } from '../../base/marvinAPI';
import {
  SAGA_INIT_STRUCTURE_LIST_PAGE,
  SAGA_EDIT_STRUCTURE,
  SAGA_DELETE_STRUCTURE,
  SAGA_ADD_STRUCTURE,
  SAGA_GET_RECORDS,
  SAGA_ADD_STRUCTURE_AFTER_VALIDATE,
} from './constants';
import { MARVIN_EDITOR_IS_EMPTY } from '../../config';

function* initStructureListPage({ full }) {
  // const fields = yield call(Settings.getDBFields);
  // let users = yield call(Users.getUsers);
  // const me = yield call(Users.whoAmI);
  // const additives = yield call(getAdditives);
  // const magic = yield call(getMagic);
  // users = users.data.map((user) => {
  //   if (user.user === me.data.user) {
  //     return { ...user, user: 0 };
  //   }
  //   return user;
  // });
  // yield put(addUsers(users));
  // yield put(addDBFields(fields.data));
  // yield put(addAdditives(additives.data));
  // yield put(addMagic(magic.data));
  yield call(requestSaga, getRecordsByUser, {
    full,
    user: 0,
    page: 1,
    database: fields.data[0],
    table: 'molecule',
  });
}

function* getRecordsByUser({ full, user, database, table, page }) {
  //const structures = yield call(Records.getRecords, database, table, full, user, page);
  //yield put(addStructures(structures.data));
}

function* getRecords(action) {
  const data = yield call(Records.getAllbyUser, action.database, action.table, action.user);
  const structures = yield call(convertCmlToBase64Arr, data.data);
  yield put(addStructures(structures));
}

function* requestAddNewStructure({ task,  database, table }) {
  yield call(repeatedRequests, Structures.add, task, database, table);
  yield message.success('Add structure');
}

function* addNewStructure({  database, table, ...conditions }) {
  const data = yield call(exportCml, 'marvinjs_create_page');
  if (data === MARVIN_EDITOR_IS_EMPTY) {
    throw new Error('Structure is empty!');
  }
  const response = yield call(Structures.validate, { data, conditions });
  const task = response.data.task;
  yield put({ type: SAGA_ADD_STRUCTURE_AFTER_VALIDATE, database, table, task });
}

function* deleteStructureInList(action) {
  yield call(Structures.delete, action.id);
  yield put(deleteStructure, action.id);
  yield message.success('Delete structure');
}

function* modalDiscard(action) {
  const { data, params, condition } = action;
  const response = yield call(Structures.edit, action.id, data, params, condition);
  const base64 = yield call(convertCmlToBase64, response.data.data);
  yield put(editStructure({ base64, ...response.data }));
  yield put(showModal(false));
}


export function* sagas() {
  yield takeEvery(SAGA_INIT_STRUCTURE_LIST_PAGE, requestSagaContinius, initStructureListPage);
  yield takeEvery(SAGA_ADD_STRUCTURE, catchErrSaga, addNewStructure);
  yield takeEvery(SAGA_ADD_STRUCTURE_AFTER_VALIDATE, requestSagaContinius, requestAddNewStructure);
  yield takeEvery(SAGA_DELETE_STRUCTURE, requestSaga, deleteStructureInList);
  yield takeEvery(SAGA_EDIT_STRUCTURE, requestSaga, modalDiscard);
  yield takeEvery(SAGA_GET_RECORDS, requestSaga, getRecordsByUser);
}
