import React from 'react';
import { Col, Glyphicon, ListGroup, ListGroupItem, OverlayTrigger, Popover } from 'react-bootstrap';
import Select from 'react-select';
import Slider from 'rc-slider';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as temp from './conditionTemp';

import 'rc-slider/assets/index.css';
import 'react-select/dist/react-select.css';

const ErrorText = styled.span`
  display: block;
  color: red;
`;

const WrapperConditions = styled(ListGroupItem)`
height: 85px;
& .rc-slider-mark{
    z-index: 0;
}
`;

const ConditionsView = ({
  id,
  type,
  models,
  temperature,
  pressure,
  additives,
  addSolv,
  modelErr,
  modelList,
  solventList,
  addModel,
  addAmount,
  addTemp,
  addPress,
  solventErr,
  total,
  col,
}) => {
  const addLabel = obj => (
    solventList.filter(o => o.value === obj)[0].label
  );

  const solventChange = (value) => {
    let solv,
      total = 100;

    value = value.split(',').map(o => Number(o));
    if (value[0]) {
      switch (value.length) {
        case 1:
          solv = value.map(obj => ({ additive: obj, amount: 100, label: addLabel(obj) }));
          break;
        case 2:
          solv = value.map(obj => ({ additive: obj, amount: 50, label: addLabel(obj) }));
          break;
        case 3:
          solv = value.map(obj => ({ additive: obj, amount: 33, label: addLabel(obj) }));
          break;
        default:
          return false;
      }
    } else {
      solv = [];
      total = 0;
    }
    addSolv(id, solv, total);
  };

  const addModelType = model => modelList.filter(o => o.value === model)[0].type;

  const modelChange = (value) => {
    if(value != '') {
      addModel(id, value.split(',').map(obj => ({model: Number(obj), type: addModelType(Number(obj))})));
    }
    else {
      addModel(id, []);
    }
  };

  const solventItemChange = (additive, value) => {
    const amounts = additives.map(o => (o.additive !== additive ? o.amount : value));
    const sum = amounts.reduce((a, b) => a + b, 0);
    if (sum <= 100) addAmount(id, additive, value, sum);
  };


  let solvents;

  if (additives.length) {
    solvents = (<div>
      <h4>Selected solvents:</h4>
      {additives.map(obj =>
        (<span>
          <span>{obj.label}: {obj.amount}%</span>
          <Slider
            value={obj.amount}
            {...temp.solvSlider}
            onChange={value => solventItemChange(obj.additive, value)}
          />
        </span>),
      )}
      <span>Total: {total}%</span>
      <ErrorText>{solventErr ? 'Please increase the proportion of solvent to 100%' : ''}</ErrorText>
    </div>);
  }

  const popoverBottom = (
    <Popover id="popover-positioned-bottom" title="Description models">
      {modelList.map(o =>
        (o.description !== '' ? <div>
          <strong>{o.label}:</strong> {o.description}
        </div> : ''),
      )}
    </Popover>
  );

  return (
    <Col md={col}>
      <ListGroup>
        <ListGroupItem>
          <h4>Models&nbsp;
            <OverlayTrigger trigger="hover" placement="bottom" overlay={popoverBottom}>
              <Glyphicon glyph="info-sign" />
            </OverlayTrigger>&nbsp;&nbsp;
          </h4>
          <Select
            {...temp.modelSelect}
            value={models.map(obj => obj.model)}
            options={modelList}
            onChange={e => modelChange(e)}
          />
          <ErrorText>{ modelErr ? 'Please select model(s)' : ''}</ErrorText>
        </ListGroupItem>
        <WrapperConditions className="list-gr-item">
          <h4>Temperature:&nbsp;
            <span
              className="pointer"
            >
              {temperature}&nbsp;
              <Glyphicon glyph="pencil" />
            </span>
            &nbsp;(K)
          </h4>
          <Slider
            {...temp.tempSlider}
            value={temperature}
            onChange={temp => addTemp(id, temp)}
          />
        </WrapperConditions>
        <WrapperConditions className="list-gr-item">
          <h4>Pressure: {pressure} (atm)</h4>
          <Slider
            {...temp.pressSlider}
            value={pressure}
            onChange={press => addPress(id, press)}
          />
        </WrapperConditions>
        <ListGroupItem
          header="Solvents"
        >
          <Select
            {...temp.solvSelect}
            value={additives ? additives.map(o => o.additive) : ''}
            options={solventList}
            onChange={solv => solventChange(solv)}
          />
        </ListGroupItem>
        <ListGroupItem>
          {solvents}
        </ListGroupItem>
      </ListGroup>
    </Col>
  );
};

ConditionsView.propTypes = {
  id: PropTypes.number,
  type: PropTypes.number,
  models: PropTypes.array,
  temperature: PropTypes.number,
  pressure: PropTypes.number,
  additives: PropTypes.array,
  addSolv: PropTypes.func,
  modelErr: PropTypes.bool,
  modelList: PropTypes.array,
  solventList: PropTypes.array,
  addModel: PropTypes.func,
  addAmount: PropTypes.func,
  addTemp: PropTypes.func,
  addPress: PropTypes.func,
  solventErr: PropTypes.bool,
  total: PropTypes.number,
  col: PropTypes.number,
  constantsModels: PropTypes.number,
  constantsSolvents: PropTypes.number,
};

ConditionsView.defaultProps = {
  id: 0,
  models: [],
  temperature: 298,
  pressure: 1,
  additives: [],
  modelErr: false,
  modelList: [],
  solventList: [],
  solventErr: false,
  total: 0,
  col: 5,
};


export default ConditionsView;

