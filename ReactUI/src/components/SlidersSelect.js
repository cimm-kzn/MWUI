import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import SliderInput from './SliderInput';

const Option = Select.Option;

class SlidersSelect extends Component {
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
  }

  handleBlur(val) {
    const { data } = this.props;
    if (val.length) {
      const persent = +(100 / val.length).toFixed(1);
      const lastPersent = +(persent + (100 - (val.length * persent))).toFixed(1);
      const selected = val.map((dt, id) => {

        const filterData = data.filter(n => n.additive === dt)[0];

        if (id < data.length - 1) {
          return { amount: persent, ...filterData };
        }
        return { amount: lastPersent, ...filterData };
      });

      this.triggeredChange(selected);
    } else{
      this.triggeredChange(val);
    }
  }

  handleSlide(amount, item) {
    const { sumEqual, value } = this.props;
    let newAmound;
    const sum = value.reduce((last, it) => {
      if (it.additive === item.additive) {
        return last + amount / 100;
      }
      return last + it.amount;
    }, 0);



    if (!sumEqual || sum <= Math.ceil(sumEqual / 100)) {
      newAmound = amount;
    } else if (sum > Math.ceil(sumEqual / 100)) {
      newAmound = amount - (sum * 100 - sumEqual );
    }

    const select = value.map((sel) => {
      if (sel.additive === item.additive) {
        return { ...item, amount: newAmound };
      }
      return { ...sel, amount: Math.ceil(sel.amount * 100) };
    });

    this.triggeredChange(select);
  }

  triggeredChange(data) {
    const convertData = data.map(dt => ({ ...dt, amount: Math.ceil(dt.amount) / 100 }));
    this.props.onChange(convertData);
  }

  render() {
    const { data, value } = this.props;


    return (
      <div>
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Please select"
          onChange={this.handleBlur}
          value={value.map(val => val.additive)}
        >
          {data && data.map((item, i) =>
            (<Option
              key={item.additive + i}
              value={item.additive}
            >
              {item.name}
            </Option>),
          )}
        </Select>
        { value.map(dt => ({ ...dt, amount: Math.ceil(dt.amount * 100) })).map((item, i) => (
          <div>{ item.name }
            <SliderInput
              key={item.name + i}
              value={item.amount}
              onChange={e => this.handleSlide(e, item)}
            />
          </div>
        ))}
      </div>
    );
  }
}

SlidersSelect.propTypes = {
  data: PropTypes.array,
  defaultValue: PropTypes.array,
  sumEqual: PropTypes.number,
};


export default SlidersSelect;
