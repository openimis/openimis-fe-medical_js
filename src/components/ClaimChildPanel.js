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
import { fetchMedicalService } from "../actions"
import { claimedAmount, approvedAmount } from "../helpers/amounts";

const styles = (theme) => ({
  paper: theme.paper.paper,
});

class ClaimChildPanel extends Component {
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
    if (!!this.props.edited[`${this.props.type}s`]) {
      data = this.props.edited[`${this.props.type}s`] || [];
    }
    if (!this.props.forReview && this.props.edited.status == 2 && !_.isEqual(data[data.length - 1], {})) {
      data.push({});
    }
    /*const fetchedMedicalServiceT = async () => {
      const fetchms = await this.props.fetchMedicalService();
      console.log("Await");
      fetchms.payload.data.medicalServices.edges.forEach((node) => {
        data.push(node);
        console.log("Data Push");
      });
      console.log(data);
      return data;
    }
    fetchedMedicalServiceT();
    console.log(data);
    */
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
      (!!this.props.edited[`${this.props.type}s`] &&
        !_.isEqual(prevProps.edited[`${this.props.type}s`], this.props.edited[`${this.props.type}s`]))
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
    edited[`${this.props.type}s`] = data;
    this.props.onEditedChanged(edited);
  };

  _onChange = (idx, attr, v) => {
    let data = this._updateData(idx, [{ attr, v }]);
    this._onEditedChanged(data);
  };

  _price = (v) => {
    let id = decodeId(v.id);
    return (
      this.props[`${this.props.type}sPricelists`][this.props.edited.healthFacility[`${this.props.type}sPricelist`].id][
        id
      ] || v.price
    );
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
    const { intl, classes, edited, type, picker, forReview, fetchingPricelist, fetchMedicalService, readOnly = false } = this.props;
    if (!edited) return null;
    /*if (!this.props.edited.healthFacility || !this.props.edited.healthFacility[`${this.props.type}sPricelist`]?.id) {
      return (
        <Paper className={classes.paper}>
          <Error error={{ message: formatMessage(intl, "claim", `${this.props.type}sPricelist.missing`) }} />
        </Paper>
      );
    }*/
    const totalClaimed = _.round(
      this.state.data.reduce((sum, r) => sum + claimedAmount(r), 0),
      2,
    );
    const totalApproved = _.round(
      this.state.data.reduce((sum, r) => sum + approvedAmount(r), 0),
      2,
    );
    let preHeaders = [
      "\u200b",
      "",
      totalClaimed > 0
        ? formatMessageWithValues(intl, "claim", `edit.${type}s.totalClaimed`, {
            totalClaimed: formatAmount(intl, totalClaimed),
          })
        : "",
      "",
    ];
    let headers = [
      `edit.${type}s.${type}`,
      `edit.${type}s.quantity`,
      `edit.${type}s.price`,
      `edit.${type}s.explanation`,
    ];

    let itemFormatters = [
      (i, idx) => (
        <Box minWidth={400}>
          <PublishedComponent
            readOnly={!!forReview || readOnly}
            pubRef={picker}
            withLabel={false}
            value={i[type]}
            fullWidth
            pricelistUuid={edited.healthFacility[`${this.props.type}sPricelist`].uuid}
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
          readOnly={!!forReview || readOnly || this.fixedPricesAtEnter}
          value={i.priceAsked}
          onChange={(v) => this._onChange(idx, "priceAsked", v)}
        />
      ),
      (i, idx) => (
        <TextInput
          readOnly={!!forReview || readOnly}
          value={i.explanation}
          onChange={(v) => this._onChange(idx, "explanation", v)}
        />
      ),
    ];
    /*
    if (!!forReview || edited.status !== 2) {
      if (!this.fixedPricesAtReview) {
        preHeaders.push("");
      }
      preHeaders.push(
        totalClaimed > 0
          ? formatMessageWithValues(intl, "claim", `edit.${type}s.totalApproved`, {
              totalApproved: formatAmount(intl, totalApproved),
            })
          : "",
      );
      headers.push(`edit.${type}s.appQuantity`);
      itemFormatters.push((i, idx) => (
        <NumberInput
          readOnly={readOnly}
          value={i.qtyApproved}
          onChange={(v) => this._onChange(idx, "qtyApproved", v)}
        />
      ));
      if (!this.fixedPricesAtReview) {
        headers.push(`edit.${type}s.appPrice`);
        itemFormatters.push((i, idx) => (
          <AmountInput
            readOnly={readOnly}
            value={i.priceApproved}
            onChange={(v) => this._onChange(idx, "priceApproved", v)}
          />
        ));
      }
    }*/

    /*if (this.showJustificationAtEnter || edited.status !== 2) {
      preHeaders.push("");
      headers.push(`edit.${type}s.justification`);
      itemFormatters.push((i, idx) => (
        <TextInput
          readOnly={readOnly}
          value={i.justification}
          onChange={(v) => this._onChange(idx, "justification", v)}
        />
      ));
    }
    
    if (!!forReview || edited.status !== 2) {
      preHeaders.push("", "");
      headers.push(`edit.${type}s.status`, `edit.${type}s.rejectionReason`);
      itemFormatters.push(
        (i, idx) => (
          <PublishedComponent
            readOnly={readOnly}
            pubRef="claim.ApprovalStatusPicker"
            withNull={false}
            withLabel={false}
            value={i.status}
            onChange={(v) => this._onChangeApproval(idx, "status", v)}
          />
        ),
        (i, idx) => this.formatRejectedReason(i, idx),
      );
    }
    */
    let header = formatMessage(intl, "claim", `edit.${this.props.type}s.title`);
    if (fetchingPricelist) {
      header += formatMessage(intl, "claim", `edit.${this.props.type}s.fetchingPricelist`);
    }
    return (
      <Paper className={classes.paper}>
        <Table
          module="claim"
          header={header}
          preHeaders={preHeaders}
          headers={headers}
          itemFormatters={itemFormatters}
          items={!fetchMedicalService ? this.state.data : []}
          onDelete={!forReview && !readOnly && this._onDelete}
        />
      </Paper>
    );
  }
}

const mapStateToProps = (state, props) => ({
  fetchingPricelist: !!state.medical_pricelist && state.medical_pricelist.fetchingPricelist,
  medicalService: !!state.medical && state.medical.medicalService,
  servicesPricelists: !!state.medical_pricelist ? state.medical_pricelist.servicesPricelists : {},
  itemsPricelists: !!state.medical_pricelist ? state.medical_pricelist.itemsPricelists : {},
});

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ fetchMedicalService }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps,mapDispatchToProps)(ClaimChildPanel)))));
