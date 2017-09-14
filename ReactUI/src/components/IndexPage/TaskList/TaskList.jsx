import React from 'react';
import { Col } from 'react-bootstrap';
import { StructureView } from '../../WrappedContainers';
import '../../../css/Pages.css';

const TaskList = ({
  tasks,
  deleteTask,
  openEditor,
  structureCheck,
  errors,
}) => (
  <div>
    {tasks.length ?
      <div>
        {tasks.map(task =>
          (<StructureView {...task} />),
        )}
      </div>
      :
      <Col lg={12}>
        <h4>Start modelling</h4>
        <p>This application is for modeling the behavior of chemical structures and reactions under
        different conditions. Click on the image and add a structure of a substance or a reaction.
        After drawing the structure click on the `Validate` button.</p>
        <p>On the next page choose the conditions: model of reactions,
        temperature, pressure and etc, press the `Modelling` button</p>
      </Col>
    }
  </div>
);


export default TaskList;
