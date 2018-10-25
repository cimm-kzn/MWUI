import React from 'react';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { getDatabase } from '../core/selectors';


const Option = Select.Option;

const DatabaseSelect = ({ form, formComponent, database }) => {

  const FormItem = formComponent.Item;
  const { getFieldDecorator } = form;

  return (
    <FormItem label="Database">
      {getFieldDecorator('database', {
        initialValue: database && database[0].name,
      })(
        <Select placeholder="choose..">
          {database && database.map((field, i) =>
            <Option key={i} value={field.name}>{field.name}</Option>,
          )}
        </Select>,
      )}
    </FormItem>
  );
};


const mapStateToProps = state => ({
  database: getDatabase(state),
});

export default connect(mapStateToProps)(DatabaseSelect);
