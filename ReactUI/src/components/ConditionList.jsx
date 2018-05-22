import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Slider, InputNumber, Row, Col, Button, Switch } from 'antd';
import { SliderEditor, SlidersSelect } from '../components';
import sliderConfig from './formItemConfigs';

const Option = Select.Option;

const ConditionList = ({
  id,
  solvents,
  catalysts,
  models,
  temperature,
  pressure,
  formComponent,
  form,
  type,
}) => {
  function fieldName(name) {
    return `${name}-${type}-${id}`;
  }

  const FormItem = formComponent.Item;
  const { getFieldDecorator } = form;

  return (
    <div>
      <FormItem
        label="Models:"
      >
        {getFieldDecorator(fieldName('models'), {
          rules: [{
            required: true,
            message: 'Please select model!',
          }],
        })(
          <Select
            mode="multiple"
            placeholder="Please select a model"
          >
            { models.map((item, i) =>
              <Option key={item.name + i} value={item.model}>{ item.name }</Option>,
            )}
          </Select>,
        )}
      </FormItem>
      <FormItem
        label="Temperature:"
      >
        {getFieldDecorator(fieldName('temperature'), {
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
        {getFieldDecorator(fieldName('pressure'), {
          initialValue: pressure,
        })(
          <SliderEditor
            {...sliderConfig.pressure}
          />,
        )}
      </FormItem>
      { solvents && !!solvents.length && <FormItem label="Solvents">

        {getFieldDecorator(fieldName('solvents'))(
          <SlidersSelect data={solvents} sumEqual={100} />,
        )}
      </FormItem>}
      { catalysts && !!catalysts.length && <FormItem label="Solvents">

        {getFieldDecorator(fieldName('catalysts'))(
          <SlidersSelect data={catalysts} />,
        )}
      </FormItem>}
    </div>
  );
};

ConditionList.propTypes = {
  selectModel: PropTypes.number,
  models: PropTypes.array,
  catalysts: PropTypes.array,
  solvents: PropTypes.array,
  temperature: PropTypes.number,
  pressure: PropTypes.number,
  id: PropTypes.number,
  type: PropTypes.number,
};

ConditionList.defaultProps = {
  selectModel: null,
  models: [],
  temperature: 298,
  pressure: 1,
  catalysts: [],
  solvents: [],
  type: 0,
};


export default ConditionList;
