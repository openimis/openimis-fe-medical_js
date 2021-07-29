import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { SERVICE_LEVELS } from "../constants";

class ServiceLevelPicker extends Component {
    render() {
        return <ConstantBasedPicker
            module="admin"
            label="medical.serviceLevel"
            constants={SERVICE_LEVELS}
            {...this.props}
        />
    }
}

export default ServiceLevelPicker;
