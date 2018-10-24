import React from 'react';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { getUsers } from '../core/selectors';


const Option = Select.Option;

const DatabaseSelect = ({ form, formComponent, users }) => {
  const FormItem = formComponent.Item;
  const { getFieldDecorator } = form;

  return (
    <FormItem label="User">
      {getFieldDecorator('user', {
        ...users && { initialValue: users[0].id },
      })(
        <Select placeholder="choose..">
          {users && users.map(user =>
            <Option key={user.name} value={user.id}>{user.name}</Option>,
          )}
        </Select>,
      )}
    </FormItem>
  );
};


const mapStateToProps = state => ({
  users: getUsers(state),
});

export default connect(mapStateToProps)(DatabaseSelect);
