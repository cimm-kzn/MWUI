import React from 'react';
import { Col, Thumbnail, ButtonGroup, Glyphicon, Button, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import PropTypes from 'prop-types';

const StructureView = ({ openEditor, deleteTask, id, base64, cml, valid, isCheking, structureCheck }) => (
  <Col md={6}>
    <Thumbnail src={base64} className={isCheking ? 'check' : ''} >
      <hr />
      <ToggleButtonGroup
        type="checkbox"
        name="options"
        value={isCheking}
        onChange={value => structureCheck(id, value[1])}
      >
        <ToggleButton value={1}>
          <Glyphicon glyph={isCheking ? 'check' : 'unchecked'} />
        </ToggleButton>
      </ToggleButtonGroup>
      <ButtonGroup className="pull-right" >
        <Button
          bsStyle="primary"
          onClick={() => openEditor(id, cml)}
        >
          <Glyphicon glyph="pencil" />
          Edit
        </Button>
        &nbsp;
        <Button
          bsStyle="danger"
          onClick={() => deleteTask(id)}
        >
          <Glyphicon glyph="trash" />
        </Button>
      </ButtonGroup>
    </Thumbnail>
  </Col>
);

StructureView.propTypes = {
  id: PropTypes.number,
  base64: PropTypes.string,
  valid: PropTypes.bool,
  openEditor: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
  isCheking: PropTypes.number,
  structureCheck: PropTypes.func.isRequired,
};

StructureView.defaultProps = {
  id: 0,
  base64: '',
  valid: false,
  isCheking: 0,
};

export default StructureView;
