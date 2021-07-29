import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  historyPush,
  withModulesManager,
  withHistory,
  withTooltip,
  formatMessage,
} from "@openimis/fe-core";
import {RIGHT_MEDICALSERVICES_ADD} from "../constants";
import MedicalServiceSearcher from "../components/MedicalServiceSearcher";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class MedicalServicesPage extends Component {
  onDoubleClick = (ms, newTab = false) => {
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "medical.medicalServiceOverview",
      [ms.uuid],
      newTab,
    );
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalServiceNew");
  };

  render() {
    const { classes, rights, intl } = this.props;
    return (
      <div className={classes.page}>
        <MedicalServiceSearcher
          cacheFiltersKey="medicalServicesPageFiltersCache"
          onDoubleClick={this.onDoubleClick}
        />
        {rights.includes(RIGHT_MEDICALSERVICES_ADD) &&
          withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, "medical.medicalService", "medical.addNewMedicalService.tooltip"),
          )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
});

export default injectIntl(
  withModulesManager(
    withHistory(
      connect(mapStateToProps)(withTheme(withStyles(styles)(MedicalServicesPage))),
    ),
  ),
);
