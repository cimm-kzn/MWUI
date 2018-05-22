import React from 'react';
import { Select } from 'antd';

const Option = Select.Option;

const DatabaseTableSelect = ({ form, formComponent }) => {

  const FormItem = formComponent.Item;
  const { getFieldDecorator } = form;

  return (
    <FormItem label="Table">
      {getFieldDecorator('table', {
        initialValue: 'molecule',
      })(
        <Select>
          <Option key="0" value="molecule">molecule</Option>
          <Option key="1" value="reaction">reaction</Option>
        </Select>,
      )}
    </FormItem>
  );
};

export default DatabaseTableSelect;