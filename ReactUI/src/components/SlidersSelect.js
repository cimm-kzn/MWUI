import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import SliderInput from './SliderInput';

const Option = Select.Option;

class SlidersSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: [] };
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
  }

  componentDidMount() {
    const { defaultValue, value } = this.props;
    this.setState({ selected: defaultValue || value });
  }

  handleBlur(val) {
    const { data } = this.props;
    this.setState({ selected: [] });
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
      this.setState({ selected });
      this.triggeredChange(selected);
    }
  }

  handleSlide(amount, item) {
    const { selected } = this.state;
    const { sumEqual } = this.props;

    const sum = selected.reduce((last, it) => last + it.amount, 0);
    if (!sumEqual || sum <= sumEqual) {
      const select = selected.map((sel) => {
        if (sel.additive === item.additive) {
          return { ...item, amount };
        }
        return sel;
      });

      this.setState({ selected: select });
      this.triggeredChange(select);
    }
  }

  triggeredChange(data) {
    this.props.onChange(data);
  }

  render() {
    const { data, defaultValue } = this.props;
    const { selected } = this.state;

    return (
      <div>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Please select"
          onBlur={this.handleBlur}
          defaultValue={defaultValue && defaultValue.map(value => value.additive)}
        >
          {data.map((item, i) =>
            (<Option
              key={item.additive + i}
              value={item.additive}
            >
              {item.name}
            </Option>),
          )}
        </Select>
        { selected.map((item, i) => (
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

SlidersSelect.defaultProps = {
  data: [],
  defaultValue: [],
  sumEqual: null,
};


export default SlidersSelect;
