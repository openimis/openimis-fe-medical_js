import React, { Component } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { formatMessage } from "@openimis/fe-core";
import { MANUAL_PRICE } from "../constants";
import { injectIntl } from "react-intl";

class ManualPricePicker extends Component {
  state = { 
    manualPrice: this._manualPriceToState(),
    readOnlyPrice: false
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
    console.log("OnChange Picker");
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
                  checked={this.state.isManualPrice}
                  onChange={(p) => {
                    this._onChangeManualPrice;
                  }
                  }
              />
              /*<Checkbox
                color="primary"
                key={"patientCategory_" + cat}
                name={`patientCategory${cat}`}
                checked={this.state.categories[cat]}
                onChange={(e) => this._onChangeCategory(cat)}
              />*/
            }
            label={formatMessage(intl, "medical", "manualPrice")}
          />
    );
  }
}

export default injectIntl(ManualPricePicker);
