import React, { Component } from 'react';
import { Button, DropdownButton, MenuItem, ButtonToolbar, Glyphicon, PageHeader, Panel } from 'react-bootstrap';
import { URL } from '../../../config';
import '../../../css/Pages.css';

const Header = ({ tasks, forceRequest ,selectAll, deselectAll, deleteSelected, history, openComditionModal, addModelErr, addSolvErr, modellingStructures, revalidateStructure }) => {
  const buttonType = tasks.filter(obj => obj.checked === true).length;
  const selectedId = tasks.filter(task => task.isCheking === 1).map(o => o.id);
  const validateStructure = () => {
    tasks.forEach((obj) => {
      let err = false;
      if (!obj.models.length) {
        err = true;
        addModelErr(obj.id);
      }

      if (err) return false;

      modellingStructures(tasks);
    });
  };

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
    </div>
  );
};

export default Header;
//
// Header.propTypes = {
//   task: PropTypes.array,
// };
//
// Header.defaultProps = {
//
// };
