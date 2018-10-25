import { takeEvery, call, put } from 'redux-saga/effects';
import { message } from 'antd';
import Request from '../../base/request';
import { addAdditives, addMagic, succsessRequest, modal } from '../../base/actions';
import { addStructures, deleteStructure, addStructureRecord, editStructure, addDBFields, addUsers, addPages } from './actions';
import { catchErrSaga, requestSaga, requestSagaContinius, repeatedRequests } from '../../base/sagas';
import { convertCmlToBase64Arr, exportCml, importCml, convertCmlToBase64 } from '../../base/marvinAPI';
import {
  SAGA_INIT_STRUCTURE_LIST_PAGE,
  SAGA_EDIT_STRUCTURE,
  SAGA_DELETE_STRUCTURE,
  SAGA_ADD_STRUCTURE,
  SAGA_GET_RECORDS,
  SAGA_ADD_STRUCTURE_AFTER_VALIDATE,
  SAGA_EDIT_STRUCTURE_ON_OK,
  SAGA_EDIT_STRUCTURE_AFTER_VALIDATE,
} from './constants';
import { MARVIN_EDITOR_IS_EMPTY } from '../../config';

function* initStructureListPage({ full }) {
  const fields = yield call(Request.listOfDatabases.get);
  const users = yield call(Request.listOfUsers.get);
  const me = yield call(Request.authorization.get);
  const additives = yield call(Request.additives.get);
  const magic = yield call(Request.magic.get);
  yield put(addUsers(users.data));
  yield put(addDBFields(fields.data));
  yield put(addAdditives(additives.data));
  yield put(addMagic(magic.data));
  yield call(requestSaga, getRecordsByUser, {
    full,
    user: me.data.user,
    page: 1,
    database: fields.data[0].name,
    table: 'molecule',
  });
}

function* getRecordsByUser({ full, user, database, table, page }) {
  const data = yield call(full ? Request.tablePageDataForUser.get : Request.tablePageMetadateForUser.get, { database, table, page, user });
  const pages = yield call(Request.tablePageAndCountForUser.get, { database, table, user });
  const structures = yield call(convertCmlToBase64Arr, data.data);
  yield put(addStructures(structures));
  yield put(addPages(pages.data));
}

function* requestAddNewStructure({ task, database, table }) {
  // yield call(repeatedRequests, Structures.add, { task, database, table });
  // yield put(succsessRequest());
  // yield message.success('Add structure');
}

function* addNewStructure({ conditions }) {
  // const data = yield call(exportCml, 'marvinjs_create_page');
  // if (data === MARVIN_EDITOR_IS_EMPTY) {
  //   throw new Error('Structure is empty!');
  // }
  // const response = yield call(Structures.validate, { data, ...conditions });
  // const task = response.data.task;
  // const { database, table } = conditions;
  // yield put({ type: SAGA_ADD_STRUCTURE_AFTER_VALIDATE, database, table, task });
}

function* deleteStructureInList({ database, table, record }) {
  yield call(Request.tableDataRecord.del, { database, table, record });
  yield put(deleteStructure(record));
  yield message.success('Delete structure');
}

function* editStructureModal({ data, database, table, record }) {
  if (!data) {
    const structMeta = yield call(Request.tableDataRecord.get, { database, table, record });
    yield put(addStructureRecord(record, structMeta.data));
    yield importCml(structMeta.data.data);
  } else {
    yield importCml(data);
  }

  yield put(modal(true, null, { record, database, table }));
}

function* editStructureModalOnOk({ conditions, structure }) {
  const { metadata, database, table } = structure;

  const data = yield call(exportCml);
  if (data === MARVIN_EDITOR_IS_EMPTY) {
    throw new Error('Structure is empty!');
  }
  const response = yield call(Request.tableDataRecord.set, { data, ...conditions });
  const task = response.data.task;
  yield put({ type: SAGA_EDIT_STRUCTURE_AFTER_VALIDATE, database, table, task, metadata });
}

function* requestEditStructure({ database, table, task, record }) {
  const structure = yield call(repeatedRequests, Request.tableDataRecord.set, { task, database, table, record });
  const base64 = yield call(convertCmlToBase64, structure.data.data);
  yield put(editStructure(record, { ...structure.data, base64 }));
  yield put(modal(false));
  yield put(succsessRequest());
  yield message.success('Update structure');
}


export function* sagas() {
  yield takeEvery(SAGA_INIT_STRUCTURE_LIST_PAGE, requestSagaContinius, initStructureListPage);
  yield takeEvery(SAGA_ADD_STRUCTURE, catchErrSaga, addNewStructure);
  yield takeEvery(SAGA_ADD_STRUCTURE_AFTER_VALIDATE, requestSagaContinius, requestAddNewStructure);
  yield takeEvery(SAGA_DELETE_STRUCTURE, requestSaga, deleteStructureInList);

  yield takeEvery(SAGA_EDIT_STRUCTURE, catchErrSaga, editStructureModal);
  yield takeEvery(SAGA_EDIT_STRUCTURE_ON_OK, catchErrSaga, editStructureModalOnOk);
  yield takeEvery(SAGA_EDIT_STRUCTURE_AFTER_VALIDATE, requestSagaContinius, requestEditStructure);

  yield takeEvery(SAGA_GET_RECORDS, requestSaga, getRecordsByUser);
}
