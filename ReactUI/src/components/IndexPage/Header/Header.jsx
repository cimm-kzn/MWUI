import React from 'react';
import { PageHeader, ButtonToolbar, Button, Glyphicon, MenuItem, SplitButton } from 'react-bootstrap';
import SelectedInfoView from '../../../containers/SelectedInfoView';
import { ModalUploadFileView } from '../../WrappedContainers';
import { URL } from '../../../config';
import '../../../css/Pages.css';

const Header = ({ tasks,
  addTask,
  history,
  validateQuery,
  selectAll,
  deselectAll,
  deleteSelected,
  deleteAll,
  openFileUploadModal,
}) => (
  <div>
    <PageHeader>Creating structure(s)</PageHeader>
    <ButtonToolbar>
      <Button
        bsStyle="info"
        onClick={() => {
          history.push(URL.MANUAL);
        }}
      >
        User Manual
      </Button>
      <Button
        className="pull-right"
        bsStyle="primary"
        onClick={() => { validateQuery(tasks); }}
        disabled={!tasks.length}
      >
        <Glyphicon glyph="share-alt" />
        Validate
      </Button>


      <SplitButton
        onClick={addTask}
        title="Add task"
      >

        <MenuItem eventKey="1" onClick={() => selectAll()}>Select all</MenuItem>
        <MenuItem eventKey="2" onClick={() => deselectAll()}>Deselect all</MenuItem>
        <MenuItem divider />
        <MenuItem eventKey="4" onClick={() => deleteSelected()}>Delete selected</MenuItem>
        <MenuItem eventKey="4" onClick={() => deleteAll()}>Delete all</MenuItem> </SplitButton>

      <SelectedInfoView tasks={tasks} />
      <Button
        onClick={() => openFileUploadModal()}
      >
        <Glyphicon glyph="folder-open" />
      </Button>
    </ButtonToolbar>
    <hr />
    <ModalUploadFileView />
  </div>
);

// Header.propTypes = {
//   tasks: PropTypes,
//   addTask: PropTypes.func.isRequired,
//   history: PropTypes.array,
//   validateQuery: PropTypes.func,
// };
//
// Header.defaultProps = {
//   tasks: [],
// };

export default Header;
