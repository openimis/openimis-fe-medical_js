import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  ErrorBoundary,
  Helmet,
} from "@openimis/fe-core";
import MedicalServiceForm from "../components/MedicalServiceForm";
import { createMedicalService, updateMedicalService } from "../actions";
import { RIGHT_MEDICALSERVICES_ADD, RIGHT_MEDICALSERVICES_EDIT } from "../constants";

const styles = (theme) => ({
  page: theme.page,
});

class MedicalServicePage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalServiceNew");
  };

  save = (medicalService) => {
    if (!medicalService.uuid) {
      this.props.createMedicalService(
        this.props.modulesManager,
        medicalService,
        formatMessageWithValues(this.props.intl, "medical.medicalService", "createMedicalService.mutationLabel"),
      );
    } else {
      console.log(medicalService);
      this.props.updateMedicalService(
        this.props.modulesManager,
        medicalService,
        formatMessageWithValues(this.props.intl, "medical.service", "update.mutationLabel"),
      );
    }
  };

  render() {
    const { classes, rights, medicalServiceId, overview, modulesManager, history } = this.props;
    if (!rights.includes(RIGHT_MEDICALSERVICES_EDIT)) return null;
    return (
      <div className={classes.page}>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.service", "serviceTitle")} />
        <ErrorBoundary>
          <MedicalServiceForm
            overview={overview}
            medicalServiceId={medicalServiceId}
            back={(e) => historyPush(modulesManager, history, "medical.medicalServices")}
            add={rights.includes(RIGHT_MEDICALSERVICES_ADD) ? this.add : null}
            save={this.save}
          />
        </ErrorBoundary>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  userId: props.match.params.user_id,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createMedicalService, updateMedicalService }, dispatch);

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(MedicalServicePage)))),
  ),
);
