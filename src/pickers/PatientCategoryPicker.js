import React, { Component } from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import { formatMessage } from "@openimis/fe-core";
import { PATIENT_CATEGORIES } from "../constants";
import { injectIntl } from "react-intl";

class PatientCategoryPicker extends Component {
  state = { categories: this._patientCategoriesToState() };

  _patientCategoriesToState() {
    let { value } = this.props;
    let result = {};
    PATIENT_CATEGORIES.forEach((cat) => {
      result[cat] = !!(value & cat);
    });
    return result;
  }

  _onChangeCategory = (cat) => {
    let { onChange } = this.props;
    this.setState((prevState) => {
      let newCategories = { ...prevState.categories };
      newCategories[cat] = !this.state.categories[cat];
      onChange(PATIENT_CATEGORIES.filter((c) => newCategories[c]).reduce((a, b) => a | b));
      return {
        ...prevState,
        categories: newCategories,
      };
    });
  };

  render() {
    const { intl } = this.props;
    return (
      <>
        {PATIENT_CATEGORIES.map((cat) => (
          <FormControlLabel
            key={"lblPatientCategory_" + cat}
            control={
              <Checkbox
                color="primary"
                key={"patientCategory_" + cat}
                name={`patientCategory${cat}`}
                checked={this.state.categories[cat]}
                onChange={(e) => this._onChangeCategory(cat)}
              />
            }
            label={formatMessage(intl, "medical", "patientCategory." + cat)}
          />
        ))}
      </>
    );
  }
}

export default injectIntl(PatientCategoryPicker);
