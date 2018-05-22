import React from 'react';
import Form from 'antd/lib/form';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import axios from 'axios';
import { MainLayout } from '../components';
import { API_URLS } from '../config';
import 'antd/dist/antd.css';
import "moment/locale/ru"


const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios.post(API_URLS.USER_AUTH, { user: values.email, password: values.password }, { withCredentials: true })
          .then(() => {
            message.success('Ok! You log in');
          })
          .catch((error) => {
            message.error(error.message);
          });
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <MainLayout>
        <Row>
          <Col span={6} offset={9}>
            <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
              <FormItem>
                {getFieldDecorator('email', {
                  rules: [{ required: true, message: 'Please input your email!' }],
                })(
                  <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: 'Please input your Password!' }],
                })(
                  <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />,
                )}
              </FormItem>
              <Button type="primary" htmlType="submit" className="login-form-button">
            Log in
              </Button>
            </Form>
          </Col>
        </Row>
      </MainLayout>
    );
  }
}

export default Form.create()(NormalLoginForm);
