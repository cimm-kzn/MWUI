import React from 'react';
import { storiesOf } from '@storybook/react';
import { Form, Row, Col, Button } from 'antd';
import { SlidersSelect } from '../src/components';
import { models, selectModel, solvents, catalysts } from './variables';
import { action } from '@storybook/addon-actions';
import 'antd/dist/antd.min.css';


storiesOf('SlidersSelect', module)
  .add('default', () => (
    <Row>
      <Col span={6} offset={9}>
        <SlidersSelect />
      </Col>
    </Row>
  ))
  .add('add catalyst', () => (
    <Row>
      <Col span={6} offset={9}>
        <SlidersSelect data={catalysts} />
      </Col>
    </Row>
  ))
  .add('set default value', () => (
    <Row>
      <Col span={6} offset={9}>
        <SlidersSelect
          defaultValue={[
            { value: 25, additive: 6, name: 'Alyminium oxide' },
            { value: 50, additive: 5, name: 'Co3+' },
          ]}
          data={catalysts}
        />
      </Col>
    </Row>
  ))
  .add('set sumEqual', () => (
    <Row>
      <Col span={6} offset={9}>
        <SlidersSelect
          defaultValue={[
            { value: 25, additive: 6, name: 'Alyminium oxide' },
            { value: 50, additive: 5, name: 'Co3+' },
          ]}
          data={catalysts}
          sumEqual={100}
        />
      </Col>
    </Row>
  ))
  .add('use to form', () => {
    const SlidersSelectForm = Form.create()(({ form }) => {
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
              {getFieldDecorator('catalyst')(
                <SlidersSelect data={catalysts} />,
              )}
            </FormItem>
            <Button htmlType="submit">Submit</Button>
          </Form>
        </Col>
      </Row>);
    });

    return <SlidersSelectForm />;
  });
