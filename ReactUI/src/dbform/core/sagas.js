import { takeEvery, call, put } from 'redux-saga/effects';
import { message } from 'antd';
import { Structures, Records, Settings, Users } from './requests';
import { getAdditives, getMagic } from '../../base/requests';
import { addAdditives, addMagic, succsessRequest, modal } from '../../base/actions';
import { addStructures, deleteStructure, addStructureMetadata, editStructure, addDBFields, addUsers, addPages } from './actions';
import { catchErrSaga, requestSaga, requestSagaContinius, repeatedRequests } from '../../base/sagas';
import { convertCmlToBase64, convertCmlToBase64Arr, exportCml, importCml } from '../../base/marvinAPI';
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
  const fields = yield call(Settings.getDBFields);
  let users = yield call(Users.getUsers);
  const me = yield call(Users.whoAmI);
  const additives = yield call(getAdditives);
  const magic = yield call(getMagic);
  users = users.data.map((user) => {
    if (user.user === me.data.user) {
      return { ...user, user: 0 };
    }
    return user;
  });
  yield put(addUsers(users));
  yield put(addDBFields(fields.data));
  yield put(addAdditives(additives.data));
  yield put(addMagic(magic.data));
  yield call(requestSaga, getRecordsByUser, {
    full,
    user: 0,
    page: 1,
    database: fields.data[0],
    table: 'molecule',
  });
}

function* getRecordsByUser({ full, user, database, table, page }) {
  const data = yield call(Records.getRecords, database, table, full, user, page);
  const pages = yield call(Structures.getPages, { database, table });
  const structures = yield call(convertCmlToBase64Arr, data.data);
  yield put(addStructures(structures));
  yield put(addPages(pages.data));
}

function* requestAddNewStructure({ task, database, table }) {
  yield call(repeatedRequests, Structures.add, { task, database, table });
  yield put(succsessRequest());
  yield message.success('Add structure');
}

function* addNewStructure({ conditions }) {
  const data = yield call(exportCml, 'marvinjs_create_page');
  if (data === MARVIN_EDITOR_IS_EMPTY) {
    throw new Error('Structure is empty!');
  }
  const response = yield call(Structures.validate, { data, ...conditions });
  const task = response.data.task;
  const { database, table } = conditions;
  yield put({ type: SAGA_ADD_STRUCTURE_AFTER_VALIDATE, database, table, task });
}

function* deleteStructureInList({ database, table, metadata }) {
  yield call(Structures.delete, { database, table, metadata });
  yield put(deleteStructure(metadata));
  yield message.success('Delete structure');
}

function* editStructureModal({ data, database, table, metadata }) {
  if (!data) {
    const structMeta = yield call(Structures.get, { database, table, metadata });
    yield put(addStructureMetadata(metadata, structMeta.data));
    yield importCml(structMeta.data.data);
  } else {
    yield importCml(data);
  }

  yield put(modal(true, null, { metadata, database, table }));
}

function* editStructureModalOnOk({ conditions, structure }) {

  const { metadata, database, table } = structure;

  const data = yield call(exportCml);
  if (data === MARVIN_EDITOR_IS_EMPTY) {
    throw new Error('Structure is empty!');
  }
  const response = yield call(Structures.validate, { data, ...conditions });
  const task = response.data.task;
  yield put({ type: SAGA_EDIT_STRUCTURE_AFTER_VALIDATE, database, table, task, metadata });
}

function* requestEditStructure({ database, table, task, metadata }) {
  const structure = yield call(repeatedRequests, Structures.edit, { task, database, table, metadata });
  yield put(editStructure(metadata, structure.data));
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
