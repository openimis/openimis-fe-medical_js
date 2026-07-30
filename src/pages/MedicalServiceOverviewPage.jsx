import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";

import {
  ErrorBoundary,
  formatMessageWithValues,
  Helmet,
  historyPush,
  withHistory,
  withModulesManager,
  GetIconComponent,
} from "@openimis/fe-core";
import MedicalServicePage from "./MedicalServicePage";
const EditIcon = GetIconComponent("Edit")

class MedicalServiceOverviewPage extends Component {
  render() {
    const { history, modulesManager, medicalServiceId } = this.props;
    const actions = [
      {
        doIt: (e) => historyPush(modulesManager, history, "medical.medicalServiceOverview", [medicalServiceId]),
        icon: <EditIcon />,
        onlyIfDirty: false,
      },
    ];
    return (
      <ErrorBoundary>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.service", "overviewTitle")} />
        <MedicalServicePage {...this.props} readOnly={true} overview={true} actions={actions} />
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    medicalServiceId: props.match.params.medical_service_id,
  };
};

export { MedicalServiceOverviewPage };
export default withHistory(withModulesManager(connect(mapStateToProps)(injectIntl(MedicalServiceOverviewPage))));
