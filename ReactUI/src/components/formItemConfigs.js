import React from 'react';

const sliderConfig = {
  temperature: {
    max: 400,
    min: 200,
    marks: {
      200: {
        style: {
          color: '#1890ff',
        },
        label: <strong>200</strong>,
      },
      273: '273',
      298: '298',
      400: {
        style: {
          color: '#f50',
        },
        label: <strong>400</strong>,
      },
    },
    step: 1,
  },
  pressure: {
    max: 6,
    min: 0,
    marks: {
      0: {
        style: {
          color: '#1890ff',
        },
        label: <strong>0</strong>,
      },
      1: '1',
      3: '3',
      6: {
        style: {
          color: '#f50',
        },
        label: <strong>6</strong>,
      },
    },
    step: 0.1,
  },
  grid: {
    max: 4,
    min: 1,
    marks: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
    },
    step: 1,
  },
};

export default sliderConfig;
