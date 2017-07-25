import {combineReducers} from 'redux'
import triggerModal from './modal';
import tasks from './tasks'

const rootReducer = combineReducers({triggerModal, tasks});

export default rootReducer
