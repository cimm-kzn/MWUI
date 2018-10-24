import axios from 'axios';
import queryString from 'query-string';
import { API_URL } from '../urls';


function prepareUrl(template, base, getParams = null) {
  if (!base) return template;
  let url = template;
  for (const key in base) {
    url = url.replace(`{${key}}`, base[key]);
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

const Request = (apiUrl) => {
  const get = url => (params, getParams) => axios.get(prepareUrl(url, params, getParams));

  const set = url => (params, data = null) => axios.post(prepareUrl(url, params), data);

  const del = url => (params, data = null) => axios.delete(prepareUrl(url, params), data);

  return Object.keys(apiUrl).reduce((acc, key) => {
    acc[key] = { url: apiUrl[key],
      get: get(apiUrl[key]),
      set: set(apiUrl[key]),
      del: del(apiUrl[key]) };
    return acc;
  }, {});
};

export default Request(API_URL);
