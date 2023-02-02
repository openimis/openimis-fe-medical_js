import React from "react";
import { withStyles, withTheme } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Grid } from "@material-ui/core";
import {
  AmountInput,
  FormPanel,
  NumberInput,
  PublishedComponent,
  TextInput,
  withHistory,
  withModulesManager,
  ValidatedTextInput
} from "@openimis/fe-core";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class MedicalItemMasterPanel extends FormPanel {
  render() {
    const { classes, edited, readOnly } = this.props;
    return (
      <>
        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            <ValidatedTextInput
              action={servicesOrItems ? medicalServicesValidationCheck : medicalItemsValidationCheck}
              clearAction={servicesOrItems ? medicalServicesValidationClear : medicalItemsValidationClear}
              itemQueryIdentifier={servicesOrItems ? "servicesPricelistName" : "itemsPricelistName"}
              isValid={servicesOrItems ? isMedicalServiceValid : isMedicalItemValid}
              isValidating={servicesOrItems ? isMedicalServiceValidating : isMedicalItemValidating}
              validationError={servicesOrItems ? medicalServiceValidationError : medicalItemValidationError}
              shouldValidate={this.shouldValidate}
              codeTakenLabel="medical_pricelist.nameTaken"
              onChange={(name) => this.updateAttribute("name", name)}
              required={true}
              module="admin"
              label="medical.item.code"
              readOnly={readOnly}
              value={edited ? edited.code : ""}
            />
          </Grid>
          <Grid item xs={10} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.item.name"
              required
              readOnly={readOnly}
              value={edited && edited.name ? edited.name : ""}
              onChange={(name) => this.updateAttributes({ name })}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ItemTypePicker"
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.type : ""}
              onChange={(p) => this.updateAttribute("type", p)}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.item.frequency"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.frequency : ""}
              onChange={(p) => this.updateAttribute("frequency", p)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.item.package"
              readOnly={readOnly}
              value={edited && edited.package ? edited.package : ""}
              onChange={(pkg) => this.updateAttributes({ "package": pkg })}
            />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <NumberInput
              min={0}
              module="admin"
              label="medical.item.quantity"
              name="quantity"
              readOnly={readOnly}
              value={edited && edited.quantity ? edited.quantity : ""}
              onChange={(quantity) => this.updateAttributes({ quantity })}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <AmountInput
              module="admin"
              label="medical.item.price"
              required
              name="price"
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
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.careType : ""}
              onChange={(p) => this.updateAttribute("careType", p)}
            />
          </Grid>
          <Grid item className={classes.item}>
            <PublishedComponent
              pubRef="medical.PatientCategoryPicker"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.patientCategory : ""}
              onChange={(p) => this.updateAttribute("patientCategory", p)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(MedicalItemMasterPanel))))),
);
