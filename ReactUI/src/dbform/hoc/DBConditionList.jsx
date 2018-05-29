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
      <DynamicForm
        description={description}
        formComponent={formComponent}
        form={form}
      />
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
