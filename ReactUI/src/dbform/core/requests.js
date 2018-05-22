import axios from 'axios';
import { API_URLS } from '../../config';
import { urlConverter } from '../../base/functions';


const Structures = {
  getAll: () => axios.get(API_URLS.STRUCTURES),
  validate: data => axios.post(API_URLS.CREATE_TASK_DBFORM, { ...data }),
  add: (task, database, table) => axios({
    method: 'post',
    url: urlConverter(API_URLS.RECORDS, { database, table }),
    data: { task } },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ),
  delete: id => axios.delete(`${API_URLS.STRUCTURES}/${id}`),
  edit: (id, data, params, condition) => axios.put(`${API_URLS.STRUCTURES}/${id}`, { data, params, condition }),
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
