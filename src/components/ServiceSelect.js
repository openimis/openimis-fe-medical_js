import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchServices } from "../actions";
import _debounce from "lodash/debounce";

class ServiceSelect extends Component {

    constructor(props) {
        super(props);
        this.cache = props.modulesManager.getConf("fe-medical", "cacheServices", true);
    }

    componentDidMount() {
        if (this.cache && !this.props.services) {
            this.props.fetchServices();
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-medical", "servicesMinCharLookup", 2) &&
        this.props.fetchServices(str);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-medical", "debounceTime", 800)
    )

    formatSuggestion = i => `${i.code} ${i.name}`

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, services, withLabel=true, label, withPlaceholder=false, placeholder } = this.props;
        return <AutoSuggestion
            items={services}
            label={!!withLabel && (label || formatMessage(intl, "medical", "Services"))}
            placeholder={!!withPlaceholder ? (placeholder || formatMessage(intl, "medical", "ServiceSelect.placehoder")) : null}
            getSuggestions={this.cache ? null : this.debouncedGetSuggestion}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
        />
    }
}

const mapStateToProps = state => ({
    services: state.medical.services,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchServices }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ServiceSelect)));
