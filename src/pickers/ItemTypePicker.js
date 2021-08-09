import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import {ITEM_TYPES} from "../constants";

class ItemTypePicker extends Component {
    render() {
        return <ConstantBasedPicker
            module="admin"
            label="medical.itemType"
            constants={ITEM_TYPES}
            {...this.props}
        />
    }
}

export default ItemTypePicker;
