import React, { Component } from "react";
import { injectIntl } from "react-intl";

import { Checkbox, FormControlLabel, Typography } from "@material-ui/core";

import { formatMessage } from "@openimis/fe-core";
import { PATIENT_CATEGORIES, GENDER_CATEGORIES, AGE_CATEGORIES } from "../constants";

class PatientCategoryPicker extends Component {
  state = { categories: this.patientCategoriesToState() };

  patientCategoriesToState() {
    let { value } = this.props;
    let result = {};
    PATIENT_CATEGORIES.forEach((cat) => {
      result[cat] = !!(value & cat);
    });
    return result;
  }

  onChangeCategory = (cat) => {
    let { onChange } = this.props;
    this.setState((prevState) => {
      let newCategories = { ...prevState.categories };
      newCategories[cat] = !prevState.categories[cat];

      onChange(PATIENT_CATEGORIES.filter((c) => newCategories[c]).reduce((a, b) => a | b, 0));

      return {
        ...prevState,
        categories: newCategories,
      };
    });
  };

  renderCategorySection = (categories) => {
    const { intl, readOnly } = this.props;
    return categories.map((cat) => (
      <FormControlLabel
        key={"lblPatientCategory_" + cat}
        control={
          <Checkbox
            color="primary"
            key={"patientCategory_" + cat}
            name={`patientCategory${cat}`}
            checked={this.state.categories[cat]}
            onChange={(e) => this.onChangeCategory(cat)}
            disabled={readOnly}
          />
        }
        label={formatMessage(intl, "medical", "patientCategory." + cat)}
      />
    ));
  };

  render() {
    const { intl } = this.props;
    return (
      <>
        <Typography variant="subtitle1">{formatMessage(intl, "medical", "genderCategory")}</Typography>
        <div>{this.renderCategorySection(GENDER_CATEGORIES)}</div>

        <Typography variant="subtitle1">{formatMessage(intl, "medical", "ageCategory")}</Typography>
        <div>{this.renderCategorySection(AGE_CATEGORIES)}</div>
      </>
    );
  }
}

export default injectIntl(PatientCategoryPicker);
