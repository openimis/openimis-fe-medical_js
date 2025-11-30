import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  formatAmount,
  formatMessage,
  formatMessageWithValues,
  decodeId,
  withModulesManager,
  NumberInput,
  Table,
  PublishedComponent,
  AmountInput,
  TextInput,
  Error,
} from "@openimis/fe-core";
import { Paper, Box } from "@material-ui/core";
import _ from "lodash";
import { fetchMedicalService, fetchMedicalServices } from "../actions"

const styles = (theme) => ({
  paper: theme.paper.paper,
});

class MedicalServiceChildPanel extends Component {
  state = {
    data: [],
  };

  constructor(props) {
    super(props);
    this.fixedPricesAtEnter = props.modulesManager.getConf("fe-claim", "claimForm.fixedPricesAtEnter", false);
    this.fixedPricesAtReview = props.modulesManager.getConf("fe-claim", "claimForm.fixedPricesAtReview", false);
    this.showJustificationAtEnter = props.modulesManager.getConf(
      "fe-claim",
      "claimForm.showJustificationAtEnter",
      false,
    );
  }

  initData = () => {
    let data = [];
    if (!!this.props.edited[`serviceserviceSet`]) {
      data = this.props.edited['serviceserviceSet'] || [];
    }
    if (!_.isEqual(data[data.length - 1], {})) {
      data.push({});
    }
    return data;
  };

  componentDidMount() {
    this.setState({ data: this.initData() });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.edited_id && !this.props.edited_id) {
      let data = [];
      if (!this.props.forReview) {
        data.push({});
      }
      this.setState({ data, reset: this.state.reset + 1 });
    } else if (
      prevProps.reset !== this.props.reset ||
      (!!this.props.edited[`serviceserviceSet`] &&
        !_.isEqual(prevProps.edited[`serviceserviceSet`], this.props.edited[`serviceserviceSet`]))
    ) {
      this.setState({
        data: this.initData(),
      });
    }
  }

  _updateData = (idx, updates) => {
    const data = [...this.state.data];
    updates.forEach((update) => (data[idx][update.attr] = update.v));
    if (!this.props.forReview && data.length === idx + 1) {
      data.push({});
    }
    return data;
  };

  _onEditedChanged = (data) => {
    let edited = { ...this.props.edited };
    edited[`serviceserviceSet`] = data;
    this.props.onEditedChanged(edited);
  };

  _onChange = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    let sumItems = 0;
    data.forEach((update) => {
      if(!isNaN(update.priceAsked) || !isNaN(update.qtyProvided)){
        sumItems += update.priceAsked * update.qtyProvided;
      }
    });
    this._onEditedChanged(data);
  };

  _price = (v) => {
    return v.price;
  };

  _onChangeItem = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    if (!v) {
      data[idx].priceAsked = null;
      data[idx].qtyProvided = null;
    } else {
      data[idx].priceAsked = this._price(v);
      if (!data[idx].qtyProvided) {
        data[idx].qtyProvided = 1;
      }
    }
    this._onEditedChanged(data);
  };

  _onDelete = (idx) => {
    const data = [...this.state.data];
    data.splice(idx, 1);
    this._onEditedChanged(data);
  };

  formatRejectedReason = (i, idx) => {
    if (i.status === 1) return null;
    return (
      <PublishedComponent
        readOnly={true}
        pubRef="claim.RejectionReasonPicker"
        withLabel={false}
        value={i.rejectionReason || null}
        compact={true}
        onChange={(v) => this._onChange(idx, "rejectionReason", v)}
      />
    );
  };

  _onChangeApproval = (idx, attr, v) => {
    let data = this._updateData(idx, [
      { attr, v },
      { attr: "rejectionReason", v: v === 2 ? -1 : null },
    ]);
    this._onEditedChanged(data);
  };
  
  render() {
    const { 
      intl, 
      classes, 
      edited, 
      type, 
      picker, 
      forReview, 
      fetchingPricelist, 
      readOnly = false } = this.props;
    if (!edited) return null;

    let preHeaders = [
      "\u200b",
      "",
      "",
      "",
    ];
    let headers = [
      `edit.${type}s.${type}`,
      `edit.${type}s.quantity`,
      `edit.${type}s.price`,
    ];

    if (this.props.medicalService.packagetype =="F") {
      headers[2]=`edit.${type}s.ceiling`
    }

    let itemFormatters = [
      (i, idx) => (
        <Box minWidth={400}>
          <PublishedComponent
            readOnly={!!forReview || readOnly}
            pubRef={picker}
            withLabel={false}
            value={i.service}
            fullWidth
            date={edited.dateClaimed}
            onChange={(v) => this._onChangeItem(idx, type, v)}
          />
        </Box>
      ),
      (i, idx) => (
        <NumberInput
          readOnly={!!forReview || readOnly}
          value={i.qtyProvided}
          onChange={(v) => this._onChange(idx, "qtyProvided", v)}
        />
      ),
      (i, idx) => (
        <AmountInput
          readOnly={readOnly }
          value={i.priceAsked}
          onChange={(v) => this._onChange(idx, "priceAsked", v)}
        />
      ),
    ];
    if (!!forReview || edited.status !== 2) {
      if (!this.fixedPricesAtReview) {
        preHeaders.push("");
      }
      preHeaders.push(
        "",
      );
    }
    let header = formatMessage(intl, "claim", `edit.${this.props.type}s.title`);
    

    if(this.props.medicalService.packagetype=="P" || this.props.medicalService.packagetype=="F" ){
      return (
        <Paper className={classes.paper}>
          <Table
            module="claim"
            header={header}
            preHeaders={preHeaders}
            headers={headers}
            itemFormatters={itemFormatters}
            items={!fetchingPricelist ? this.state.data : []}
            onDelete={this._onDelete}
          />
        </Paper>
      );
    }else{
      return "";
    }

  }
}

const mapStateToProps = (state, props) => ({
  fetchingPricelist: !!state.medical_pricelist && state.medical_pricelist.fetchingPricelist,
  servicesPricelists: !!state.medical_pricelist ? state.medical_pricelist.servicesPricelists : {},
  itemsPricelists: !!state.medical_pricelist ? state.medical_pricelist.itemsPricelists : {},
});


export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(MedicalServiceChildPanel)))));
