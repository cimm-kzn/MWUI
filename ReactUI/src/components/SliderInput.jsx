import React, { Component } from 'react';
import { Slider, InputNumber, Row, Col } from 'antd';

class SliderEditor extends Component {
  render() {
    return (

      <Row>
        <Col span={18}>
          <Slider { ...this.props } />
        </Col>
        <Col
          span={6}
          style={{ textAlign: 'right' }}
        >
          <InputNumber
            { ...this.props }
            style={{ width: '60px' }}
          />
        </Col>
      </Row>
    )
    ;
  }
}
export default SliderEditor;
