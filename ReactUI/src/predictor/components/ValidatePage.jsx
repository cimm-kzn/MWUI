import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Form, Icon, List, Card, Popconfirm, Row, Col, Checkbox, Dropdown, Menu, Modal } from 'antd';
import { URLS } from '../../config';
import {
  SAGA_CREATE_RESULT_TASK,
  SAGA_INIT_VALIDATE_PAGE,
  SAGA_EDIT_STRUCTURE_VALIDATE,
  SAGA_DELETE_STRUCRURES_VALIDATE_PAGE,
  SAGA_REVALIDATE_VALIDATE_PAGE,
} from '../core/constants';
import { ConditionList } from '../../components';
import { getStructuresValidatePage, isLoading } from '../core/selectors';
import ConditionListModal from './ConditionListModal';

class ValidatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedIds: [],
      visibleModal: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkStructure = this.checkStructure.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setStructureFields = this.setStructureFields.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.serialiseFieldsData = this.serialiseFieldsData.bind(this);
    this.revalidateData = this.revalidateData.bind(this);
  }

  componentDidMount() {
    this.props.initPage();
  }

  setStructureFields(typeStructure, fields) {
    let { checkedIds } = this.state;
    const { form } = this.props;

    checkedIds = checkedIds.filter(checkId => checkId.type === typeStructure);
    let newFields = {};
    checkedIds.forEach((check) => {
      const f = Object.keys(fields).reduce((acc, key) => {
        const newKey = `${key}-${check.type}-${check.structure}`;
        acc[newKey] = fields[key];
        return acc;
      }, {});
      newFields = { ...newFields, ...f };
    });

    form.setFieldsValue(newFields);
  }

  serialiseFieldsData(values) {
    const { structures } = this.props;

    const data = structures.map(s => ({
      structure: s.structure,
      ...Object.keys(values)
        .reduce((acc, key) => {
          const elem = key.split('-');
          if (elem[0] === 'models' && values[key]) {
            acc[elem[0]] = values[key].map(model => ({ model }));
          } else {
            acc[elem[0]] = values[key];
          }

          return acc;
        }, {}),
    }));
    return data;
  }

  handleSubmit(e) {
    e.preventDefault();
    const { form, createResult } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        const data = this.serialiseFieldsData(values);
        createResult(data);
      }
    });
  }

  revalidateData() {
    const { form, revalidatePage } = this.props;
    const values = form.getFieldsValue();
    const data = this.serialiseFieldsData(values);
    revalidatePage(data);
  }

  checkStructure(e, structure, type) {
    let { checkedIds } = this.state;
    if (e.target.checked) {
      checkedIds.push({ structure, type });
    } else {
      checkedIds = checkedIds.filter(item => item.structure !== structure);
    }
    this.setState({ checkedIds });
  }

  handleMenuClick(e) {
    const { checkedIds } = this.state;
    const { deleteStructure } = this.props;
    switch (e.key) {
      case '1':
        const deleteIds = checkedIds.map(item => item.structure);
        this.showDeleteConfirm(() => {
          deleteStructure(deleteIds);
        });
        break;
      case '2':
        this.setState({ visibleModal: true });
        break;
    }
  }

  closeModal() {
    this.setState({ visibleModal: false });
  }

  showDeleteConfirm(deleteFn) {
    Modal.confirm({
      title: 'Are you sure delete this task?',
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => deleteFn(),
    });
  }

  render() {
    const {
      resultTask,
      editStructure,
      deleteStructure,
      structures,
      checkStructure,
      history,
      form,
      loading,
    } = this.props;

    const { checkedIds, visibleModal } = this.state;

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="1">Delete</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="2">Edit conditions</Menu.Item>
      </Menu>
    );

    return !loading && (
      <div>
        <ConditionListModal
          visible={visibleModal}
          onOk={this.setStructureFields}
          onCancel={this.closeModal}
        />
        <Form
          onSubmit={this.handleSubmit}
        >
          <Row style={{ paddingBottom: 38 }}>
            <Col span={8}>
              <Button
                icon="left"
                onClick={() => history.push(URLS.INDEX)}
              >
              Back
              </Button>
            </Col>
            <Col span={8} offset={8} style={{ textAlign: 'right' }}>
              <Dropdown
                overlay={menu}
                disabled={!checkedIds.length}
              >
                <Button style={{ marginRight: '10px' }} >
                Actions <Icon type="down" />
                </Button>
              </Dropdown>
              { !structures.some(s => s.revalidate) ?
                <Button
                  type="primary"
                  htmlType="submit"
                  icon="right"
                >
              Show result(s)
                </Button> :
                <Button
                  type="danger"
                  onClick={this.revalidateData}
                  icon="reload"
                >
                Revalidate
                </Button>
              }
            </Col>
          </Row>

          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={structures}
            renderItem={item => (
              <List.Item>
                <Row gutter={20}>
                  <Col lg={12} sm={24} xs={24}>
                    <Card
                      style={{ border: item.revalidate ? '1px solid red' : 'none' }}
                      cover={<img alt="no image" src={item.base64} />}
                      actions={
                        [<Checkbox
                          onChange={e => this.checkStructure(e, item.structure, item.type)}
                        />,
                          <Icon
                          type="edit"
                          onClick={() => editStructure(item.data, item.structure)}
                        />,
                          <Popconfirm
                          placement="topLeft"
                          title="Are you sure delete this structure?"
                          onConfirm={() => deleteStructure([item.structure])}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Icon type="delete" />
                        </Popconfirm>,
                        ]}
                    />
                  </Col>
                  <Col lg={12} sm={24} xs={24}>
                    <ConditionList
                      formComponent={Form}
                      form={form}
                      id={item.structure}
                      {...item}
                    />
                  </Col>
                </Row>
                <hr />
              </List.Item>
            )}
          />

        </Form>
      </div>
    );
  }
}

ValidatePage.propTypes = {
  initPage: PropTypes.func.isRequired,
};

ValidatePage.defaultProps = {

};

const mapStateToProps = state => ({
  structures: getStructuresValidatePage(state),
  loading: isLoading(state),
});

const mapDispatchToProps = dispatch => ({
  createResult: data => dispatch({ type: SAGA_CREATE_RESULT_TASK, data }),
  revalidatePage: data => dispatch({ type: SAGA_REVALIDATE_VALIDATE_PAGE, data }),
  initPage: () => dispatch({ type: SAGA_INIT_VALIDATE_PAGE }),
  editStructure: (data, structure) => dispatch({ type: SAGA_EDIT_STRUCTURE_VALIDATE, data, structure }),
  deleteStructure: structuresId => dispatch({ type: SAGA_DELETE_STRUCRURES_VALIDATE_PAGE, structuresId }),
});

const ValidatePageForm = Form.create()(ValidatePage);

export default connect(mapStateToProps, mapDispatchToProps)(ValidatePageForm);
