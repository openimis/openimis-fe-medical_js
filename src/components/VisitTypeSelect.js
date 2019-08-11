import React, { Component } from "react";
import { InputSelect } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { formatMessage } from "@openimis/fe-core";

import { VISIT_TYPES } from "./constants";

class VisitTypeSelect extends Component {

    _onChange = v => this.props.onChange(
        v,
        formatMessage(this.props.intl, "medical", "visitType." + v)
    )

    render() {
        const { intl, name, value } = this.props;
        return (
            <InputSelect
                module="medical"
                label="visitType"
                options={[{
                    value: null,
                    label: formatMessage(intl, "medical", "visitType.null")
                }, ...VISIT_TYPES.map(v => ({
                    value: v,
                    label: formatMessage(intl, "medical", "visitType." + v)
                }))]}
                name={name}
                value={value || null}
                onChange={this._onChange}
            />
        );
    }
}

export default injectIntl(VisitTypeSelect);