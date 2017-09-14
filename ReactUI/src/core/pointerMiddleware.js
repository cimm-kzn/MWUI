import { addTasks } from './actions/tasks';
import { addBase64Arr } from './marvinJsApi/marvinAPI';

export const pointer = store => next => (action) => {
  if (action.meta) {
    if (action.entities && action.meta.pointer === 'task') {
      addBase64Arr(action.entities.task.structures,
        (data) => {
          const dataRed = data.map(obj => ({
            id: obj.structure,
            cml: obj.data,
            base64: obj.base64,
            temperature: obj.temperature,
            pressure: obj.pressure,
            type: obj.type,
            checked: false,
            models: obj.models.filter(model => model.type !== 0),
            additives: obj.additives.map(o => ({ ...o, label: o.name, amount: o.amount * 100 })) || [],
            modelErr: false,
            solventErr: false,
            total: obj.additives.reduce((a, b) => a + b.amount, 0) * 100,
          }),
          );
          store.dispatch(addTasks(dataRed));
        },
      );
    }

    if (action.entities && action.meta.pointer === 'resultTask') {
      addBase64Arr(action.entities.task.structures,
        (data) => {
          const dataRed = data.map(obj => ({
            id: obj.structure,
            cml: obj.data,
            base64: obj.base64,
            temperature: obj.temperature,
            pressure: obj.pressure,
            type: obj.type,
            checked: false,
            modelsResult: obj.models.filter(model => model.type !== 0),
            additives: obj.additives.map(o => ({ ...o, label: o.name, amount: o.amount * 100 })) || [],
            modelErr: false,
            solventErr: false,
          }),
          );
          store.dispatch(addTasks(dataRed));
        },
      );
    }
  }
  return next(action);
};
