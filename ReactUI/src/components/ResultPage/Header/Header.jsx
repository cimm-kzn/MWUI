import React, { Component } from 'react';
import { Button, DropdownButton, MenuItem, ButtonToolbar, Glyphicon, PageHeader, Panel } from 'react-bootstrap';
import { URL } from '../../../config';
import '../../../css/Pages.css';

const Header = ({ tasks, saveTask, history }) => (
  <div>
    <PageHeader>Results</PageHeader>
    <ButtonToolbar>
      <Button
        bsStyle="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        <Glyphicon glyph="chevron-left" />
            Back
      </Button>

      <Button bsStyle="primary" className="pull-right">
        <Glyphicon glyph="floppy-disk" />
          &nbsp;Save
      </Button>
    </ButtonToolbar>
  </div>
);

export default Header;
