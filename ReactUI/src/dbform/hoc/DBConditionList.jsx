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
            type: 'array',
            message: 'Please add key or value!',
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
