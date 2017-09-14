import { mutateAsync } from 'redux-query';
import { validateTasks, deleteTasks, uploadFile, modellingStructures, revalidatingStructures } from '../queries';

export const validateTaskOuery = tasks => mutateAsync(validateTasks(tasks));
export const deleteTaskOuery = arrId => mutateAsync(deleteTasks(arrId));
export const uploadFileQuery = file => mutateAsync(uploadFile(file));
export const modellingStructuresQuery = tasks => mutateAsync(modellingStructures(tasks));
export const revalidatingStructuresQuery = tasks => mutateAsync(revalidatingStructures(tasks));
