import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button, Icon, Pagination, Select } from 'antd';
import { showModal } from '../core/actions';
import { getSettings, getUsers, getDatabase, getStructures } from '../core/selectors';
import { SAGA_DELETE_STRUCTURE, SAGA_GET_RECORDS, SAGA_INIT_STRUCTURE_LIST_PAGE } from '../core/constants';
import { DatabaseTableSelect, DatabaseSelect, UsersSelect } from '../hoc';
import TableListDisplay from './TableListDisplay';
import BlockListDisplay from './BlockListDisplay';

const FormItem = Form.Item;
const Option = Select.Option;

class StructureListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
    };

    this.toggle = this.toggle.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.onShowSizeChange = this.onShowSizeChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { settings: { full }, structures, form, getStructure } = this.props;

    if (full && !structures.every(s => s.data)) {
      form.validateFields((err, values) => {
        const { database, table, user } = values;
        getStructure({ database, table, user, full, page: 1 });
      });
    }
  }

  componentDidMount() {
    const { settings: { full } } = this.props;
    this.props.initPage(full);
  }


  onShowSizeChange(current, pageSize) {
    this.setState({ current, pageSize });
  }

  changePage(pageNumber) {
    this.setState({ current: pageNumber });
  }

  changeInput(sorted) {
    this.setState({ sorted });
  }

  handleSearch(e) {
    e.preventDefault();
    const { form, getStructure, settings: { full } } = this.props;
    form.validateFields((err, values) => {
      const { database, table, user } = values;
      getStructure({ database, table, user, full, page: 1 });
    });
  }

  handleReset() {
    this.props.form.resetFields();
  }

  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const { structures, editStructure, deleteStructure, settings, form, users, database } = this.props;
    const { expand } = this.state;
    const gridSettings = settings && settings.grid;

    const lists = {
      gridSettings,
      structures,
      editStructure,
      deleteStructure,
    };

    return structures && settings && (
      <div>
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.handleSearch}
        >
          <Row gutter={24}>
            <Col span={8} style={{ display: expand ? 'block' : 'none' }}>
              <DatabaseSelect
                formComponent={Form}
                form={form}
              />
            </Col>
            <Col span={8} style={{ display: expand ? 'block' : 'none' }}>
              <DatabaseTableSelect
                formComponent={Form}
                form={form}
              />
            </Col>
            <Col span={8} style={{ display: expand ? 'block' : 'none' }}>
              <UsersSelect
                formComponent={Form}
                form={form}
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
            <Pagination
              showSizeChanger
              onChange={this.changePage}
              onShowSizeChange={this.onShowSizeChange}
              // defaultCurrent={}
              total={structures.length}
            />
          </Col>
        </Row>
        { settings.full ?
          <BlockListDisplay
            structures={structures}
          />
          :
          <TableListDisplay
            structures={structures}
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
  getStructure: PropTypes.func.isRequired,
};


const mapStateToProps = state => ({
  settings: getSettings(state),
  users: getUsers(state),
  database: getDatabase(state),
  structures: getStructures(state),
});

const mapDispatchToProps = dispatch => ({
  getStructure: obj => dispatch({ type: SAGA_GET_RECORDS, ...obj }),
  editStructure: id => dispatch(showModal(true, id)),
  deleteStructure: id => dispatch({ type: SAGA_DELETE_STRUCTURE, id }),
  initPage: full => dispatch({ type: SAGA_INIT_STRUCTURE_LIST_PAGE, full }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(StructureListPage));
