import axios from 'axios';
import { API_URLS } from '../../config';
import { urlConverter } from '../../base/functions';


const Structures = {
  getAll: () => axios.get(API_URLS.STRUCTURES),
  validate: data => axios.post(API_URLS.CREATE_TASK_DBFORM, { ...data }),
  add: ({ task, database, table }) => axios.post(urlConverter(API_URLS.RECORDS, { database, table }), { task }),
  delete: ({ database, table, metadata }) => axios.delete(urlConverter(API_URLS.RECORDS_METADATA, { database, table, metadata })),
  edit: ({ database, table, metadata, task }) => axios.post(urlConverter(API_URLS.RECORDS_METADATA, { database, table, metadata }), { task }),
  getPages: ({ database, table }) => axios.get(urlConverter(API_URLS.PAGES, { database, table })),
  get: ({ database, table, metadata }) => axios.get(urlConverter(API_URLS.RECORDS_METADATA, { database, table, metadata })),
};

const Settings = {
  getAll: () => axios.get(API_URLS.SETTINGS),
  getDBFields: () => axios.get(API_URLS.DB_FIELDS),
};

const Users = {
  getUsers: () => axios.get(API_URLS.USERS),
  whoAmI: () => axios.get(API_URLS.WHOAMI),
};

const Records = {
  getRecords: (database, table, full, user, page) =>
    axios.get(urlConverter(API_URLS.RECORDS, { database, table }, { full, user, page })),
};

export { Structures, Settings, Records, Users };
