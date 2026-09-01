import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { styled } from "@mui/material/styles";
import { Grid, Typography } from "@mui/material";

import {
  AmountInput,
  FormPanel,
  NumberInput,
  PublishedComponent,
  TextInput,
  ValidatedTextInput,
  withHistory,
  withModulesManager,
  FormattedMessage,
  GRID_RESPONSIVE_FULL,
  GRID_RESPONSIVE_LARGE,
  GRID_RESPONSIVE_HALF,
  GRID_RESPONSIVE_STANDARD,
  GRID_RESPONSIVE_SMALL
} from "@openimis/fe-core";
import { medicalItemsValidationCheck, medicalItemsValidationClear, medicalItemsSetValid } from "../actions";
import { ITEM_CODE_MAX_LENGTH } from "../constants";

const StyledMedicalItemMasterPanel = styled('div')(({ theme }) => ({
  '& .tableTitle': theme.table?.title ?? {},
  '& .item': theme.paper?.item ?? {},
  '& .fullHeight': {
    height: "100%",
  },
}));

class MedicalItemMasterPanel extends FormPanel {
  shouldValidate = (inputValue) => {
    const { savedItemCode } = this.props;
    const shouldValidate = inputValue !== savedItemCode;
    return shouldValidate;
  }
  render() {
    const { edited, readOnly, isItemValid, isItemValidating, itemValidationError } = this.props;
    return (
      <StyledMedicalItemMasterPanel>
        <Grid container direction="column" >
          <Typography className="item" fontWeight="bold">
            <FormattedMessage module="medical" id="section.information" />
          </Typography>
          <Grid container className="item" size={GRID_RESPONSIVE_FULL}>
            <Grid className="item">
              <ValidatedTextInput
                action={medicalItemsValidationCheck}
                clearAction={medicalItemsValidationClear}
                setValidAction={medicalItemsSetValid}
                itemQueryIdentifier="itemCode"
                isValid={isItemValid}
                isValidating={isItemValidating}
                validationError={itemValidationError}
                shouldValidate={this.shouldValidate}
                codeTakenLabel="medical.codeTaken"
                onChange={(code) => this.updateAttribute("code", code)}
                inputProps={{ maxLength: ITEM_CODE_MAX_LENGTH }}
                required={true}
                module="admin"
                label="medical.item.code"
                readOnly={readOnly}
                value={edited ? edited.code : ""}
              />
            </Grid>
            <Grid size={GRID_RESPONSIVE_HALF} className="item">
              <TextInput
                module="admin"
                label="medical.item.name"
                required
                readOnly={readOnly}
                value={edited && edited.name ? edited.name : ""}
                onChange={(name) => this.updateAttributes({ name })}
              />
            </Grid>
            <Grid size={GRID_RESPONSIVE_SMALL} className="item">
              <PublishedComponent
                pubRef="medical.ItemTypePicker"
                withNull={true}
                required
                readOnly={Boolean(edited.id) || readOnly}
                value={edited ? edited.type : ""}
                onChange={(p) => this.updateAttribute("type", p)}
              />
            </Grid>
            <Grid size={GRID_RESPONSIVE_SMALL} className="item">
              <PublishedComponent
                pubRef="medical.CareTypePicker"
                withNull={true}
                required
                readOnly={Boolean(edited.id) || readOnly}
                value={edited ? edited.careType : ""}
                onChange={(p) => this.updateAttribute("careType", p)}
              />
            </Grid>
            <Grid size={GRID_RESPONSIVE_STANDARD} className="item">
              <TextInput
                module="admin"
                label="medical.item.package"
                readOnly={readOnly}
                value={edited && edited.package ? edited.package : ""}
                onChange={(pkg) => this.updateAttributes({ "package": pkg })}
              />
            </Grid>

          </Grid>
          <Grid container direction="row">
            <Grid container className="item" direction="column" size={GRID_RESPONSIVE_HALF}>
              <Typography className="item" fontWeight="bold">
                <FormattedMessage module="medical" id="section.coverage" />
              </Typography>
              <Grid container>
                <Grid size={GRID_RESPONSIVE_LARGE} className="item">
                  <NumberInput
                    min={0}
                    module="admin"
                    label="medical.item.maximumAmount"
                    name="maximumAmount"
                    readOnly={readOnly}
                    value={edited?.maximumAmount ?? ""}
                    onChange={(maximumAmount) => this.updateAttributes({ maximumAmount })}
                  />
                </Grid>
                <Grid size={GRID_RESPONSIVE_LARGE} className="item">
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
                <Grid size={GRID_RESPONSIVE_LARGE} className="item">
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
                <Grid size={GRID_RESPONSIVE_LARGE} className="item">
                  <TextInput
                    module="admin"
                    label="medical.item.frequency"
                    readOnly={Boolean(edited.id) || readOnly}
                    value={edited ? edited.frequency : ""}
                    onChange={(p) => this.updateAttribute("frequency", p)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container className="item" direction="column" size={GRID_RESPONSIVE_HALF}>
              <Typography className="item" fontWeight="bold">
                <FormattedMessage module="medical" id="section.eligibility" />
              </Typography>
              <Grid container className="item">
                <PublishedComponent
                  pubRef="medical.PatientCategoryPicker"
                  readOnly={Boolean(edited.id) || readOnly}
                  value={edited ? edited.patientCategory : ""}
                  onChange={(p) => this.updateAttribute("patientCategory", p)}
                />
              </Grid>
            </Grid>
          </Grid>

        </Grid>

        <Grid container className="item" >








        </Grid>



      </StyledMedicalItemMasterPanel>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  isItemValid: state.medical?.validationFields?.medicalItem?.isValid,
  isItemValidating: state.medical?.validationFields?.medicalItem?.isValidating,
  itemValidationError: state.medical?.validationFields?.medicalItem?.validationError,
  savedItemCode: state.medical?.medicalItem?.code,
});

export { StyledMedicalItemMasterPanel };
export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps)(MedicalItemMasterPanel))),
);
