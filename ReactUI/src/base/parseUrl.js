import queryString from 'query-string';

/**
 * Get current url path
 * @return {string}
 */
const pathUrl = () => window.location.hash.replace('#', '');

/**
 * Get current url params
 * @return {string}
 */
export const getUrlParams = () => {
  const path = pathUrl();
  return queryString.parse(path.split('?')[1]);
};

/**
 * Get current url path
 * @return {*}
 */
export const getUrlPath = () => {
  const path = pathUrl();
  return path.split('?')[0];
};

/**
 * Concatenation of url and parameters to the form url/?param1=value1&param2=value2...
 * @param {string} url
 * @param {object} params
 * @returns {string}
 */
export const stringifyUrl = (url, params) => `${url}?${queryString.stringify(params)}`;
