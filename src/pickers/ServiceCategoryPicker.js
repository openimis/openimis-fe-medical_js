import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { SERVICE_CATEGORIES } from "../constants";

class MedicalServiceCategoryPicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="admin"
        label="medical.serviceCategory"
        constants={SERVICE_CATEGORIES}
        {...this.props}
      />
    );
  }
}

export default MedicalServiceCategoryPicker;
