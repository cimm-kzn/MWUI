import React from 'react';
import Loader from 'react-loader';
import PropTypes from 'prop-types';
import { Row, Col, Button, DropdownButton, MenuItem, ButtonToolbar, Glyphicon, PageHeader } from 'react-bootstrap';
import { URL, CONST } from '../../config';
import '../../css/Pages.css';


import { StructureViewPrepare, ConditionView, ModalConditionSelectedView } from '../WrappedContainers';

const ModellingPage = ({
  tasks,
  forceRequest,
  selectAll,
  deselectAll,
  deleteSelected,
  history,
  openComditionModal,
  addModelErr,
  addSolvErr,
  modellingStructures,
  revalidateStructure,
  additives,
  models,
  isLoading,
}) => {
  const validateStructure = () => {
    tasks.forEach((obj) => {
      if (!obj.models.length) {
        addModelErr(obj.id);
        return false;
      }
      modellingStructures(tasks);
    });
  };
  const addModelList = (type) => {
    if (type === CONST.StructureType.MOLECULE) {
      return models.filter(o => o.type === CONST.ModelType.MOLECULE_MODELING);
    } else if (type === CONST.StructureType.REACTION) {
      return models.filter(o => o.type === CONST.ModelType.REACTION_MODELING);
    }
    return [];
  };

  const buttonType = tasks.filter(obj => obj.checked === true).length;
  const selectedId = tasks.filter(task => task.isCheking === 1).map(o => o.id);
  const addSolventList = () => additives.filter(o => o.type === CONST.AdditiveType.SOLVENT);
  const addModelMoleculReaction = () => models.filter(o => o.type === CONST.ModelType.MOLECULE_MODELING || o.type === CONST.ModelType.REACTION_MODELING);

  return (
    <div>
      <PageHeader>Set conditions</PageHeader>
      <ButtonToolbar>
        <Button
          bsStyle="primary"
          onClick={() => {
            history.push(URL.INDEX);
          }}
        >
          <Glyphicon glyph="chevron-left" />
          Back to index
        </Button>
        <DropdownButton title="Actions" id="bg-nested-dropdown">
          <MenuItem eventKey="1" onClick={() => selectAll()}>Select all</MenuItem>
          <MenuItem eventKey="2" onClick={() => deselectAll()}>Deselect all</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="3" disabled={!selectedId.length} onClick={() => { openComditionModal(); }}>Edit conditions for selected structures</MenuItem>
          <MenuItem eventKey="4" onClick={() => deleteSelected(selectedId)}>Delete selected structures</MenuItem>
        </DropdownButton>
        {tasks.length ? buttonType ? <Button bsStyle="danger" className="pull-right" onClick={() => revalidateStructure(tasks)} >
          <Glyphicon glyph="play-circle" />
          &nbsp;Revalidate
        </Button> : <Button bsStyle="primary" className="pull-right" onClick={() => validateStructure()}>
          <Glyphicon glyph="play-circle" />
          &nbsp;Modeling
        </Button> : ''}
      </ButtonToolbar>

      <Row>
        <Loader loaded={!isLoading} />
        <ModalConditionSelectedView
          modelList={addModelMoleculReaction()}
          solventList={addSolventList()}
        />
        {tasks.map(task =>
          (<div>
            <StructureViewPrepare {...task} />
            <ConditionView
              {...task}
              modelList={addModelList(task.type)}
              solventList={addSolventList()}
            />
            <Col lg={12}>
              <hr />
            </Col>
          </div>),
        )}
      </Row>
    </div>
  );
};

export default ModellingPage;
