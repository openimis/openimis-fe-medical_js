import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager, decodeId } from "@openimis/fe-core";
import { fetchItemPicker } from "../actions";
import _debounce from "lodash/debounce";

class ItemPicker extends Component {

    constructor(props) {
        super(props);
        this.selectThreshold = props.modulesManager.getConf("fe-medical", "ItemPicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (!this.props.items) {
            // prevent loading multiple times the cache when component is
            // several times on tha page
            setTimeout(
                () => {
                    !this.props.fetching && this.props.fetchItemPicker(this.props.modulesManager)
                },
                Math.floor(Math.random() * 300)
            );
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-medical", "itemsMinCharLookup", 2) &&
        this.props.fetchItemPicker(this.props.modulesManager, str, this.props.refDate);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-medical", "debounceTime", 800)
    )

    formatSuggestion = i => !!i ? `${i.code} ${i.name}` : ''

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, withLabel = true, label, withPlaceholder = false, placeholder, value = null, reset,
            readOnly = false, required = false,
            withNull = false, nullLabel = null,
            filteredOnPriceList = null, itemsPricelists
        } = this.props;
        if (!this.props.items) return null;
        let items = [...this.props.items]
        if (!!filteredOnPriceList) {
            items = items.filter(i => itemsPricelists[filteredOnPriceList][decodeId(i.id)] !== undefined)
        }
        return <AutoSuggestion
            module="medical"
            items={items}
            label={!!withLabel && (label || formatMessage(intl, "medical", "Item"))}
            placeholder={!!withPlaceholder ? (placeholder || formatMessage(intl, "medical", "ItemPicker.placehoder")) : null}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "medical", "medical.ItemPicker.null")}
        />
    }
}

const mapStateToProps = state => ({
    items: state.medical.items,
    itemsPricelists: !!state.medical_pricelist ? state.medical_pricelist.itemsPricelists : {},
    fetching: state.medical.fetchingItems,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchItemPicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ItemPicker)));
