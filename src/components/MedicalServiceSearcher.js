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

import {fetchMedicalServicesSummaries, deleteMedicalService} from "../actions";
import {RIGHT_MEDICALSERVICES_DELETE} from "../constants";
import DeleteMedicalItemOrServiceDialog from "./DeleteMedicalItemOrServiceDialog";
import MedicalServiceFilter from "./MedicalServiceFilter";

const MEDICAL_SERVICE_SEARCHER_CONTRIBUTION_KEY = "medical.MedicalServiceSearcher";

class MedicalServiceSearcher extends Component {
  state = {
    deleteUser: null,
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

  fetch = (prms) => {
    this.props.fetchMedicalServicesSummaries(this.props.modulesManager, prms);
  };

  rowIdentifier = (r) => r.uuid;

  filtersToQueryParams = (state) => {
    const prms = Object.keys(state.filters)
      .filter((contrib) => !!state.filters[contrib].filter)
      .map((contrib) => state.filters[contrib].filter);
    prms.push(`first: ${state.pageSize}`);
    if (state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
    }
    if (state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
    }
    if (state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    return prms;
  };

  headers = () => {
    const h = [
      "medical.service.code",
      "medical.service.name",
      "medical.service.type",
      "medical.service.level",
      "medical.service.price",
      "medical.service.validFrom",
      "medical.service.validTo",
    ];
    return h;
  };

  sorts = () => [
      ["code", true],
      ["name", true],
      ["type", true],
      ["level", true],
      ["price", true],
      ["validFrom", false],
      ["validTo", false],
    ];

  deleteService = () => {
    const service = this.state.deleteService;
    this.setState({ deleteService: null }, (e) => {
      this.props.deleteMedicalService(
        this.props.modulesManager,
        service,
        formatMessage(this.props.intl, "medical.service", "deleteDialog.title"),
      );
    });
  };

  confirmDelete = (deletedService) => {
    this.setState({ deleteService: deletedService });
  };

  deleteAction = (i) => {
    return !!i.validityTo || !!i.clientMutationId ? null : (
      <Tooltip
        title={formatMessage(
          this.props.intl,
          "medical.service",
          "deleteService.tooltip",
        )}
      >
        <IconButton onClick={() => this.confirmDelete(i)}>
          <DeleteIcon/>
        </IconButton>
      </Tooltip>
    );
  }

  itemFormatters = () => {
    const formatters = [
      (ms) => ms.code,
      (ms) => ms.name,
      (ms) => ms.type,
      (ms) => ms.level,
      (ms) => ms.price,
      (ms) => ms.validityFrom,
      (ms) => ms.validityTo,
      (ms) => (
        <Tooltip
          title={formatMessage(this.props.intl, "medical.service", "openNewTab")}
        >
          <IconButton onClick={(e) => this.props.onDoubleClick(ms, true)}>
            <TabIcon />
          </IconButton>
        </Tooltip>
      ),
    ];

    if (this.props.rights.includes(RIGHT_MEDICALSERVICES_DELETE)) {
      formatters.push(this.deleteAction);
    }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;

  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      medicalServices,
      medicalServicesPageInfo,
      fetchingMedicalServices,
      fetchedMedicalServices,
      errorMedicalServices,
      filterPaneMedicalServicesKey,
      cacheFiltersKey,
      onDoubleClick,
    } = this.props;
    const count = medicalServicesPageInfo.totalCount;
    return (
      <>
        <DeleteMedicalItemOrServiceDialog
          medicalService={this.state.deleteService}
          onConfirm={this.deleteService}
          onCancel={(e) => this.setState({ deleteService: null })}
        />
        <Searcher
          module="medicalService"
          cacheFiltersKey={cacheFiltersKey}
          FilterPane={MedicalServiceFilter}
          filterPaneMedicalServicesKey={filterPaneMedicalServicesKey}
          items={medicalServices}
          itemsPageInfo={medicalServicesPageInfo}
          fetchingItems={fetchingMedicalServices}
          fetchedItems={fetchedMedicalServices}
          errorItems={errorMedicalServices}
          medicalServiceKey={MEDICAL_SERVICE_SEARCHER_CONTRIBUTION_KEY}
          tableTitle={formatMessageWithValues(
            intl,
            "medical.service",
            "medicalServiceSummaries",
            {
              count,
            },
          )}
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
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  medicalServices: state.medical.medicalServicesSummaries,
  medicalServicesPageInfo: state.medical.medicalServicesPageInfo,
  fetchingMedicalServices: state.medical.fetchingMedicalServicesSummaries,
  fetchedMedicalServices: state.medical.fetchedMedicalServicesSummaries,
  errorMedicalServices: state.medical.errorMedicalServicesSummaries,
  submittingMutation: state.medical.submittingMutation,
  mutation: state.medical.mutation,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchMedicalServicesSummaries, deleteMedicalService, journalize }, dispatch);

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(MedicalServiceSearcher)),
);
