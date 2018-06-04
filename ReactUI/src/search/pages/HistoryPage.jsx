import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button as BaseButton, Tooltip, Row, Col } from 'antd';
import history from '../../base/history';
import { URLS } from '../../config';
import { stringifyUrl } from '../../base/parseUrl';

const Rigth = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
`;

const Button = styled(BaseButton)`
  border-color: #108ee9;
  margin: 5px;
`;

const H2 = styled.h2`
    padding-bottom: 30px;
`;

const HistoryPage = ({ histories, showResults, showValidate }) => (
  <div
    style={{ padding: '50px 0', background: 'white' }}
  >
    <H2>History result page</H2>
    <Row>
      { histories && histories.map((hist, i) =>
        (<Col span={12} key={i}>
          <div className="thumbnail">
            <Rigth>
              <Tooltip placement="topLeft" title="Go to validate">
                <Button
                  type="primary"
                  ghost
                  shape="circle"
                  icon="double-left"
                  size="large"
                  onClick={() => showValidate(hist.validateTaskId)}
                />
              </Tooltip>
              <Tooltip placement="topLeft" title="Show result">
                <Button
                  type="primary"
                  ghost
                  shape="circle"
                  icon="double-right"
                  size="large"
                  onClick={() => showResults(hist.resultTaskId)}
                />
              </Tooltip>
            </Rigth>
            <img src={hist.base64} />
            <div>
              <b>Selected model:</b>
              { hist.models.filter(m => m.model === hist.selectModel.model)[0].name }
            </div>
          </div>
        </Col>))}
    </Row>
  </div>);

HistoryPage.protoType = {
  histories: PropTypes.array,
  showResults: PropTypes.func.isRequired,
  showValidate: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  histories: state.histories,
});

const mapDispatchToProps = () => ({
  showValidate: validateTaskId => history.push(stringifyUrl(URLS.VALIDATE, { task: validateTaskId })),
  showResults: resultTaskId => history.push(stringifyUrl(URLS.RESULT, { task: resultTaskId })),
});

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPage);
