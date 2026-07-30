import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import { FormattedMessage } from "@openimis/fe-core";

const StyledDeleteMedicalItemOrServiceDialog = styled('div')(({ theme }) => ({
  '& .primaryButton': theme.dialog?.primaryButton ?? {},
  '& .secondaryButton': theme.dialog?.secondaryButton ?? {},
}));

class DeleteMedicalItemOrServiceDialog extends Component {
  render() {
    const { medicalItem, medicalService, onCancel, onConfirm } = this.props;
    const item_or_service = !!medicalItem ? "item" : "service";
    return (
      <StyledDeleteMedicalItemOrServiceDialog>
        <Dialog open={!!medicalService || !!medicalItem} onClose={onCancel}>
          <DialogTitle>
            <FormattedMessage module="admin" id={`medical.${item_or_service}.deleteDialog.title`} />
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <FormattedMessage module="admin" id={`medical.${item_or_service}.deleteDialog.message`} />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={(e) => onConfirm()} className="primaryButton" autoFocus>
              <FormattedMessage module="admin" id={`medical.${item_or_service}.deleteDialog.yes.button`} />
            </Button>
            <Button onClick={onCancel} className="secondaryButton">
              <FormattedMessage module="core" id="cancel" />
            </Button>
          </DialogActions>
        </Dialog>
      </StyledDeleteMedicalItemOrServiceDialog>
    );
  }
}

export { StyledDeleteMedicalItemOrServiceDialog };
export default injectIntl(DeleteMedicalItemOrServiceDialog);
