import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager, decodeId } from "@openimis/fe-core";
import { fetchServicePicker } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class ServicePicker extends Component {

    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-medical", "ServicePicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (!this.props.services) {
            // prevent loading multiple times the cache when component is
            // several times on tha page
            setTimeout(
                () => {
                    !this.props.fetching && !this.props.fetched && this.props.fetchServicePicker(this.props.modulesManager)
                },
                Math.floor(Math.random() * 300)
            );
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-medical", "servicesMinCharLookup", 2) &&
        this.props.fetchServicePicker(this.props.modulesManager, str, this.props.refDate);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-medical", "debounceTime", 800)
    )

    formatSuggestion = i => !!i ? `${i.code} ${i.name}` : ''

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, withLabel = true, label, withPlaceholder = false, placeholder, value, reset,
            readOnly = false, required = false,
            withNull = false, nullLabel = null,
            filteredOnPriceList = null, servicesPricelists
        } = this.props;
        if (!this.props.services) return null;
        let services = [...this.props.services]
        if (!!filteredOnPriceList) {
            services = services.filter(i => servicesPricelists[filteredOnPriceList][decodeId(i.id)] !== undefined)
        }
        return <AutoSuggestion
            module="medical"
            items={services}
            label={!!withLabel && (label || formatMessage(intl, "medical", "Services"))}
            placeholder={!!withPlaceholder ? (placeholder || formatMessage(intl, "medical", "ServicePicker.placehoder")) : null}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "medical", "medical.ServicePicker.null")}
        />
    }
}

const mapStateToProps = state => ({
    services: state.medical.services,
    servicesPricelists: !!state.medical_pricelist ? state.medical_pricelist.servicesPricelists : {},
    fetching: state.medical.fetchingServices,
    fetched: state.medical.fetchedServices,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchServicePicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ServicePicker)));
