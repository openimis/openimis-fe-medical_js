import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";

import { FormattedMessage } from "@openimis/fe-core";

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

class DeleteMedicalItemOrServiceDialog extends Component {
  render() {
    const { classes, medicalItem, medicalService, onCancel, onConfirm } = this.props;
    const item_or_service = !!medicalItem ? "item" : "service";
    return (
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
          <Button onClick={(e) => onConfirm()} className={classes.primaryButton} autoFocus>
            <FormattedMessage module="admin" id={`medical.${item_or_service}.deleteDialog.yes.button`} />
          </Button>
          <Button onClick={onCancel} className={classes.secondaryButton}>
            <FormattedMessage module="core" id="cancel" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(DeleteMedicalItemOrServiceDialog)));
