import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
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
import { RIGHT_MEDICALSERVICES } from "../constants";
import MedicalServiceChildPanel from "./MedicalServiceChildPanel";
import MedicalItemChildPanel from "./MedicalItemChildPanel";

import { 
  createMedicalService,
  fetchMedicalService,
  fetchMedicalServices,
  fetchMedicalServiceMutation,
  newMedicalService } from "../actions";
import MedicalServiceMasterPanel from "./MedicalServiceMasterPanel";

const styles = (theme) => ({
  lockedPage: theme.page.locked,
});

class MedicalServicesPanel extends Component {
  render() {
    return <MedicalServiceChildPanel {...this.props} type="service" picker="medical.ServiceFilterWithoutHFPicker" />;
  }
}

class MedicalItemsPanel extends Component {
  render() {
    return <MedicalItemChildPanel {...this.props} type="item" picker="medical.ItemPicker" />;
  }
}

class MedicalServiceForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      medicalService: this.newMedicalService(),
      newMedicalService: true,
      confirmedAction: null,
      totalPrice: 0,
      sumItems:0,
      sumServices:0,
      manualPrice: false
    };
  }

  getTotalPrice = () => {
    return this.state.totalPrice;
  }

  newMedicalService() {
    return { patientCategory: 15 };
  }

  componentDidMount() {
    this.props.fetchMedicalServices(this.props.modulesManager);
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

  priceCalcul = () => {

    let sumItem = 0 ;
    let sumService = 0 ;
    if(this.state.medicalService.servicesLinked != undefined){
      this.state.medicalService.servicesLinked.forEach((item) => {
        if(item.priceAsked != undefined){
          sumItem += parseFloat(item.priceAsked)*parseFloat(item.qtyProvided);
        }
      });
    }

    if(this.state.medicalService.serviceserviceSet != undefined){
      this.state.medicalService.serviceserviceSet.forEach((service) => {
        if(service.priceAsked != undefined){
          sumService += parseFloat(service.priceAsked)*parseFloat(service.qtyProvided);
        }
      });      
    }
    this.state.totalPrice = sumItem+sumService;

    if(this.state.medicalService.packagetype!="S" && this.state.medicalService.packagetype!=null){
      if(this.state.medicalService.manualPrice != true){
        this.state.medicalService.price = this.state.totalPrice;
      }
    }
  }

  canSave = () => {
    this.priceCalcul();
    console.log(this.state);

    return this.state.medicalService &&
    this.state.medicalService.code &&
    this.state.medicalService.name &&
    this.state.medicalService.type &&
    !isNaN(this.state.medicalService.price) &&
    this.state.medicalService.level &&
    this.state.medicalService.packagetype &&
    this.state.medicalService.careType;

  }

  save = (medicalService) => {
    console.log("Save :");
    console.log(medicalService);
    this.setState(
      { lockNew: !medicalService.id }, // avoid duplicates
      (e) => this.props.save(medicalService),
    );
  };

  onEditedChanged = (medicalService) => {
    this.priceCalcul();
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
              Panels={[MedicalServicesPanel,MedicalItemsPanel]}
              medicalService={medicalService}
              onEditedChanged={this.onEditedChanged}
              priceTotal={this.state.totalPrice}
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
  fetchedMedicalServices: state.medical.fetchedMedicalServices,
  submittingMutation: state.medical.submittingMutation,
  mutation: state.medical.mutation,
  medicalService: state.medical.medicalService,
  confirmed: state.core.confirmed,
  state,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMedicalService,
      fetchMedicalServices,
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
