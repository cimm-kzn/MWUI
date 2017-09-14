import { TASKS } from '../constants';
import { CONST } from '../../config';

export const tasks = (state = [], action) => {
  switch (action.type) {
    case TASKS.ADD_TASK:
      return [
        {
          id: state.reduce((maxId, task) => Math.max(task.id, maxId), -1) + 1,
          cml: action.arr.cml,
          base64: action.arr.base64,
        },
        ...state,
      ];

    case TASKS.DELETE_TASK:
      state.map(task => task.checked = true);
      return state.filter(task => task.id !== action.id);

    case TASKS.DELETE_ALL_TASKS:
      return [];

    case TASKS.EDIT_TASK:
      return state.map(task => (task.id === action.id ?
        { ...task, cml: action.arr.cml, base64: action.arr.base64, checked: true } : task),
      );

    case TASKS.ADD_TASKS:
      return action.arr;

    case TASKS.CHECK_TASK:
      return state.map(task => (task.id === action.id ?
        { ...task, isCheking: action.check } : task),
      );

    case TASKS.SELECT_ALL_TASKS:
      return state.map(task =>
        ({ ...task, isCheking: 1 }),
      );

    case TASKS.DESELECT_ALL_TASKS:
      return state.map(task => ({ ...task, isCheking: 0 }),
      );

    case TASKS.DELETE_SELECTED_TASKS:
      return state.filter(task => task.isCheking !== 1);

    case TASKS.ADD_MODEL:
      return state.map(task => (task.id === action.id ?
        { ...task, models: action.arr, modelErr: false } : task),
      );

    case TASKS.ADD_SOLV:
      return state.map(task => (task.id === action.id ?
        { ...task, additives: action.arr, total: action.total, solventErr: false } : task),
      );

    case TASKS.ADD_TEMP:
      return state.map(task => (task.id === action.id ?
        { ...task, temperature: action.arr } : task),
      );

    case TASKS.ADD_PRESS:
      return state.map(task => (task.id === action.id ?
        { ...task, pressure: action.arr } : task),
      );

    case TASKS.ADD_AMOUNT:
      return state.map((task) => {
        if (task.id === action.id) {
          return { ...task,
            additives: task.additives.map(add => (add.additive === action.additive ?
              { ...add, amount: action.amount } : add)),
            total: action.total,
            solventErr: false };
        }

        return task;
      });

    case TASKS.ADD_SELECTED_TASK_CONDITION:
      return state.map((task) => {
        if (task.isCheking) {
          let models = [];
          if (task.type === CONST.StructureType.MOLECULE) {
            models = action.obj.models.filter(o => o.type === CONST.ModelType.MOLECULE_MODELING);
          } else if (task.type === CONST.StructureType.REACTION) {
            models = action.obj.models.filter(o => o.type === CONST.ModelType.REACTION_MODELING);
          }

          return { ...task,
            additives: action.obj.additives,
            total: action.obj.total,
            models,
            temperature: action.obj.temperature,
            pressure: action.obj.pressure,
            solventErr: false };
        }

        return task;
      });

    case TASKS.ADD_CAT:
      return state.filter(task => task.id !== action.id);

    case TASKS.ADD_CML_BASE64:
      return state.map(task => (task.id === 0 ?
        { ...task, cml: action.arr.cml, base64: action.arr.base64 } : task),
      );

    case TASKS.ADD_MODEL_ERR:
      return state.map(task => (task.id === action.id ?
        { ...task, modelErr: true } : task),
      );

    case TASKS.ADD_SOLV_ERR:
      return state.map(task => (task.id === action.id ?
        { ...task, solventErr: true } : task),
      );

    default:
      return state;
  }
};

