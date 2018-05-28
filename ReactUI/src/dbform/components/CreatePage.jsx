import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Row, Col, Form } from 'antd';
import { getRequest, getSettings } from '../core/selectors';
import { normalizeDBFormData } from '../../base/functions';
import { DatabaseTableSelect, DatabaseSelect, DBConditionList } from '../hoc';
import { MARVIN_PATH_IFRAME } from '../../config';
import { SAGA_ADD_STRUCTURE } from '../core/constants';

class CreatePage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlersReset = this.handlersReset.bind(this);
  }

  componentWillUpdate(nextProps) {
    const { form, settings: { autoreset }, request } = this.props;

    if (autoreset
      && request.loading
      && !nextProps.request.loading
      && !nextProps.request.error) {
      form.resetFields();
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const { form, createStructure } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        const conditions = normalizeDBFormData(values);
        createStructure(conditions);
      }
    });
  }

  handlersReset() {
    const { form } = this.props;
    form.resetFields();
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
            <DatabaseSelect
              formComponent={Form}
              form={form}
            />

            <DatabaseTableSelect
              formComponent={Form}
              form={form}
            />
            <DBConditionList
              form={form}
              formComponent={Form}
            />
          </Col>
          <Col md={24}>
            <Button
              size="large"
              onClick={this.handlersReset}
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

CreatePage.propTypes = {
  form: PropTypes.object,
  createStructure: PropTypes.func.isRequired,
  settings: PropTypes.object,
  request: PropTypes.object,
};

const mapStateToProps = state => ({
  settings: getSettings(state),
  request: getRequest(state),
});

const mapDispatchToProps = dispatch => ({
  createStructure: conditions => dispatch({ type: SAGA_ADD_STRUCTURE, conditions }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(CreatePage));
