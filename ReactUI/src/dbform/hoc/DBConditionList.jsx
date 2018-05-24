import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import { SliderEditor, DynamicForm } from '../../components';
import sliderConfig from '../../components/formItemConfigs';
import DatabaseSelect from './DatabaseSelect';
import DatabaseTableSelect from './DatabaseTableSelect';
import AdditivesSelect from './AdditivesSelect';
import { getSettings } from '../core/selectors';

const DBConditionList = ({
  formComponent,
  form,
  settings,
}) => {
  const FormItem = formComponent.Item;
  const { getFieldDecorator } = form;
  const { temperature, pressure } = settings.condition;

  return (
    <div>
      <DatabaseSelect
        formComponent={Form}
        form={form}
      />
      <DatabaseTableSelect
        formComponent={Form}
        form={form}
      />
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
      <DynamicForm
        formComponent={formComponent}
        form={form}
      />
      <AdditivesSelect
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
