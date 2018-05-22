import React from 'react';
import { Row, Steps } from 'antd';
import { URLS } from '../config';
import { getUrlPath } from '../base/parseUrl';

const Step = Steps.Step;

const PageSteps = () => {
  let currentPage = 0;
  const urlPath = getUrlPath();
  Object.keys(URLS).forEach(
    (key, value) => {
      if (urlPath === URLS[key]) currentPage = value;
    },
  );

  return (
    <Row style={{ paddingBottom: 100, paddingTop: 15 }}>
      <Steps current={currentPage}>
        <Step title="Start" description="Choosing a structure for searching" />
        <Step title="Validate" description="The choice of model and the correctness of the structure" />
        <Step title="Result" description="Search results" />
      </Steps>
    </Row>
  );
};

export default PageSteps;
