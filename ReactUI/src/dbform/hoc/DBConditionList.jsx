import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form } from 'antd';
import { SliderEditor, DynamicForm } from '../../components';
import sliderConfig from '../../components/formItemConfigs';
import AdditivesSelect from './AdditivesSelect';
import { getSettings } from '../core/selectors';

const DBConditionList = ({
  formComponent,
  form,
  settings,
  data,
}) => {
  const FormItem = formComponent.Item;
  const { getFieldDecorator } = form;
  const {
    temperature,
    pressure,
    description,
    catalysts,
    solvents,
  } = data || settings.condition;

  const validateDynamicForm = (rule, values, cb) => {
    if (values.every(v => v.key && v.value)) {
      cb();
    } else {
      cb('Please fill in the fields');
    }
  };

  return (
    <div>
      <FormItem
        label="Temperature:"
      >
        {getFieldDecorator('temperature', {
          initialValue: temperature,
        })(
          <SliderEditor
            {...sliderConfig.temperature}
          />,
        )}
      </FormItem>
      <FormItem
        label="Pressure (atm): "
      >
        {getFieldDecorator('pressure', {
          initialValue: pressure,
        })(
          <SliderEditor
            {...sliderConfig.pressure}
          />,
        )}
      </FormItem>
      <FormItem
        label="Descriptions:"
      >
        {getFieldDecorator('description', {
          initialValue: description || [{ key: '', value: '' }],
          rules: [{
            required: true,
          }, {
            validator: validateDynamicForm,
          }],
        })(
          <DynamicForm />,
        )}
      </FormItem>
      <AdditivesSelect
        defaultSolvents={solvents}
        defaultCatalysts={catalysts}
        formComponent={Form}
        form={form}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  settings: getSettings(state),
});

export default connect(mapStateToProps)(DBConditionList);
