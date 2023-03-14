import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { IconButton, Tooltip } from "@material-ui/core";
import { Tab as TabIcon, Delete as DeleteIcon } from "@material-ui/icons";
import {
  withModulesManager,
  formatMessageWithValues,
  formatMessage,
  Searcher,
  journalize,
  formatDateFromISO,
} from "@openimis/fe-core";

import { fetchMedicalItemsSummaries, deleteMedicalItem } from "../actions";
import { RIGHT_MEDICALITEMS_DELETE } from "../constants";
import MedicalItemFilter from "./MedicalItemFilter";
import DeleteMedicalItemOrServiceDialog from "./DeleteMedicalItemOrServiceDialog";

const MEDICAL_ITEM_SEARCHER_CONTRIBUTION_KEY = "medical.MedicalItemSearcher";

class MedicalItemSearcher extends Component {
  state = {
    deleteItem: null,
    params: {},
    reset: 0,
  };

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = [10, 20, 50, 100];
    this.defaultPageSize = 10;
    this.locationLevels = 4;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    }
  }

  fetch = (params) => {
    this.setState({ params });
    this.props.fetchMedicalItemsSummaries(this.props.modulesManager, params);
  };

  rowIdentifier = (r) => r.uuid;

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((contrib) => !!state.filters[contrib].filter)
      .map((contrib) => state.filters[contrib].filter);
    if (!state.beforeCursor && !state.afterCursor) {
      prms.push(`first: ${state.pageSize}`);
    }
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
      prms.push(`first: ${state.pageSize}`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
      prms.push(`last: ${state.pageSize}`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  headers = () => {
    const h = [
      "medical.item.code",
      "medical.item.name",
      "medical.item.type",
      "medical.item.package",
      "medical.item.quantity",
      "medical.item.price",
      "medical.item.validFrom",
      "medical.item.validTo",
    ];
    return h;
  };

  sorts = () => [
    ["code", true],
    ["name", true],
    ["type", true],
    ["package", true],
    ["quantity", false],
    ["price", true],
    ["validityFrom", false],
    ["validityTo", false],
  ];

  deleteItem = () => {
    const item = this.state.deleteItem;
    this.setState({ deleteItem: null }, async (e) => {
      await this.props.deleteMedicalItem(
        this.props.modulesManager,
        item,
        formatMessage(this.props.intl, "medical.item", "deleteDialog.title"),
      );
      this.fetch(this.state.params);
    });
  };

  confirmDelete = (deletedItem) => {
    this.setState({ deleteItem: deletedItem });
  };

  deleteAction = (i) => {
    return !!i.validityTo || !!i.clientMutationId ? null : (
      <Tooltip title={formatMessage(this.props.intl, "medical.item", "deleteItem.tooltip")}>
        <IconButton onClick={() => this.confirmDelete(i)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    );
  };

  itemFormatters = () => {
    const formatters = [
      (ms) => ms.code,
      (ms) => ms.name,
      (ms) => formatMessage(this.props.intl, "medical.itemType", ms.type),
      (ms) => ms.package,
      (ms) => ms.quantity,
      (ms) => ms.price,
      (ms) => formatDateFromISO(this.props.modulesManager, this.props.intl, ms.validityFrom),
      (ms) => formatDateFromISO(this.props.modulesManager, this.props.intl, ms.validityTo),
      (ms) => (
        <Tooltip title={formatMessage(this.props.intl, "medical.item", "openNewTab")}>
          <IconButton onClick={(e) => this.props.onDoubleClick(ms, true)}>
            <TabIcon />
          </IconButton>
        </Tooltip>
      ),
    ];

    if (this.props.rights.includes(RIGHT_MEDICALITEMS_DELETE)) {
      formatters.push(this.deleteAction);
    }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      medicalItems,
      medicalItemsPageInfo,
      fetchingMedicalItems,
      fetchedMedicalItems,
      errorMedicalItems,
      filterPaneMedicalItemsKey,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;
    const count = medicalItemsPageInfo.totalCount;
    return (
      <>
        <DeleteMedicalItemOrServiceDialog
          medicalItem={this.state.deleteItem}
          onConfirm={this.deleteItem}
          onCancel={(e) => this.setState({ deleteItem: null })}
        />
        <Searcher
          module="medicalItem"
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={MedicalItemFilter}
          filterPaneMedicalItemsKey={filterPaneMedicalItemsKey}
          items={medicalItems}
          itemsPageInfo={medicalItemsPageInfo}
          fetchingItems={fetchingMedicalItems}
          fetchedItems={fetchedMedicalItems}
          errorItems={errorMedicalItems}
          medicalItemKey={MEDICAL_ITEM_SEARCHER_CONTRIBUTION_KEY}
          tableTitle={formatMessageWithValues(intl, "medical.item", "medicalItemSummaries", {
            count,
          })}
          rowsPerPageOptions={this.rowsPerPageOptions}
          defaultPageSize={this.defaultPageSize}
          fetch={this.fetch}
          rowIdentifier={this.rowIdentifier}
          filtersToQueryParams={this.filtersToQueryParams}
          defaultOrderBy="code"
          headers={this.headers}
          itemFormatters={this.itemFormatters}
          sorts={this.sorts}
          rowDisabled={this.rowDisabled}
          rowLocked={this.rowLocked}
          onDoubleClick={(c) => !c.clientMutationId && onDoubleClick(c)}
          reset={this.state.reset}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  medicalItems: state.medical.medicalItemsSummaries,
  medicalItemsPageInfo: state.medical.medicalItemsPageInfo,
  fetchingMedicalItems: state.medical.fetchingMedicalItemsSummaries,
  fetchedMedicalItems: state.medical.fetchedMedicalItemsSummaries,
  errorMedicalItems: state.medical.errorMedicalItemsSummaries,
  submittingMutation: state.medical.submittingMutation,
  mutation: state.medical.mutation,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchMedicalItemsSummaries, deleteMedicalItem, journalize }, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(MedicalItemSearcher)));
