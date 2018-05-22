import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button as BaseButton, Tooltip } from 'antd';
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

const HistoryPage = ({ histories, showResults, showValidate }) => (<div>
  <H2>History result page</H2>
  <div className="row">
    { histories && histories.map(hist =>
      (<div className="col-md-6">
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
          <div><b>Selected model:</b> { hist.models.filter(m => m.model === hist.selectModel.model)[0].name }</div>
        </div>
      </div>))}
  </div>
</div>);

const mapStateToProps = state => ({
  histories: state.histories,
});

const mapDispatchToProps = dispatch => ({
  showValidate: validateTaskId => history.push(stringifyUrl(URLS.VALIDATE, { task: validateTaskId })),
  showResults: resultTaskId => history.push(stringifyUrl(URLS.RESULT, { task: resultTaskId })),
});

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPage);
