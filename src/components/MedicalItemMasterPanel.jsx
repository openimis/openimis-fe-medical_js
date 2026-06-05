import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { styled } from "@mui/material/styles";
import { Grid } from "@mui/material";

import {
  AmountInput,
  FormPanel,
  NumberInput,
  PublishedComponent,
  TextInput,
  ValidatedTextInput,
  withHistory,
  withModulesManager,
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
        <Grid container className="item">
          <Grid size={2} className="item">
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
          <Grid size={10} className="item">
            <TextInput
              module="admin"
              label="medical.item.name"
              required
              readOnly={readOnly}
              value={edited && edited.name ? edited.name : ""}
              onChange={(name) => this.updateAttributes({ name })}
            />
          </Grid>
          <Grid size={2} className="item">
            <PublishedComponent
              pubRef="medical.ItemTypePicker"
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.type : ""}
              onChange={(p) => this.updateAttribute("type", p)}
            />
          </Grid>
          <Grid size={2} className="item">
            <TextInput
              module="admin"
              label="medical.item.frequency"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.frequency : ""}
              onChange={(p) => this.updateAttribute("frequency", p)}
            />
          </Grid>
          <Grid size={3} className="item">
            <TextInput
              module="admin"
              label="medical.item.package"
              readOnly={readOnly}
              value={edited && edited.package ? edited.package : ""}
              onChange={(pkg) => this.updateAttributes({ "package": pkg })}
            />
          </Grid>
          <Grid size={2} className="item">
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
          <Grid size={2} className="item">
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
          <Grid size={3} className="item">
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
        <Grid container className="item">
          <Grid size={4} className="item">
            <PublishedComponent
              pubRef="medical.CareTypePicker"
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.careType : ""}
              onChange={(p) => this.updateAttribute("careType", p)}
            />
          </Grid>
          <Grid className="item">
            <PublishedComponent
              pubRef="medical.PatientCategoryPicker"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.patientCategory : ""}
              onChange={(p) => this.updateAttribute("patientCategory", p)}
            />
          </Grid>
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
