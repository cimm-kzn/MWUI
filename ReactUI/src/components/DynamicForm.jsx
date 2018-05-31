import React from 'react';
import { Input, Icon, Button, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { exportCml } from '../base/marvinAPI';


const DynamicForm = ({
  value,
  onChange,
}) => {
  const remove = (index) => {
    const nextValue = value.filter((val, idx) => index !== idx);

    onChange(nextValue);
  };

  const add = () => {
    if(!value) value = [];
    const nextValue = value.concat({ key: '', value: '' });

    onChange(nextValue);
  };

  const inputChangeKey = (e, index) => {
    const newValue = e.target.value;
    value[index].key = newValue;

    onChange(value);
  };

  const inputChangeValue = (e, index) => {
    const newValue = e.target.value;
    value[index].value = newValue;

    onChange(value);
  };


  const formItems = value && value.map((k, index) => (
    <Row  key={`row${index}`}>
      <Col xs={12} md={12} sm={12} key={`colkey${index}`}>
        <Input
          key={`key${index}`}
          placeholder="key"
          style={{ width: '80%', marginRight: 16 }}
          onChange={val => inputChangeKey(val, index)}
          value={k.key}
        />
          :
      </Col>
      <Col xs={12} md={12} sm={12} key={`colval${index}`}>
        <Input
          key={`value${index}`}
          placeholder="value"
          style={{ width: '80%', marginRight: 16 }}
          onChange={val => inputChangeValue(val, index)}
          value={k.value}
        />
        { index ? (
          <Icon
            key={`icon${index}`}
            className="dynamic-delete-button"
            type="minus-circle-o"
            disabled={!index}
            onClick={() => remove(index)}
          />
        ) : null}
      </Col>
    </Row>

  ));

  return (
    <div>
      {formItems}
      <Button type="dashed" onClick={add} style={{ width: '100%' }}>
        <Icon type="plus" /> Add field
      </Button>
    </div>
  );
};

export default DynamicForm;
