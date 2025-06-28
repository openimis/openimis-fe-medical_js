import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { VISIT_TYPES } from "../constants";

class VisitTypePicker extends Component {
  render() {
    return <ConstantBasedPicker module="medical" label="visitType" constants={VISIT_TYPES} {...this.props} />;
  }
}

export default VisitTypePicker;
