import { TASKS } from '../constants';

export const addTasks = arr => ({
  type: TASKS.ADD_TASKS, arr,
});

export const addTask = arr => ({
  type: TASKS.ADD_TASK, arr,
});

export const deleteTask = id => ({
  type: TASKS.DELETE_TASK, id,
});

export const structureCheck = id => ({
  type: TASKS.CHECK_TASK, id,
});

export const deleteTasks = arrId => ({
  type: TASKS.DELETE_TASKS, arrId,
});

export const deleteAllTasks = () => ({
  type: TASKS.DELETE_ALL_TASKS,
});

export const selectAll = () => ({
  type: TASKS.SELECT_ALL_TASKS,
});

export const deselectAll = () => ({
  type: TASKS.DESELECT_ALL_TASKS,
});

export const deleteSelected = () => ({
  type: TASKS.DELETE_SELECTED_TASKS,
});

export const editTask = (id, arr) => ({
  type: TASKS.EDIT_TASK, id, arr,
});

export const addCat = (id, arr) => ({
  type: TASKS.ADD_CAT, id, arr,
});

export const addSolv = (id, arr, total) => ({
  type: TASKS.ADD_SOLV, id, arr, total,
});

export const setSelectedCondition = (obj) => ({
  type: TASKS.ADD_SELECTED_TASK_CONDITION, obj,
});

export const addCmlBase64 = (id, arr) => ({
  type: TASKS.ADD_CML_BASE64, id, arr,
});

export const addModel = (id, arr) => ({
  type: TASKS.ADD_MODEL, id, arr,
});

export const addPress = (id, arr) => ({
  type: TASKS.ADD_PRESS, id, arr,
});

export const addTemp = (id, arr) => ({
  type: TASKS.ADD_TEMP, id, arr,
});

export const addAmount = (id, additive, amount, total) => ({
  type: TASKS.ADD_AMOUNT, id, additive, amount, total,
});

export const addModelErr = id => ({
  type: TASKS.ADD_MODEL_ERR, id,
});

export const addSolvErr = id => ({
  type: TASKS.ADD_SOLV_ERR, id,
});
