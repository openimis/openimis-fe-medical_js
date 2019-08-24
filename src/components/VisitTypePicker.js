import React, { Component } from "react";
import { SelectInput } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { formatMessage } from "@openimis/fe-core";

import { VISIT_TYPES } from "./constants";

class VisitTypePicker extends Component {

    _onChange = v => this.props.onChange(
        v,
        formatMessage(this.props.intl, "medical", "visitType." + v)
    )

    render() {
        const { intl, name, value, withNull = true, readOnly = false } = this.props;
        const options = withNull ? [{
            value: null,
            label: formatMessage(intl, "medical", "visitType.null")
        }] : [];
        options.push(...VISIT_TYPES.map(v => ({
            value: v,
            label: formatMessage(intl, "medical", "visitType." + v)
        })));
        return (
            <SelectInput
                module="medical"
                label="visitType"
                options={options}
                name={name}
                value={value}
                onChange={this._onChange}
                readOnly={readOnly}
            />
        );
    }
}

export default injectIntl(VisitTypePicker);