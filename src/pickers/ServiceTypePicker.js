import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { SERVICE_TYPES } from "../constants";

class ServiceTypePicker extends Component {
    render() {
        return <ConstantBasedPicker
            module="admin"
            label="medical.serviceType"
            constants={SERVICE_TYPES}
            {...this.props}
        />
    }
}

export default ServiceTypePicker;
