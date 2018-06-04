import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button as BaseButton, Row, Col, Tabs } from 'antd';

const TabPane = Tabs.TabPane;

const Rigth = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const Button = styled(BaseButton)`
  border-color: #108ee9;
  margin: 5px;
`;

const Image = styled.img`
  cursor: pointer;
  width: 100%;
`;

const ResultItem = ({ count, base64, result, onClickIcrease, onSearchImage }) => (
  <Row
    key={count.toString()}
    style={{
      paddingBottom: '20px',
    }}
  >
    <Col
      span={10}
      style={{
        border: '1px dashed #1890ff',
        padding: '20px',
      }}
    >
      <Rigth>
        <Button
          type="primary"
          ghost
          shape="circle"
          icon="double-right"
          size="large"
          onClick={() => onSearchImage()}
        />
      </Rigth>
      <Image src={base64} onClick={() => onClickIcrease()} alt="Result Image" />
    </Col>
    <Col
      span={12}
      style={{
        paddingLeft: '10px',
      }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Info" key="1">
          { result && result.map((res, i) => <p key={i}>{res.key}: {res.value}</p>) }
        </TabPane>
      </Tabs>
    </Col>
  </Row>
);

ResultItem.propTypes = {
  count: PropTypes.number,
  base64: PropTypes.string,
  result: PropTypes.array,
  onClickIcrease: PropTypes.func.isRequired,
  onSearchImage: PropTypes.func.isRequired,
};

ResultItem.defaultProps = {
  count: 1,
  base64: '',
  result: null,
};

export default ResultItem;
