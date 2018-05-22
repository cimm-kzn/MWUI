import React from 'react';
import { storiesOf } from '@storybook/react';
import { Form, Row, Col, Button } from 'antd';
import { SliderEditor } from '../src/components';
import { action } from '@storybook/addon-actions';
import 'antd/dist/antd.min.css';


storiesOf('Edit sliders', module)
  .add('default', () => (
    <Row>
      <Col span={6} offset={9}>
        <SliderEditor />
      </Col>
    </Row>
  ))
  .add('form use', () => {
    const SliderForm = Form.create()(({ form }) => {
      const handleSubmit = (e) => {
        e.preventDefault();
        form.validateFields((err, values) => {
          if (!err) {
            console.log(values);
          }
        });
      };

      const FormItem = Form.Item;
      const { getFieldDecorator } = form;

      return (<Row>
        <Col span={6} offset={9}>
          <Form onSubmit={handleSubmit}>
            <FormItem
              label="Model"
            >
              {getFieldDecorator('model', {
                initialValue: 10,
              })(
                <SliderEditor
                  min={8}
                  max={12}
                />,
              )}
            </FormItem>
            <Button htmlType="submit" >Submit</Button>
          </Form>
        </Col>
      </Row>);
    });

    return <SliderForm />;
  });
