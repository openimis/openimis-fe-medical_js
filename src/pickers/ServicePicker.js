import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchServicePicker } from "../actions";
import _debounce from "lodash/debounce";

class ServicePicker extends Component {

    constructor(props) {
        super(props);
        this.cache = props.modulesManager.getConf("fe-medical", "cacheServices", true);
    }

    componentDidMount() {
        if (this.cache && !this.props.services) {
            // prevent loading multiple times the cache when component is
            // several times on tha page
            setTimeout(
                () => {
                    !this.props.fetching && this.props.fetchServicePicker(this.props.modulesManager)
                },
                Math.floor(Math.random() * 300)
            );
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-medical", "servicesMinCharLookup", 2) &&
        this.props.fetchServicePicker(this.props.modulesManager, str);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-medical", "debounceTime", 800)
    )

    formatSuggestion = i => !!i ? `${i.code} ${i.name}` : ''

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, services, withLabel = true, label, withPlaceholder = false, placeholder, value, readOnly = false } = this.props;
        return <AutoSuggestion
            items={services}
            label={!!withLabel && (label || formatMessage(intl, "medical", "Services"))}
            placeholder={!!withPlaceholder ? (placeholder || formatMessage(intl, "medical", "ServicePicker.placehoder")) : null}
            getSuggestions={this.cache ? null : this.debouncedGetSuggestion}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            readOnly={readOnly}
        />
    }
}

const mapStateToProps = state => ({
    services: state.medical.services,
    fetching: state.medical.fetchingServices,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchServicePicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ServicePicker)));
