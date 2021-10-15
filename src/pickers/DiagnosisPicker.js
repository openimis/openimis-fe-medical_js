import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchDiagnosisPicker } from "../actions";
import _debounce from "lodash/debounce";

class DiagnosisPicker extends Component {
  constructor(props) {
    super(props);
    this.cache = props.modulesManager.getConf("fe-medical", "cacheDiagnoses", true);
    this.selectThreshold = props.modulesManager.getConf("fe-medical", "DiagnosisPicker.selectThreshold", 10);
  }

  componentDidMount() {
    if (this.cache && !this.props.diagnoses) {
      // prevent loading multiple times the cache when component is
      // several times on tha page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchDiagnosisPicker(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  formatSuggestion = (s) => (!!s ? `${s.code} ${s.name}` : "");

  getSuggestions = (str) =>
    !!str &&
    str.length >= this.props.modulesManager.getConf("fe-medical", "diagnosesMinCharLookup", 2) &&
    this.props.fetchDiagnosisPicker(this.props.modulesManager, str);

  debouncedGetSuggestion = _debounce(
    this.getSuggestions,
    this.props.modulesManager.getConf("fe-medical", "debounceTime", 800),
  );

  onSuggestionSelected = (v) => this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      diagnoses,
      withLabel = true,
      label,
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
      nullLabel = null,
    } = this.props;
    return (
      <AutoSuggestion
        module="medical"
        items={diagnoses}
        label={!!withLabel && (label || formatMessage(intl, "medical", "Diagnosis"))}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "medical", "DiagnosisPicker.placeholder") : null
        }
        getSuggestions={this.cache ? null : this.debouncedGetSuggestion}
        getSuggestionValue={this.formatSuggestion}
        onSuggestionSelected={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        selectThreshold={this.selectThreshold}
        withNull={withNull}
        nullLabel={nullLabel || formatMessage(intl, "medical", "medical.DiagnosisPicker.null")}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  diagnoses: state.medical.diagnoses,
  fetching: state.medical.fetchingDiagnosis,
  fetched: state.medical.fetchedDiagnosis,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchDiagnosisPicker }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(DiagnosisPicker)));
