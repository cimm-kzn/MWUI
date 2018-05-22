import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BackTop, Row, Col, Tabs, Button } from 'antd';
import { ModalIncrease } from '../../components';
import { URLS } from '../../config';
import {
  SAGA_INIT_RESULT_PAGE,
} from '../core/constants';
import { getResultPageStructure } from '../core/selectors';

const Conditions = styled.div`
  border: 1px dashed #1890ff;
  padding: 10px;
  margin-bottom: 20px;
`;

const ResultImg = styled.img`
  width: 100%;
`;


const TabPane = Tabs.TabPane;

class ResultPage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.initPage();
  }

  render() {
    const { results, history } = this.props;

    return results && (
      <div>
        <Row style={{ paddingBottom: 38 }}>
          <Col span={8}>
            <Button
              icon="left"
              onClick={() => history.push(URLS.INDEX)}
            >
              Back
            </Button>
          </Col>
          <Col span={8} offset={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon="save"
            >
                Save
            </Button>
          </Col>
        </Row>

        {results && results.map((result, key) =>
          (<Row>

            <Col span={10} >
              <span>{key + 1}</span>
              <ResultImg
                src={result.base64}
              />
            </Col>
            <Col span={14}>
              <Conditions>
                <p>Temperature(K): {result.temperature}</p>
                <p>Pressure(atm): {result.pressure}</p>
                <p>Additives:</p>
              </Conditions>
              <Tabs defaultActiveKey={0}>
                { result.models && result.models.map((model, idx) =>
                  (<TabPane tab={model.name} key={idx}>
                    { model.results.map((res, i) =>
                      <p>{res.key}: {res.value}</p>,
                    )}
                  </TabPane>),
                )}
              </Tabs>
            </Col>
          </Row>),
        )}

        <BackTop />
      </div>
    );
  }
}

ResultPage.propTypes = {

};

ResultPage.defaultProps = {

};

const mapStateToProps = state => ({
  results: getResultPageStructure(state),
});

const mapDispatchToProps = dispatch => ({
  initPage: () => dispatch({ type: SAGA_INIT_RESULT_PAGE }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ResultPage);
