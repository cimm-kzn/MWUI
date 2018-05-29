import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button, Icon } from 'antd';
import { getSettings, getStructures } from '../core/selectors';
import {
  SAGA_DELETE_STRUCTURE,
  SAGA_GET_RECORDS,
  SAGA_INIT_STRUCTURE_LIST_PAGE,
  SAGA_EDIT_STRUCTURE,
} from '../core/constants';
import { DatabaseTableSelect, DatabaseSelect, UsersSelect, PaginationComp } from '../hoc';
import TableListDisplay from './TableListDisplay';
import BlockListDisplay from './BlockListDisplay';

const FormItem = Form.Item;

class StructureListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
    };

    this.toggle = this.toggle.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.changePage = this.changePage.bind(this);
    this.deleteStructure = this.deleteStructure.bind(this);
    this.editStructure = this.editStructure.bind(this);
  }

  componentDidMount() {
    const { settings: { full }, initPage } = this.props;
    initPage(full);
  }

  componentDidUpdate() {
    const { settings: { full }, structures, form, getStructure, active } = this.props;

    if (full && !structures.every(s => s.data) && active) {
      form.validateFields((err, values) => {
        const { database, table, user } = values;
        getStructure({ database, table, user, full, page: 1 });
      });
    }
  }

  changePage(page) {
    const { form, getStructure, settings: { full } } = this.props;
    form.validateFields((err, { database, table, user }) => {
      getStructure({ database, table, user, full, page });
    });
  }

  handleSearch(e) {
    e.preventDefault();
    const { form, getStructure, settings: { full } } = this.props;
    form.validateFields((err, { database, table, user }) => {
      getStructure({ database, table, user, full, page: 1 });
    });
  }

  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  deleteStructure(metadata) {
    const { deleteStructure, form } = this.props;
    form.validateFields((err, { database, table, user }) => {
      deleteStructure({ database, table, user, metadata });
    });
  }

  editStructure(metadata, data) {
    const { editStructure, form } = this.props;
    form.validateFields((err, { database, table }) => {
      editStructure({ database, table, data, metadata });
    });
  }

  render() {
    const { structures, settings, form } = this.props;
    const { expand } = this.state;
    const gridSettings = settings && settings.grid;

    const formControls = { form, formComponent: Form };

    return structures && settings && (
      <div>
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.handleSearch}
        >
          <Row gutter={24}>
            <Col span={8} style={{ display: expand ? 'block' : 'none' }}>
              <DatabaseSelect
                {...formControls}
              />
            </Col>
            <Col span={8} style={{ display: expand ? 'block' : 'none' }}>
              <DatabaseTableSelect
                {...formControls}
              />
            </Col>
            <Col span={8} style={{ display: expand ? 'block' : 'none' }}>
              <UsersSelect
                {...formControls}
              />
            </Col>
            <Col span={24} style={{ textAlign: 'right', display: expand ? 'block' : 'none' }}>
              <FormItem>
                <Button type="primary" htmlType="submit">Search</Button>
              </FormItem>
            </Col>
          </Row>
          <Row />
        </Form>
        <Row style={{ marginBottom: '20px', fontSize: '14px' }}>
          <Col span={8}>
            <a style={{ marginLeft: 8 }} onClick={this.toggle}>
              {this.state.expand ? <span> Hide filters <Icon type="up" /></span> :
              <span> Show filters <Icon type="down" /></span>}
            </a>
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <PaginationComp
              showQuickJumper
              onChange={this.changePage}
            />
          </Col>
        </Row>

        { settings.full ?
          <BlockListDisplay
            structures={structures}
            gridSettings={gridSettings}
            deleteStructure={this.deleteStructure}
            editStructure={this.editStructure}
          />
          :
          <TableListDisplay
            structures={structures}
            deleteStructure={this.deleteStructure}
            editStructure={this.editStructure}
          />
        }
      </div>

    );
  }
}

StructureListPage.propTypes = {
  editStructure: PropTypes.func.isRequired,
  deleteStructure: PropTypes.func.isRequired,
  structures: PropTypes.array,
  settings: PropTypes.object,
  getStructure: PropTypes.func.isRequired,
  initPage: PropTypes.func.isRequired,
};


const mapStateToProps = state => ({
  settings: getSettings(state),
  structures: getStructures(state),
});

const mapDispatchToProps = dispatch => ({
  getStructure: obj => dispatch({ type: SAGA_GET_RECORDS, ...obj }),
  editStructure: obj => dispatch({ type: SAGA_EDIT_STRUCTURE, ...obj }),
  deleteStructure: obj => dispatch({ type: SAGA_DELETE_STRUCTURE, ...obj }),
  initPage: full => dispatch({ type: SAGA_INIT_STRUCTURE_LIST_PAGE, full }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(StructureListPage));
