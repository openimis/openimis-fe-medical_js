import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Edit as EditIcon } from "@material-ui/icons";
import {
  historyPush,
  withModulesManager,
  withHistory,
  ErrorBoundary,
  formatMessage,
} from "@openimis/fe-core";
import MedicalItemPage from "./MedicalItemPage";

class MedicalItemOverviewPage extends Component {
  componentDidMount() {
    document.title = formatMessage(this.props.intl, "medical.item", "overviewTitle");
  }

  render() {
    const { history, modulesManager, medicalItemId } = this.props;
    const actions = [
      {
        doIt: (e) =>
          historyPush(modulesManager, history, "medical.medicalItemOverview", [medicalItemId]),
        icon: <EditIcon />,
        onlyIfDirty: false,
      },
    ];
    return (
      <ErrorBoundary>
        <MedicalItemPage
          {...this.props}
          readOnly={true}
          overview={true}
          actions={actions}
        />
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (state, props) => {
  return ({
    medicalItemId: props.match.params.medical_item_id,
  })
}

export default withHistory(
  withModulesManager(connect(mapStateToProps)(injectIntl(MedicalItemOverviewPage))),
);
