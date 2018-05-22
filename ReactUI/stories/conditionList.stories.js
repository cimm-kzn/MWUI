import React from 'react';
import { storiesOf } from '@storybook/react';
import { Form, Row, Col, Button } from 'antd';
import { ConditionList, SliderEditor } from '../src/components';
import { models, selectModel, solvents, catalysts } from './variables';
import { merge } from '../src/base/functions';
import { action } from '@storybook/addon-actions';
import 'antd/dist/antd.min.css';

storiesOf('ConditionList', module).add('ConditionList', () => {
  const ConditionLists = Form.create()(({ form }) => (
    <Row>
      <Col span={6} offset={9}>
        <Form>
          <ConditionList
            id="1"
            models={models}
            selectModel={selectModel}
            solvents={solvents}
            catalysts={catalysts}
            formComponent={Form}
            form={form}
          />
        </Form>
      </Col>
    </Row>));
  return <ConditionLists />;
})
  .add('Many conditionList', () => {
    const ConditionLists = Form.create()(({ form }) => (
      <Row>
        <Col span={6} offset={9}>
          <Form>
            {[1, 2].map(i =>
              (<ConditionList
                id={i}
                models={models}
                selectModel={selectModel}
                solvents={solvents}
                catalysts={catalysts}
                formComponent={Form}
                form={form}
              />),
            )}
          </Form>
        </Col>
      </Row>));
    return <ConditionLists />;
  })
  .add('Many conditionList translation', () => {
    class ConditionListsComp extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          transId: [],
        };
        this.translationSwith = this.translationSwith.bind(this);
      }
      translationSwith(check, type, id) {
        let { transId } = this.state;
        const { form } = this.props;
        if (check) {
          transId.push(id);
          this.setState({ transId });
        } else {
          const fValue = form.getFieldsValue();

          const newValues = Object.keys(fValue)
            .filter(key => ~key.indexOf(`${type}-translation`))
            .reduce((acc, nKey) => {
              const field = nKey.split('-');
              acc[`${field[0]}-${type}-${id}`] = fValue[nKey];
              return acc;
            }, {});
          console.log({ ...newValues, fValue });

          transId = transId.filter(trId => trId !== id);
          this.setState({ transId }, () => form.setFieldsValue({ ...newValues, fValue }));
        }
      }
      render() {
        const { transId } = this.state;

        const { form } = this.props;
        return (
          <Row>
            <Col span={6} offset={9}>
              <Form>
                {[1, 2, 3].map(i =>
                  (<ConditionList
                    id={i}
                    type={2}
                    models={models}
                    selectModel={selectModel}
                    solvents={solvents}
                    catalysts={catalysts}
                    formComponent={Form}
                    form={form}
                    translationSwith={this.translationSwith}
                    translation={transId.some(trId => trId === i)}
                  />),
                )}
              </Form>
            </Col>
          </Row>);
      }
    }

    const FormConditionList = Form.create()(ConditionListsComp);

    return <FormConditionList />;
  })
  .add('Many conditionList Submit Form', () => {
    const ConditionLists = Form.create()(({ form }) => {
      const handleSubmit = (e) => {
        e.preventDefault();
        form.validateFields((err, values) => {
          if (!err) {
            console.log(values);
          }
        });
      };

      return (
        <Row>
          <Col span={6} offset={9}>
            <Form
              onSubmit={handleSubmit}
            >
              {[1, 2].map(i =>
                (<ConditionList
                  id={i}
                  models={models}
                  selectModel={selectModel}
                  solvents={solvents}
                  catalysts={catalysts}
                  formComponent={Form}
                  form={form}
                />),
              )}
              <Button htmlType="submit">Submit</Button>
            </Form>
          </Col>
        </Row>);
    });
    return <ConditionLists />;
  });
