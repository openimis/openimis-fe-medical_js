import React from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { SERVICE_TYPES } from "../constants";

const ServiceTypePicker = (props) => {
  return <ConstantBasedPicker module="admin" label="medical.serviceType" constants={SERVICE_TYPES} {...props} />;
};

export default ServiceTypePicker;
