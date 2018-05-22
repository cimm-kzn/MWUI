import { message } from 'antd';
import { delay } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { REPEATED_REQUESTS } from '../config';
import { startRequest, succsessRequest, errorRequest } from './actions';


function* repeatedRequests(request, data) {
  let error;
  for (let i = 1; i <= REPEATED_REQUESTS.RETRY; i += 1) {
    try {
      const responseData = yield call(request, data);
      return responseData;
    } catch (err) {
      error = err;
      if (i < REPEATED_REQUESTS.RETRY) {
        yield call(delay, REPEATED_REQUESTS.TIMEOUT);
      }
    }
  }
  throw new Error(error);
}

function* requestSaga(fn, action) {
  try {
    yield put(startRequest());
    yield call(fn, action);
    yield put(succsessRequest());
  } catch (e) {
    yield put(errorRequest(e.message, action));
  }
}

function* requestSagaContinius(fn, action) {
  try {
    yield put(startRequest());
    yield call(fn, action);
  } catch (e) {
    yield put(errorRequest(e.message, action));
  }
}

function* catchErrSaga(fn, action) {
  try {
    yield call(fn, action);
  } catch (e) {
    yield call(message.error, e.message);
  }
}


export { repeatedRequests, requestSaga, catchErrSaga, requestSagaContinius };
