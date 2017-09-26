import queryString from 'query-string';
import { API } from '../config';

export const validateTasks = tasks => ({
  url: API.CREATE_TASK,
  body: tasks.map(obj => ({ data: obj.cml })),
  options: { credentials: 'include', headers: { 'Content-Type': 'application/json' } },
});

export const getModels = () => ({
  url: API.MODELS,
  transform: body => ({
    models: body.map(o => ({ label: o.name, value: o.model, type: o.type, description: o.description })),
  }),
  update: {
    models: (prev, next) => next,
  },
  options: { credentials: 'include' },
});

export const getAdditives = () => ({
  url: API.ADDITIVES,
  transform: body => ({
    additives: body.map(o => ({ label: o.name, value: o.additive, type: o.type })),
  }),
  update: {
    additives: (prev, next) => next,
  },
  options: { credentials: 'include' },
});

export const getConstatns = () => ({
  url: API.CONSTANTS,
  transform: (body, text) => ({
    constants: body,
  }),
  update: {
    constants: (prev, next) => next,
  },
  options: { credentials: 'include' },
});

export const getTasks = () => {
  const taskId = queryString.parse(window.location.hash)['/prepare/?task'];
  return {
    url: API.PREPARE_TASK + taskId,
    transform: body => ({
      task: body,
    }),
    update: {
      task: (prev, next) => next,
    },
    options: {
      credentials: 'include',
      headers: { 'Content-Type': '*/*' },
    },
    meta: {
      pointer: 'task',
    },
    force: true,
  };
};

export const deleteTasks = (arrId) => {
  const taskId = queryString.parse(window.location.hash)['/prepare/?task'];
  return {
    url: API.PREPARE_TASK + taskId,
    body: arrId.map(id => ({ structure: id, todelete: true }))[0],
    options: { credentials: 'include' },
  };
};

export const uploadFile = file => ({
  url: API.UPLOAD_FILE,
  body: file,
  options: { credentials: 'include',
    headers: { contentType: 'multipart/form-data',
      cache: false },
  },
});

export const modellingStructures = (tasks) => {
  const taskId = queryString.parse(window.location.hash)['/prepare/?task'];
  return {
    url: API.RESULT + taskId,
    body: tasks.map(obj => ({
      data: obj.cml,
      models: obj.models,
      temperature: obj.temperature,
      pressure: obj.pressure,
      additives: obj.additives.map(o => ({ ...o, amount: Math.round(o.amount) / 100 })),
      structure: obj.id })),
    options: { credentials: 'include' },
  };
};

export const revalidatingStructures = (tasks) => {
  const taskId = queryString.parse(window.location.hash)['/prepare/?task'];
  return {
    url: API.PREPARE_TASK + taskId,
    body: tasks.map(obj => ({
      data: obj.cml,
      models: obj.models,
      temperature: obj.temperature,
      pressure: obj.pressure,
      additives: obj.additives.map(o => ({ ...o, amount: Math.round(o.amount)/ 100 })),
      structure: obj.id })),
    options: { credentials: 'include' },
  };
};

export const saveTaskQuery = () => {
  const taskId = queryString.parse(window.location.hash)['/result/?task'];
  return {
    url: API.SAVE_TASK + taskId,
    options: { credentials: 'include' },
  };
};

export const getResults = () => {
  const taskId = queryString.parse(window.location.hash)['/result/?task'];
  return {
    url: API.RESULT + taskId,
    transform: body => ({
      task: body,
    }),
    update: {
      task: (prev, next) => next,
    },
    options: {
      credentials: 'include',
    },
    meta: {
      pointer: 'resultTask',
    },
  };
};
