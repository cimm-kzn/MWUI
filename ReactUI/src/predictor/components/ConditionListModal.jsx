import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Select } from 'antd';
import { ConditionList } from '../../components';
import { getModels, getAdditives } from '../core/selectors';

const typeStructure = [{
  type: 1,
  name: 'Modelling',
},
{
  type: 2,
  name: 'Reaction',
}];

const Option = Select.Option;

const FormItem = Form.Item;

class ConditionListModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeModel: 1,
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleOk() {
    const { form, onOk } = this.props;
    const values = form.getFieldsValue();
    const { typeStructure, ...fields } = values;

    const newFields = Object.keys(fields)
      .reduce((acc, key) => {
        const newKey = key.split('-');
        acc[newKey[0]] = fields[key];
        return acc;
      }, {});

    onOk(typeStructure, newFields);
  }

  handleSelectChange(value) {
    this.setState({ typeModel: value });
  }

  render() {
    const {
      onOk,
      onCancel,
      visible,
      form,
      allModels,
      allAdditives,
    } = this.props;

    const { getFieldDecorator } = form;
    const { typeModel } = this.state;

    return (
      <Modal
        title="Edit conditions"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        okText="Apply"
        cancelText="Close"
      >
        <Form>
          <FormItem
            label="Type structure:"
          >
            {getFieldDecorator('typeStructure', {
              initialValue: typeModel,
            })(
              <Select
                onChange={val => this.handleSelectChange(val)}
              >
                {typeStructure.map((item, i) =>
                  <Option key={item.name + i} value={item.type}>{item.name}</Option>,
                )}
              </Select>,
            )}
          </FormItem>
          <ConditionList
            id="translation"
            formComponent={Form}
            form={form}
            models={allModels.filter(model => model.type === typeModel)}
            catalysts={allAdditives.solvents}
            solvents={allAdditives.catalysts}
          />
        </Form>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  allModels: getModels(state),
  allAdditives: getAdditives(state),
});


export default Form.create()(connect(mapStateToProps)(ConditionListModal));
