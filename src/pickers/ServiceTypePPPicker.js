import React from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { SERVICE_TYPES_PP } from "../constants";

const ServiceTypePPPicker = (props) => {
  return <ConstantBasedPicker module="admin" label="medical.serviceTypePP" constants={SERVICE_TYPES_PP} {...props} />;
};

export default ServiceTypePPPicker;
