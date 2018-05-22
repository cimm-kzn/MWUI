import axios from 'axios';
import { API_URLS } from '../config';


export const createSearchTask = data => axios.post(API_URLS.CREATE_TASK_SEARCH, data);

export const createModellingTask = data => axios.post(API_URLS.CREATE_TASK_PREDICTOR, data);

export const getSearchTask = task => axios.get(API_URLS.PREPARE_TASK + task);

export const getModels = () => axios.get(API_URLS.MODELS);

export const getAdditives = () => axios.get(API_URLS.ADDITIVES);

export const getMagic = () => axios.get(API_URLS.MAGIC);

export const createResultTask = (cml, task) => axios.post(API_URLS.RESULT + task, cml);

export const getResultTask = task => axios.get(API_URLS.RESULT + task);

export const deleteStructure = (task, structure) => axios.post(API_URLS.PREPARE_TASK + task, structure);

export const revalidateStructure = (task, structure) => axios.post(API_URLS.PREPARE_TASK + task, structure);
