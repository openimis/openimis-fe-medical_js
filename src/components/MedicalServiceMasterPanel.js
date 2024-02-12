import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { withFormik} from 'formik';
import * as yup from 'yup';

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
import { SERVICE_CODE_MAX_LENGTH } from "../constants";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class MedicalServiceMasterPanel extends FormPanel {
  shouldValidate = (inputValue) => {
    const { savedServiceCode } = this.props;
    const shouldValidate = inputValue !== savedServiceCode;
    return shouldValidate;
  }
  render() {
    const { classes, edited, readOnly, isServiceValid, isServiceValidating, serviceValidationError, errors, touched,
      handleBlur, values} = this.props;
    return (
      <ErrorBoundary>
        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            <ValidatedTextInput
              action={medicalServicesValidationCheck}
              name="serviceCode"
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
              error={(touched.serviceCode && Boolean(errors.serviceCode)) ? errors.serviceCode : null}
              onBlur={handleBlur}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.service.name"
              name="serviceName"
              required
              readOnly={readOnly}
              value={values.serviceName}
              onChange={(name) => this.updateAttributes({ name })}
              error={(touched.serviceName && Boolean(errors.serviceName)) ? errors.serviceName : null}
              onBlur={handleBlur}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceTypePicker"
              name="serviceType"
              withNull={false}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited?.type ? edited.type : " "}
              error={(touched.serviceType && Boolean(errors.serviceType)) ? errors.serviceType : null}
              onBlur={handleBlur}
              onChange={(p) => this.updateAttribute("type", p)}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceCategoryPicker"
              withNull={false}
              name="serviceCategory"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited?.category ? edited.category : " "}
              onChange={(p) => this.updateAttribute("category", p)}
              error={(touched.serviceCategory && Boolean(errors.serviceCategory)) ? errors.serviceCategory : null}
              onBlur={handleBlur}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceLevelPicker"
              withNull={false}
              name="serviceLevelPicker"
              error={(touched.serviceLevelPicker && Boolean(errors.serviceLevelPicker)) ? errors.serviceLevelPicker : null}
              onBlur={handleBlur}
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
              label="medical.service.price"
              required
              name="price"
              error={(touched.price && Boolean(errors.price)) ? errors.price : null}
              onBlur={handleBlur}
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.price : ""}
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
              name="serviceCareType"
              error={(touched.serviceCareType && Boolean(errors.serviceCareType)) ? errors.serviceCareType : null}
              onBlur={handleBlur}
              readOnly={Boolean(edited.id) || readOnly}
              value={edited?.careType ? edited.careType : " "}
              onChange={(p) => this.updateAttribute("careType", p)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.service.frequency"
              name="serviceFrequency"
              error={(touched.serviceFrequency && Boolean(errors.serviceFrequency)) ? errors.serviceFrequency : null}
              onBlur={handleBlur}
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.frequency : ""}
              onChange={(p) => this.updateAttribute("frequency", p)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.PatientCategoryPicker"
              name="servicePatientCategory"
              error={(touched.servicePatientCategory && Boolean(errors.servicePatientCategory)) ? errors.servicePatientCategory : null}
              onBlur={handleBlur}
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

const validationSchema = yup.object({
  serviceCode: yup.string().required('Service code is required'),
  serviceName: yup.string().required('Service name is required'),
  serviceType: yup.string().required('Service type is required'),
  serviceCareType: yup.string().required('asdad')
});

export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(withFormik({
    mapPropsToValues: (props) => {return {serviceName: props.edited.name, 
    serviceCode: props.edited.code,
    serviceType: props.edited.type,
    serviceCareType: props.edited.careType,
    };},
    validationSchema: validationSchema,
    enableReinitialize: true,
    validate:  values => {
      let errors ={}
      return errors
    },
    handleSubmit: (values) => {
      console.log(values);
    },
  })(MedicalServiceMasterPanel)))))),
);
