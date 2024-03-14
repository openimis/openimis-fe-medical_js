import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { withStyles, withTheme } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";

import {
  AmountInput,
  ErrorBoundary,
  FormPanel,
  PublishedComponent,
  TextInput,
  NumberInput,
  ValidatedTextInput,
  withHistory,
  withModulesManager,
} from "@openimis/fe-core";
import { medicalServicesValidationCheck, medicalServicesValidationClear, medicalServicesSetValid } from "../actions";
import { SERVICE_CODE_MAX_LENGTH, SERVICE_TYPE_PP_F, SERVICE_TYPE_PP_S } from "../constants";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class MedicalServiceMasterPanel extends FormPanel {
  constructor(props) {
    super(props);
    const { medicalService, edited } = props;
    const { packagetype, manualPrice } = medicalService;

    this.state = {
      readOnlyPrice: packagetype === SERVICE_TYPE_PP_S ? 0 : !manualPrice,
    };

    this.showManual = edited?.packagetype && edited.packagetype !== SERVICE_TYPE_PP_S;
  }

  showCheckboxManual = (pSelection) => {
    if (pSelection != null && pSelection != SERVICE_TYPE_PP_S) {
      this.showManual = true;
      this.setState({
        readOnlyPrice: 1,
      });
    } else {
      this.showManual = false;
      this.setState({
        readOnlyPrice: 0,
      });
    }
  };

  showCheckboxManual = (pSelection) => {
    const isManual = pSelection && pSelection !== SERVICE_TYPE_PP_S;
    this.showManual = isManual;
    this.setState({
      readOnlyPrice: isManual ? 1 : 0,
    });
  };

  changeManual = () => {
    this.setState((prevState) => ({
      readOnlyPrice: !prevState.readOnlyPrice,
    }));
  };

  shouldValidate = (inputValue) => {
    const { savedServiceCode } = this.props;
    const shouldValidate = inputValue !== savedServiceCode;
    return shouldValidate;
  };
  render() {
    const {
      classes,
      edited,
      readOnly,
      isServiceValid,
      isServiceValidating,
      serviceValidationError,
      medicalService,
      priceTotal,
    } = this.props;
    const { readOnlyPrice } = this.state;
    return (
      <ErrorBoundary>
        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            <ValidatedTextInput
              action={medicalServicesValidationCheck}
              clearAction={medicalServicesValidationClear}
              setValidAction={medicalServicesSetValid}
              itemQueryIdentifier="serviceCode"
              isValid={isServiceValid}
              isValidating={isServiceValidating}
              validationError={serviceValidationError}
              shouldValidate={this.shouldValidate}
              codeTakenLabel="medical.codeTaken"
              onChange={(code) => this.updateAttribute("code", code)}
              inputProps={{ maxLength: SERVICE_CODE_MAX_LENGTH }}
              required={true}
              module="admin"
              label="medical.service.code"
              readOnly={readOnly}
              value={edited ? edited.code : ""}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.service.name"
              required
              readOnly={readOnly}
              value={edited && edited.name ? edited.name : ""}
              onChange={(name) => this.updateAttributes({ name })}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceTypePPPicker"
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.packagetype : ""}
              onChange={(p) => {
                this.updateAttribute("packagetype", p);
                this.showCheckboxManual(p);
              }}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceTypePicker"
              withNull={false}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited?.type ? edited.type : " "}
              onChange={(p) => this.updateAttribute("type", p)}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceCategoryPicker"
              withNull={false}
              readOnly={Boolean(edited.id) || readOnly}
              value={edited?.category ? edited.category : " "}
              onChange={(p) => this.updateAttribute("category", p)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceLevelPicker"
              withNull={false}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited?.level ? edited.level : " "}
              onChange={(p) => this.updateAttribute("level", p)}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <NumberInput
              min={0}
              module="admin"
              label="medical.service.maximumAmount"
              name="maximumAmount"
              readOnly={readOnly}
              value={edited?.maximumAmount ?? ""}
              onChange={(maximumAmount) => this.updateAttributes({ maximumAmount })}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <AmountInput
              module="admin"
              label={
                medicalService.packagetype === SERVICE_TYPE_PP_F ? "edit.services.ceiling" : "medical.service.price"
              }
              required={!readOnlyPrice}
              name="price"
              readOnly={Boolean(edited.id) || readOnly || readOnlyPrice}
              value={edited ? edited.price : priceTotal}
              onChange={(p) => this.updateAttribute("price", p)}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.CareTypePicker"
              required
              withNull={false}
              readOnly={Boolean(edited.id) || readOnly}
              value={edited?.careType ? edited.careType : " "}
              onChange={(p) => this.updateAttribute("careType", p)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.service.frequency"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.frequency : ""}
              onChange={(p) => this.updateAttribute("frequency", p)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.PatientCategoryPicker"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.patientCategory : ""}
              onChange={(p) => this.updateAttribute("patientCategory", p)}
            />
          </Grid>
        </Grid>
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  isServiceValid: state.medical?.validationFields?.medicalService?.isValid,
  isServiceValidating: state.medical?.validationFields?.medicalService?.isValidating,
  serviceValidationError: state.medical?.validationFields?.medicalService?.validationError,
  savedServiceCode: state.medical?.medicalService?.code,
});

export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(MedicalServiceMasterPanel))))),
);
