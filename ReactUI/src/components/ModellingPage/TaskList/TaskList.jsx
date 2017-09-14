import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Loader from 'react-loader';
import { StructureViewPrepare, ConditionView, ModalConditionSelectedView } from '../../WrappedContainers';
import { CONST } from '../../../config';

const TaskList = ({ tasks, additives, models, isLoading }) => {
  const addModelList = (type) => {
    if (type === CONST.StructureType.MOLECULE) {
      return models.filter(o => o.type === CONST.ModelType.MOLECULE_MODELING);
    } else if (type === CONST.StructureType.REACTION) {
      return models.filter(o => o.type === CONST.ModelType.REACTION_MODELING);
    }
    return [];
  };

  const addSolventList = () => additives.filter(o => o.type === CONST.AdditiveType.SOLVENT);

  const addModelMoleculReaction = () => models.filter(o => o.type === CONST.ModelType.MOLECULE_MODELING || o.type === CONST.ModelType.REACTION_MODELING);

  return (
    <Row>
      <Loader loaded={!isLoading} />
      <ModalConditionSelectedView
        modelList={addModelMoleculReaction()}
        solventList={addSolventList()}
      />
      {!isLoading ? tasks.map(task =>
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
      ) : ''}
    </Row>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.array,
  additives: PropTypes.array,
  models: PropTypes.array,
  isLoading: PropTypes.bool,
};

TaskList.defaultProps = {
  tasks: [],
  additives: [],
  models: [],
  isLoading: true,
};

export default TaskList;
