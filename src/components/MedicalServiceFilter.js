import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import {
  withModulesManager,
  PublishedComponent,
  ControlledField,
  TextInput,
  formatMessage,
  ErrorBoundary,
} from "@openimis/fe-core";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: "0 0 10px 0",
    width: "100%",
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
});

class MedicalServiceFilter extends Component {
  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-admin", "debounceTime", 200),
  );

  filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  filterTextFieldValue = (key) => {
    const { filters } = this.props;
    return !!filters && !!filters[key] ? filters[key].value : "";
  };

  onChangeCheckbox = (key, value) => {
    let filters = [
      {
        id: key,
        value: value,
        filter: `${key}: ${value}`,
      },
    ];
    this.props.onChangeFilters(filters);
  };

  render() {
    const { classes, intl } = this.props;
    return (
      <ErrorBoundary>
        <section className={classes.form}>
          <Grid container>
            <ControlledField
              module="admin"
              id="medicalServiceFilter.code"
              field={
                <Grid item xs={3} className={classes.item}>
                  <TextInput
                    module="medicalService"
                    label="medical.service.code"
                    name="code"
                    value={this.filterTextFieldValue("code")}
                    onChange={(v) =>
                      this.debouncedOnChangeFilter([
                        {
                          id: "code",
                          value: v,
                          filter: `code_Icontains: "${v}"`,
                        },
                      ])
                    }
                  />
                </Grid>
              }
            />
            <ControlledField
              module="admin"
              id="medicalServiceFilter.name"
              field={
                <Grid item xs={3} className={classes.item}>
                  <TextInput
                    module="medicalService"
                    label="medical.service.name"
                    name="name"
                    value={this.filterTextFieldValue("name")}
                    onChange={(v) =>
                      this.debouncedOnChangeFilter([
                        {
                          id: "name",
                          value: v,
                          filter: `name_Icontains: "${v}"`,
                        },
                      ])
                    }
                  />
                </Grid>
              }
            />
            <ControlledField
              module="admin"
              id="medicalServiceFilter.type"
              field={
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="medical.ServiceTypePicker"
                    module="medical"
                    withNull="true"
                    nullLabel="medical.serviceType.any"
                    value={this.filterValue("type")}
                    onChange={(v) =>
                      this.debouncedOnChangeFilter([
                        {
                          id: "type",
                          value: v,
                          filter: `type: "${v}"`,
                        },
                      ])
                    }
                  />
                </Grid>
              }
            />
          </Grid>
          <Grid container justify="flex-end">
            <ControlledField
              module="admin"
              id="ServiceFilter.showHistory"
              field={
                <Grid item xs={2} className={classes.item}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={!!this.filterValue("showHistory")}
                        onChange={(event) => this.onChangeCheckbox("showHistory", event.target.checked)}
                      />
                    }
                    label={formatMessage(intl, "admin", "showHistory")}
                  />
                </Grid>
              }
            />
          </Grid>
        </section>
      </ErrorBoundary>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MedicalServiceFilter))));
