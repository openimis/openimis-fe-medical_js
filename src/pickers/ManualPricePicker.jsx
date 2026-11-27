import React, { Component } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { formatMessage, injectIntl } from "@openimis/fe-core";
import { MANUAL_PRICE } from "../constants";

class ManualPricePicker extends Component {
  state = { 
    manualPrice: this._manualPriceToState(),
    readOnlyPrice: this.props.value
  };
  

  _manualPriceToState() {
    let { value } = this.props;
    let result = {};
    MANUAL_PRICE.forEach((cat) => {
      result[cat] = !!(value & cat);
    });
    return result;
  }

  _onChangeManualPrice = (cat) => {
    this.props.onChange(!this.state.readOnlyPrice);
    this.setState((prevState) => {
      return {
        ...prevState,
        readOnlyPrice: !this.state.readOnlyPrice,
      };
    });

  };

  render() {
    const { intl } = this.props;
    return (
          <FormControlLabel
            key={"lblManualPriceCheck"}
            control={
              <Checkbox
                  color="primary"
                  key={"lblManualPriceCheck"}
                  name={`isManualPrice`}
                  checked={this.props.value}
                  onChange={(p) => {
                    this._onChangeManualPrice(p);
                  }
                  }
              />
            }
            label={formatMessage(intl, "medical", "manualPrice")}
          />
    );
  }
}

export { ManualPricePicker };
export default injectIntl(ManualPricePicker);
