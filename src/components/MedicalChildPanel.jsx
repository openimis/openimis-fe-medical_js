import React, { Component } from "react";
import { connect } from "react-redux";
import { styled } from "@mui/material/styles";
import { Paper, Box } from "@mui/material";
import isEqual from "lodash/isEqual";

import {
  withModulesManager,
  PublishedComponent,
  NumberInput,
  AmountInput,
  Table,
  formatMessage,
  injectIntl,
} from "@openimis/fe-core";

const StyledMedicalChildPanel = styled("div")(({ theme }) => ({
  "& .paper": theme.paper?.paper ?? {},
}));

// Package types whose content (services or items) is listed with a quantity and a price.
const PACKAGE_TYPES_WITH_CONTENT = new Set(["P", "F"]);
const FIXED_PRICE_PACKAGE = "F";

/*
 * The services or the items a package service contains, as an editable table.
 *
 * `editedKey` names the attribute of the edited service that holds the lines
 * (servicesLinked for items, serviceserviceSet for services) and `valueKey` the
 * attribute of a line that holds the picked item or service.
 */
class MedicalChildPanel extends Component {
  state = {
    data: [],
  };

  constructor(props) {
    super(props);
    this.fixedPricesAtReview = props.modulesManager.getConf("fe-claim", "claimForm.fixedPricesAtReview", false);
  }

  initData = () => {
    const { edited, editedKey } = this.props;
    const data = edited[editedKey] || [];
    if (!isEqual(data[data.length - 1], {})) {
      data.push({});
    }
    return data;
  };

  componentDidMount() {
    this.setState({ data: this.initData() });
  }

  componentDidUpdate(prevProps) {
    const { edited, editedKey } = this.props;
    if (prevProps.edited_id && !this.props.edited_id) {
      const data = [];
      if (!this.props.forReview) {
        data.push({});
      }
      this.setState((state) => ({ data, reset: state.reset + 1 }));
    } else if (
      prevProps.reset !== this.props.reset ||
      (!!edited[editedKey] && !isEqual(prevProps.edited[editedKey], edited[editedKey]))
    ) {
      this.setState({
        data: this.initData(),
      });
    }
  }

  _updateData = (idx, updates) => {
    const data = [...this.state.data];
    updates.forEach((update) => {
      data[idx][update.attr] = update.v;
    });
    if (!this.props.forReview && data.length === idx + 1) {
      data.push({});
    }
    return data;
  };

  _onEditedChanged = (data) => {
    this.props.onEditedChanged({ ...this.props.edited, [this.props.editedKey]: data });
  };

  _onChange = (idx, attr, v) => {
    this._onEditedChanged(this._updateData(idx, [{ attr, v }]));
  };

  _onChangeItem = (idx, attr, v) => {
    const data = this._updateData(idx, [{ attr, v }]);
    if (v) {
      data[idx].priceAsked = v.price;
      if (!data[idx].qtyProvided) {
        data[idx].qtyProvided = 1;
      }
    } else {
      data[idx].priceAsked = null;
      data[idx].qtyProvided = null;
    }
    this._onEditedChanged(data);
  };

  _onDelete = (idx) => {
    const data = [...this.state.data];
    data.splice(idx, 1);
    this._onEditedChanged(data);
  };

  render() {
    const {
      intl,
      edited,
      type,
      picker,
      forReview,
      fetchingPricelist,
      readOnly = false,
      valueKey,
      medicalService,
    } = this.props;
    if (!edited) return null;
    if (!PACKAGE_TYPES_WITH_CONTENT.has(medicalService.packagetype)) return "";

    const preHeaders = ["​", "", "", ""];
    const headers = [
      `edit.${type}s.${type}`,
      `edit.${type}s.quantity`,
      medicalService.packagetype === FIXED_PRICE_PACKAGE ? `edit.${type}s.ceiling` : `edit.${type}s.price`,
    ];

    const itemFormatters = [
      (i, idx) => (
        <Box sx={{ minWidth: 400 }}>
          <PublishedComponent
            readOnly={!!forReview || readOnly}
            pubRef={picker}
            withLabel={false}
            value={i[valueKey]}
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
        <AmountInput readOnly={readOnly} value={i.priceAsked} onChange={(v) => this._onChange(idx, "priceAsked", v)} />
      ),
    ];
    if (!!forReview || edited.status !== 2) {
      if (!this.fixedPricesAtReview) {
        preHeaders.push("");
      }
      preHeaders.push("");
    }

    return (
      <StyledMedicalChildPanel>
        <Paper className="paper">
          <Table
            module="claim"
            header={formatMessage(intl, "claim", `edit.${type}s.title`)}
            preHeaders={preHeaders}
            headers={headers}
            itemFormatters={itemFormatters}
            items={fetchingPricelist ? [] : this.state.data}
            onDelete={this._onDelete}
          />
        </Paper>
      </StyledMedicalChildPanel>
    );
  }
}

const mapStateToProps = (state) => ({
  fetchingPricelist: !!state.medical_pricelist && state.medical_pricelist.fetchingPricelist,
});

export { StyledMedicalChildPanel };
export default withModulesManager(injectIntl(connect(mapStateToProps)(MedicalChildPanel)));
