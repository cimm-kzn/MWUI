import React from 'react';

const tempMarks = {
  200: {
    style: {
      color: '#337ab7',
      marginLeft: '-14%',
    },
    label: <strong>200</strong>,
  },
  400: {
    style: {
      color: '#337ab7',
      marginLeft: '-16%',
    },
    label: <strong>400</strong>,
  },
  298: '298',
  273: '273',
};

const pressMarks = {
  1: {
    style: {
      color: '#337ab7',
      marginLeft: '-45%',
    },
    label: <strong>1</strong>,
  },
  6: {
    style: {
      color: '#337ab7',
      marginLeft: '-45%',
    },
    label: <strong>6</strong>,
  },
};

export const modelSelect = {
  multi: true,
  simpleValue: true,
  disabled: false,
  placeholder: 'Select your model(s)',
};

export const tempSlider = {
  min: 200,
  max: 400,
  marks: tempMarks,
  trackStyle: [{ backgroundColor: '#96dbfa' }],
};

export const pressSlider = {
  min: 1,
  max: 6,
  step: 0.1,
  marks: pressMarks,
  trackStyle: [{ backgroundColor: '#96dbfa' }],
};

export const solvSelect = {
  multi: true,
  simpleValue: true,
  disabled: false,
  placeholder: 'Select your solvent(s)',
};

export const solvSlider = {
  min: 0,
  max: 100,
};
