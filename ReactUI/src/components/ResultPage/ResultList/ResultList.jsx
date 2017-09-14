import React from 'react';
import { Row, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Loader from 'react-loader';
import { ResultStructureView, ResultModelsView } from '../../../containers';

const ResultList = ({ tasks, isLoading, errorRequest, forceRequest }) => (
  <Row>

    {errorRequest.message ? <div>{errorRequest.message} <Button onClick={() => forceRequest()}>Refresh</Button></div> : '' }

    <Loader loaded={!isLoading} />
    {!isLoading && !errorRequest.message ? tasks.map(task =>
      (<div>
        <ResultStructureView base64={task.base64} />
        <ResultModelsView models={task.modelsResult} />
      </div>
      )) : ''}
  </Row>
);

ResultList.propTypes = {
  tasks: PropTypes.array,
  isLoading: PropTypes.bool,
};

ResultList.defaultProps = {
  tasks: [],
  isLoading: true,
  errorRequest: { message: null },
};

export default ResultList;
