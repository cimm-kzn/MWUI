import React from 'react';
import { storiesOf } from '@storybook/react';
import { DynamicForm } from '../src/components';
import { action } from '@storybook/addon-actions';
import 'antd/dist/antd.min.css';

storiesOf('DynamicForm', module)
  .add('default', () => (<DynamicForm />));
