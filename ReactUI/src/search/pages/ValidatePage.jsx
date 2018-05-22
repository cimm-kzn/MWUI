import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Select, Button, Row, Col, Form } from 'antd';
import { Thumbnail } from '../../components';
import { modal, addSelectModel } from '../core/actions';
import { URLS } from '../../config';
import {
  SAGA_INIT_VALIDATE_PAGE,
  SAGA_EDIT_STRUCTURE_1,
  SAGA_REVALIDATE_TASK,
  SAGA_CREATE_RESULT_TASK,
} from '../core/constants';
import { getStructures, isLoading } from '../core/selectors';

const Option = Select.Option;
const FormItem = Form.Item;

class ValidatePage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.revalidate = this.revalidate.bind(this);
  }

  componentDidMount() {
    this.props.initPage();
  }

  handleSubmit(e) {
    e.preventDefault();

    const { form, structure, onContinue } = this.props;
    const selectModel = form.getFieldsValue();

    onContinue(structure, selectModel);
  }

  revalidate() {
    const { structure, onRevalidate } = this.props;
    const { data } = structure;

    onRevalidate(data);
  }

  render() {
    const { structure, openEditModal, form, history, onRevalidate, onContinue, loading } = this.props;

    const { getFieldDecorator } = form;

    return !loading && structure && (
      <Form onSubmit={this.handleSubmit} >
        <Row gutter={24} sm={24} xs={24}>
          <Col lg={14}>
            <Thumbnail
              data={structure.data}
              base64={structure.base64}
              revalidate={structure.revalidate}
              onClickImage={openEditModal}
            />
          </Col>
          <Col lg={10} sm={24} xs={24}>
            <FormItem
              label="Selected model:"
            >
              {getFieldDecorator('model', {
                initialValue: structure && structure.models[0].model,
              })(
                <Select
                  style={{ width: '100%', paddingBottom: 10 }}
                >
                  { structure.models.map(m => <Option key={m.model} value={m.model}>{m.name}</Option>)}
                </Select>,
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <hr />
        </Row>
        <Row>

          <Col span={8}>
            <Button
              onClick={() => history.push(URLS.INDEX)}
              icon="left"
            >Back</Button>
          </Col>
          <Col span={8} offset={8} style={{ textAlign: 'right' }}>
            { structure.revalidate ?
              <Button
                icon="sync"
                type="danger"
                onClick={() => onRevalidate(structure.data)}
              >
                  Revalidate
              </Button> :
              <Button
                type="primary"
                icon="right"
                htmlType="submit"
              >
                  Сontinue
              </Button>}
          </Col>
        </Row>
      </Form>
    );
  }
}

ValidatePage.propTypes = {
  initPage: PropTypes.func.isRequired,
  openEditModal: PropTypes.func.isRequired,
  changeSelectedModel: PropTypes.func.isRequired,
  onRevalidate: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};


const mapStateToProps = state => ({
  structure: getStructures(state),
  loading: isLoading(state),
});

const mapDispatchToProps = dispatch => ({
  initPage: () => dispatch({ type: SAGA_INIT_VALIDATE_PAGE }),
  openEditModal: data => dispatch({ type: SAGA_EDIT_STRUCTURE_1, data }),
  onRevalidate: data => dispatch({ type: SAGA_REVALIDATE_TASK, data }),
  onContinue: (structure, selectModel) => dispatch({ type: SAGA_CREATE_RESULT_TASK, structure, selectModel }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(ValidatePage));
