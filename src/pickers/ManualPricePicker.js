import React, { Component } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { formatMessage } from "@openimis/fe-core";
import { MANUAL_PRICE } from "../constants";
import { injectIntl } from "react-intl";

class ManualPricePicker extends Component {
  state = {
    manualPrice: this._manualPriceToState(),
    readOnlyPrice: this.props.value,
  };

  _manualPriceToState() {
    const { value } = this.props;
    return MANUAL_PRICE.reduce((result, cat) => {
      result[cat] = Boolean(value & cat);
      return result;
    }, {});
  }

  _onChangeManualPrice = (p) => {
    this.setState(
      (prevState) => ({
        readOnlyPrice: !prevState.readOnlyPrice,
      }),
      () => {
        this.props.onChange(this.state.readOnlyPrice);
      },
    );
  };

  render() {
    const { intl, value } = this.props;
    return (
      <FormControlLabel
        key="lblManualPriceCheck"
        control={
          <Checkbox
            color="primary"
            key="lblManualPriceCheck"
            name="isManualPrice"
            checked={value}
            onChange={(price) => this._onChangeManualPrice(price)}
          />
        }
        label={formatMessage(intl, "medical", "manualPrice")}
      />
    );
  }
}

export default injectIntl(ManualPricePicker);
