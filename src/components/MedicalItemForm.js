import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { withStyles, withTheme } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay";

import {
  coreConfirm,
  ErrorBoundary,
  Form,
  Helmet,
  formatMessageWithValues,
  historyPush,
  journalize,
  parseData,
  ProgressOrError,
  withHistory,
  withModulesManager,
} from "@openimis/fe-core";
import {
  createMedicalItem,
  fetchMedicalItem,
  fetchMedicalItemMutation,
  newMedicalItem,
  clearItemForm,
} from "../actions";
import { RIGHT_MEDICALITEMS, ITEM_CODE_MAX_LENGTH } from "../constants";
import MedicalItemMasterPanel from "./MedicalItemMasterPanel";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

const MEDICAL_ITEM_OVERVIEW_MUTATIONS_KEY = "medicalItem.MedicalItemOverview.mutations";

class MedicalItemForm extends Component {
  state = {
    reset: 0,
    medicalItem: this.newMedicalItem(),
    newMedicalItem: true,
    confirmedAction: null,
  };

  newMedicalItem() {
    return { patientCategory: 15 };
  }

  componentDidMount() {
    if (this.props.medicalItemId) {
      this.setState(
        (state, props) => ({ medicalItemId: props.medicalItemId }),
        (e) => this.props.fetchMedicalItem(this.props.modulesManager, this.props.medicalItemId),
      );
    }
    if (this.props.id) {
      this.setState((state, props) => ({
        medicalItem: {
          ...this.newMedicalItem(),
          id: props.id,
        },
      }));
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.fetchedMedicalItem && !!this.props.fetchedMedicalItem) {
      const { medicalItem } = this.props;
      this.setState({
        medicalItem,
        medicalItemId: medicalItem.id,
        lockNew: false,
        newMedicalItem: false,
      });
    } else if (prevProps.medicalItemId && !this.props.medicalItemId) {
      this.setState({
        medicalItem: this.newMedicalItem(),
        newMedicalItem: true,
        lockNew: false,
        medicalItemId: null,
      });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state, props) => ({
        medicalItem: {
          ...state.medicalItem,
          clientMutationId: props.mutation.clientMutationId,
        },
      }));
    } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
      this.state.confirmedAction();
    }
  }

  componentWillUnmount = () => {
    this.props.clearItemForm();
  };

  add = () => {
    this.setState(
      (state) => ({
        medicalItem: this.newMedicalItem(),
        newMedicalItem: true,
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
    if (this.props.mutation?.clientMutationId && !this.props.mutation?.medicalItemId) {
      const { clientMutationId } = this.props.mutation;
      this.props.fetchMedicalItemMutation(this.props.modulesManager, clientMutationId).then((res) => {
        const mutationLogs = parseData(res.payload.data.mutationLogs);
        if (
          mutationLogs &&
          mutationLogs[0] &&
          mutationLogs[0].medicalItems &&
          mutationLogs[0].medicalItems[0] &&
          mutationLogs[0].medicalItems[0].coreUser
        ) {
          const { id } = parseData(res.payload.data.mutationLogs)[0].users[0].coreUser;
          if (id) {
            historyPush(this.props.modulesManager, this.props.history, "medical.medicalItemOverview", [id]);
          }
        }
      });
    } else {
      this.props.fetchMedicalItem(this.props.modulesManager, this.props.medicalItemId);
    }
  };

  canSave = () =>
    this.state.medicalItem &&
    this.state.medicalItem.code &&
    this.state.medicalItem.code.length <= ITEM_CODE_MAX_LENGTH &&
    this.state.medicalItem.name &&
    this.state.medicalItem.type &&
    this.state.medicalItem.price &&
    this.state.medicalItem.careType &&
    this.props.isItemValid;

  save = (medicalItem) => {
    this.setState(
      { lockNew: !medicalItem.id }, // avoid duplicates
      (e) => this.props.save(medicalItem),
    );
  };

  onEditedChanged = (medicalItem) => {
    this.setState({ medicalItem, newMedicalItem: false });
  };

  onActionToConfirm = (title, message, confirmedAction) => {
    this.setState({ confirmedAction }, this.props.coreConfirm(title, message));
  };

  render() {
    const {
      modulesManager,
      classes,
      state,
      rights,
      medicalItemId,
      fetchingMedicalItem,
      fetchedMedicalItem,
      errorMedicalItem,
      overview = false,
      readOnly = false,
      add,
      save,
      back,
    } = this.props;
    const { medicalItem, reset, lockNew } = this.state;
    if (!rights.includes(RIGHT_MEDICALITEMS)) return null;
    let runningMutation = !!medicalItem && !!medicalItem.clientMutationId;
    const contributedMutations = modulesManager.getContribs(MEDICAL_ITEM_OVERVIEW_MUTATIONS_KEY);
    for (let i = 0; i < contributedMutations.length && !runningMutation; i += 1) {
      runningMutation = contributedMutations[i](state);
    }
    const actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly && !runningMutation,
      },
    ];
    return (
      <div className={runningMutation ? classes.lockedPage : null}>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.item", "MedicalItemOverview.title")} />
        <ProgressOrError progress={fetchingMedicalItem} error={errorMedicalItem} />
        <ErrorBoundary>
          {((!!fetchedMedicalItem && !!medicalItem && medicalItem.uuid === medicalItemId) || !medicalItemId) && (
            <Form
              module="medicalItem"
              title={
                this.state.newMedicalItem
                  ? "medical.item.MedicalItemOverview.newTitle"
                  : "medical.item.MedicalItemOverview.title"
              }
              edited_id={medicalItemId}
              edited={medicalItem}
              reset={reset}
              back={back}
              add={!!add && !this.state.newMedicalItem ? this.add : null}
              readOnly={readOnly || lockNew || runningMutation || (!!medicalItem && !!medicalItem.validityTo)}
              actions={actions}
              overview={overview}
              HeadPanel={MedicalItemMasterPanel}
              medicalItem={medicalItem}
              onEditedChanged={this.onEditedChanged}
              canSave={this.canSave}
              save={save ? this.save : null}
              openDirty={save}
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
  fetchingMedicalItem: state.medical.fetchingMedicalItem,
  errorMedicalItem: state.medical.errorMedicalItem,
  fetchedMedicalItem: state.medical.fetchedMedicalItem,
  submittingMutation: state.medical.submittingMutation,
  mutation: state.medical.mutation,
  medicalItem: state.medical.medicalItem,
  confirmed: state.core.confirmed,
  isItemValid: state.medical?.validationFields?.medicalItem?.isValid,
  state,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      clearItemForm,
      fetchMedicalItem,
      newMedicalItem,
      createMedicalItem,
      fetchMedicalItemMutation,
      journalize,
      coreConfirm,
    },
    dispatch,
  );

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(MedicalItemForm)))),
  ),
);
