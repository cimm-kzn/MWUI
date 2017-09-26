import React from 'react';
import { Col, Thumbnail, ButtonGroup, Glyphicon, Button, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Checkbox = styled.input`
width: 20px;
height: 20px;
`;

const WrapperCheckBox = styled.div`
    float: left;
    margin-left: 25px;
    display: inline-block;
`;

const ButtonsRight = styled(Col)`
float: right;
padding-right: 10px;
`;


const StructureView = ({ openEditor, deleteTask, id, base64, cml, valid, isCheking, structureCheck }) => (
  <Col md={6}>
    <Thumbnail src={base64} className={isCheking ? 'check' : ''} >
      <hr />
      <Row>
        <WrapperCheckBox>
          <Checkbox className="checkbox" type="checkbox" checked={isCheking} onChange={() => structureCheck(id)} />
        </WrapperCheckBox>
        <ButtonsRight span={6}>
          <ButtonGroup >
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
        </ButtonsRight>
      </Row>
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
  isCheking: false,
};

export default StructureView;
