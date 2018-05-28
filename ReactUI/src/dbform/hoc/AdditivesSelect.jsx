import React from 'react';
import { connect } from 'react-redux';
import { SlidersSelect } from '../../components';
import { getAdditivesForSelect } from '../core/selectors';


const AdditivesSelect = ({
  form,
  formComponent,
  additives,
  defaultSolvents,
  defaultCatalysts,
}) => {
  const FormItem = formComponent.Item;
  const { getFieldDecorator } = form;
  const { solvents, catalysts } = additives;

  return (
    <div>
      <FormItem label="Solvents">
        {getFieldDecorator('solvents', {
          initialValue: defaultSolvents || [],
        })(
          <SlidersSelect data={solvents} sumEqual={100} />,
        )}
      </FormItem>
      <FormItem label="Catalysts">
        {getFieldDecorator('catalysts', {
          initialValue: defaultCatalysts || [],
        })(
          <SlidersSelect data={catalysts} />,
        )}
      </FormItem>
    </div>
  );
};

const mapStateToProps = state => ({
  additives: getAdditivesForSelect(state),
});

export default connect(mapStateToProps)(AdditivesSelect);
