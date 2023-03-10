import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { withStyles, withTheme } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay";

import {
  coreConfirm,
  Helmet,
  ErrorBoundary,
  Form,
  formatMessageWithValues,
  historyPush,
  journalize,
  parseData,
  ProgressOrError,
  withHistory,
  withModulesManager,
} from "@openimis/fe-core";
import {
  createMedicalService,
  fetchMedicalService,
  fetchMedicalServiceMutation,
  newMedicalService,
  clearServiceForm,
} from "../actions";
import { RIGHT_MEDICALSERVICES, SERVICE_CODE_MAX_LENGTH } from "../constants";
import MedicalServiceMasterPanel from "./MedicalServiceMasterPanel";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

class MedicalServiceForm extends Component {
  state = {
    lockNew: false,
    reset: 0,
    medicalService: this.newMedicalService(),
    newMedicalService: true,
    confirmedAction: null,
  };

  newMedicalService() {
    return { patientCategory: 15 };
  }

  componentDidMount() {
    if (this.props.medicalServiceId) {
      this.setState(
        (state, props) => ({ medicalServiceId: props.medicalServiceId }),
        (e) => this.props.fetchMedicalService(this.props.modulesManager, this.props.medicalServiceId),
      );
    }
    if (this.props.id) {
      this.setState((state, props) => ({
        medicalService: {
          ...this.newMedicalService(),
          id: props.id,
        },
      }));
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.fetchedMedicalService && !!this.props.fetchedMedicalService) {
      const { medicalService } = this.props;
      this.setState({
        medicalService,
        medicalServiceId: medicalService.id,
        lockNew: false,
        newMedicalService: false,
      });
    } else if (prevProps.medicalServiceId && !this.props.medicalServiceId) {
      this.setState({
        medicalService: this.newMedicalService(),
        newMedicalService: true,
        lockNew: false,
        medicalServiceId: null,
      });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state, props) => ({
        medicalService: {
          ...state.medicalService,
          clientMutationId: props.mutation.clientMutationId,
        },
      }));
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  componentWillUnmount = () => {
    this.props.clearServiceForm();
  };

  add = () => {
    this.setState(
      (state) => ({
        medicalService: this.newMedicalService(),
        newMedicalService: true,
        lockNew: false,
        reset: state.reset + 1,
      }),
      (e) => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  reload = () => {
    const { clientMutationId, medicalServiceId } = this.props.mutation;
    if (clientMutationId && !medicalServiceId) {
      this.props.fetchMedicalServiceMutation(this.props.modulesManager, clientMutationId).then((res) => {
        const mutationLogs = parseData(res.payload.data.mutationLogs);
        if (
          mutationLogs &&
          mutationLogs[0] &&
          mutationLogs[0].medicalServices &&
          mutationLogs[0].medicalServices[0] &&
          mutationLogs[0].medicalServices[0].coreUser
        ) {
          const { id } = parseData(res.payload.data.mutationLogs)[0].users[0].coreUser;
          if (id) {
            historyPush(this.props.modulesManager, this.props.history, "medical.medicalServiceOverview", [id]);
          }
        }
      });
    } else {
      this.props.fetchMedicalService(this.props.modulesManager, medicalServiceId, clientMutationId);
    }
  };

  canSave = () =>
    this.state.medicalService &&
    this.state.medicalService.code &&
    this.state.medicalService.code.length <= SERVICE_CODE_MAX_LENGTH &&
    this.state.medicalService.name &&
    this.state.medicalService.type &&
    this.state.medicalService.level &&
    this.state.medicalService.price &&
    this.state.medicalService.careType &&
    this.props.isServiceValid;

  save = (medicalService) => {
    this.setState(
      { lockNew: !medicalService.id }, // avoid duplicates
      (e) => this.props.save(medicalService),
    );
  };

  onEditedChanged = (medicalService) => {
    this.setState({ medicalService, newMedicalService: false });
  };

  onActionToConfirm = (title, message, confirmedAction) => {
    this.setState({ confirmedAction }, this.props.coreConfirm(title, message));
  };

  render() {
    const {
      classes,
      rights,
      medicalServiceId,
      fetchingMedicalService,
      fetchedMedicalService,
      errorMedicalService,
      overview = false,
      readOnly = false,
      add,
      save,
      back,
    } = this.props;
    const { medicalService, reset, lockNew } = this.state;
    if (!rights.includes(RIGHT_MEDICALSERVICES)) return null;
    const actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly,
      },
    ];
    return (
      <div className={lockNew ? classes.lockedPage : null}>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.service", "MedicalServiceOverview.title")} />
        <ProgressOrError progress={fetchingMedicalService} error={errorMedicalService} />
        <ErrorBoundary>
          {((!!fetchedMedicalService && !!medicalService && medicalService.uuid === medicalServiceId) ||
            !medicalServiceId) && (
            <Form
              module="medicalService"
              title={
                this.state.newMedicalService
                  ? "medical.service.MedicalServiceOverview.newTitle"
                  : "medical.service.MedicalServiceOverview.title"
              }
              edited_id={medicalServiceId}
              edited={medicalService}
              reset={reset}
              back={back}
              add={!!add && !this.state.newMedicalService ? this.add : null}
              readOnly={readOnly || lockNew || (!!medicalService && !!medicalService.validityTo)}
              actions={actions}
              overview={overview}
              HeadPanel={MedicalServiceMasterPanel}
              medicalService={medicalService}
              onEditedChanged={this.onEditedChanged}
              canSave={this.canSave}
              save={save ? this.save : null}
              onActionToConfirm={this.onActionToConfirm}
            />
          )}
        </ErrorBoundary>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingMedicalService: state.medical.fetchingMedicalService,
  errorMedicalService: state.medical.errorMedicalService,
  fetchedMedicalService: state.medical.fetchedMedicalService,
  submittingMutation: state.medical.submittingMutation,
  mutation: state.medical.mutation,
  medicalService: state.medical.medicalService,
  confirmed: state.core.confirmed,
  isServiceValid: state.medical?.validationFields?.medicalService?.isValid,
  state,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearServiceForm,
      fetchMedicalService,
      newMedicalService,
      createMedicalService,
      fetchMedicalServiceMutation,
      journalize,
      coreConfirm,
    },
    dispatch,
  );

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(MedicalServiceForm)))),
  ),
);
