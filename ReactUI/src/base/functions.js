import queryString from 'query-string';
/**
 * Merges two (or more) objects, giving the last one precedence.
 * @param {object} target Object precedence
 * @param {object} source Object
 * @returns {object}
 */
function merge(target, source) {
  if (typeof target !== 'object') {
    target = {};
  }

  for (const property in source) {
    if (source.hasOwnProperty(property)) {
      const sourceProperty = source[property];

      if (typeof sourceProperty === 'object') {
        target[property] = merge(target[property], sourceProperty);
        continue;
      }

      target[property] = sourceProperty;
    }
  }

  for (let a = 2, l = arguments.length; a < l; a++) {
    merge(target, arguments[a]);
  }

  return target;
}

function urlConverter(template, base, get = null) {
  for (const key in base) {
    template = template.replace(`:${key}`, base[key]);
  }
  if (get) {
    const getKey = Object.keys(get).reduce((acc, key) => {
      if (get[key]) {
        acc[key] = get[key];
      }
      return acc;
    }, {});

    template = `${template}?${queryString.stringify(getKey)}`;
  }

  return template;
}

function getWindowSize() {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight;

  return { x, y };
}

const gridSize = {
  xs:	[0, 575],
  sm: [576, 767],
  md: [768, 991],
  lg: [992, 1199],
  xl: [1200, 1599],
  xxl: [1600, 3000],
};

function currentGrid() {
  const size = getWindowSize();

  const gridKey = Object.keys(gridSize).filter((key) => {
    if (gridSize[key][0] <= size.x && gridSize[key][1] >= size.x) {
      return true;
    }
  });

  return gridKey[0];
}

function normalizeDBFormData(values) {
  const {
    temperature,
    pressure,
    database,
    table,
  } = values;

  const description = values.keys.map(k => ({
    key: values[`key-${k.id}`],
    value: values[`value-${k.id}`],
  }));



  return { temperature, pressure, database, table, description };
}

export { merge, urlConverter, getWindowSize, currentGrid, normalizeDBFormData };
