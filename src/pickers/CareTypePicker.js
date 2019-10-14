import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { CARE_TYPES } from "../constants";

class CareTypePicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="medical"
            label="careType"
            constants={CARE_TYPES}
            {...this.props}
        />
    }
}

export default CareTypePicker;