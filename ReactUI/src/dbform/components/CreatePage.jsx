import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Form } from 'antd';
import { normalizeDBFormData } from '../../base/functions';
import { DBConditionList } from '../hoc';
import { MARVIN_PATH_IFRAME } from '../../config';
import { SAGA_ADD_STRUCTURE } from '../core/constants';

class CreatePage extends Component {
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();

    const { form, createStructure } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        //const conditions = normalizeDBFormData(values);
        //createStructure(conditions);
      }
    });
  }


  handlersReset() {

  }

  render() {

    const { form } = this.props;

    return (
      <Form
        onSubmit={this.handleSubmit}
      >
        <Row gutter={30}>
          <Col md={14}>
            <iframe
              title="marvinjs"
              id="marvinjs_create_page"
              data-toolbars="reaction"
              src={MARVIN_PATH_IFRAME}
              width="100%"
              height={500}
              style={{ border: '1px dashed #d9d9d9', padding: '10px' }}
            />
          </Col>
          <Col md={10}>
            <DBConditionList
              form={form}
              formComponent={Form}
            />
          </Col>
          <Col md={24}>
            <Button
              size="large"
              onClick={this.handlersReset.bind(this)}
            >
                        Reset
            </Button>
            <Button
              className="pull-right"
              type="primary"
              icon="upload"
              size="large"
              htmlType="submit"
            >Submit</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

const mapStateToProps = state => ({
  condition: state.settings.condition,
  autoreset: state.settings.auto_reset,
});


const mapDispatchToProps = dispatch => ({
  createStructure: (conditions) => dispatch({ type: SAGA_ADD_STRUCTURE, conditions }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(CreatePage));
