import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Upload, Icon, List, Card, Popconfirm, Row, Col } from 'antd';
import { deleteStructureIndex } from '../core/actions';
import { getIndexPageStructure } from '../core/selectors';
import {
  SAGA_CREATE_TASK_INDEX,
  SAGA_NEW_STRUCTURE,
  SAGA_EDIT_STRUCTURE_INDEX,
} from '../core/constants';


const uploadProps = {
  name: 'file',
  action: '//jsonplaceholder.typicode.com/posts/',
  headers: {
    authorization: 'authorization-text',
  },
};

const IndexPage = ({
  structures,
  editStructure,
  deleteStructure,
  createNewStructure,
  createTask,
}) => (
  <div>
    <Row gutter={24} style={{ marginBottom: '20px' }}>
      <Col span={8}>
        <Upload {...uploadProps}>
          <Button
            icon="upload"
          >
                Upload file
          </Button>
        </Upload>
      </Col>
      <Col offset={8} style={{ textAlign: 'right' }}>
        <Button
          type="dashed"
          onClick={createNewStructure}
          icon="plus"
          style={{ marginRight: '8px' }}
        >
          Add structure
        </Button>
        <Button
          type="primary"
          onClick={() => createTask(structures)}
          icon="right"
          disabled={!structures.length}
        >
          Validate
        </Button>
      </Col>
    </Row>
    <div>
      <List
        grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
        dataSource={structures}
        renderItem={item => (
          <List.Item>
            <Card
              cover={<img alt="example" src={item.base64} />}
              actions={
                [<Icon type="edit" onClick={() => editStructure(item.data, item.structure)} />,
                  <Popconfirm
                    placement="topLeft"
                    title="Are you sure delete this structure?"
                    onConfirm={() => deleteStructure(item.structure)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Icon type="delete" />
                  </Popconfirm>]}
            />
          </List.Item>
        )}
      />
    </div>
  </div>
);

IndexPage.propTypes = {
  structures: PropTypes.arrayOf(PropTypes.object),
  editStructure: PropTypes.func.isRequired,
  deleteStructure: PropTypes.func.isRequired,
  createNewStructure: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
};

IndexPage.defaultProps = {
  structures: [],
};

const mapStateToProps = state => ({
  structures: getIndexPageStructure(state),
});

const mapDispatchToProps = dispatch => ({
  createNewStructure: () => dispatch({ type: SAGA_NEW_STRUCTURE }),
  deleteStructure: structure => dispatch(deleteStructureIndex(structure)),
  editStructure: (data, structure) =>
    dispatch({ type: SAGA_EDIT_STRUCTURE_INDEX, data, structure }),
  createTask: structures => dispatch({ type: SAGA_CREATE_TASK_INDEX, structures }),
});

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
