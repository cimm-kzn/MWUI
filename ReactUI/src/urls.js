import axios from 'axios';
import queryString from 'query-string';


function prepareUrl(template, base, getParams = null) {
  let url = '';
  for (const key in base) {
    url = template.replace(`{${key}}`, base[key]);
  }

  if (getParams) {
    const getKey = Object.keys(getParams).reduce((acc, key) => {
      if (getParams[key]) {
        acc[key] = getParams[key];
      }
      return acc;
    }, {});

    return `${url}?${queryString.stringify(getKey)}`;
  }

  return url;
}


export const API_URL = {
  authorization: '/api/auth/',
  listOfDatabases: '/api/db/',
  listOfUsers: '/api/db/users/',
  userDatabases: '/api/db/users/{user}/',
  userProfile: '/api/db/users/{user}/profile',
  deleteUserDatabase: '/api/db/users/{user}/{database}',
  tableMetadataForUser: '/api/db/users/{user}/{database}/{table}',
  tableDataForUser: '/api/db/users/{user}/{database}/{table}/full',
  tablePageAndCountForUser: '/api/db/users/{user}/{database}/{table}/pages/count',
  tablePageMetadateForUser: '/api/db/users/{user}/{database}/{table}/pages/{page}',
  tablePageDataForUser: '/api/db/users/{user}/{database}/{table}/pages/{page}/full',
  tableMetadataForMe: '/api/db/{database}/{table}',
  tableDataForMe: '/api/db/{database}/{table}/full',
  tablePageAndCountForMe: '/api/db/{database}/{table}/pages/count',
  tablePageMetadateForMe: '/api/db/users/{database}/{table}/pages/{page}',
  tablePageDataForMe: '/api/db/{database}/{table}/pages/{page}/full',
  tableMetadateForMeToRecord: '/api/db/{database}/{table}/{record}',

};

const Request = (apiUrl) => {
  function get(params) {
    return axios.get(prepareUrl(this.url, params));
  }

  function set(params, data) {
    return axios.post(prepareUrl(this.url, params));
  }

  function del(params, data) {
    return axios.delete(prepareUrl(this.url, params));
  }

  return Object.keys(apiUrl).reduce((acc, key) => {
    acc[key] = { url: apiUrl[key], get, set, del };
    return acc;
  }, {});
};

const recvest = Request(API_URL);
console.log(recvest.authorization);

