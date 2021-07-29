import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import {
  withModulesManager,
  decodeId,
  PublishedComponent,
  ControlledField,
  TextInput,
  formatMessage,
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
  state = {
    showHistory: false,
    currentUserType: undefined,
    currentUserRoles: undefined,
    locationFilters: {},
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.filters.showHistory !== this.props.filters.showHistory &&
      !!this.props.filters.showHistory &&
      this.state.showHistory !== this.props.filters.showHistory.value
    ) {
      this.setState((state, props) => ({
        showHistory: props.filters.showHistory.value,
      }));
    }
  }

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-admin", "debounceTime", 800),
  );

  filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  onChangeShowHistory = () => {
    const filters = [
      {
        id: "showHistory",
        value: !this.state.showHistory,
        filter: `showHistory: ${!this.state.showHistory}`,
      },
    ];
    this.props.onChangeFilters(filters);
    this.setState((state) => ({
      showHistory: !state.showHistory,
    }));
  };

  onChangeUserTypes = (currentUserType) => {
    const { onChangeFilters } = this.props;
    this.setState({ currentUserType });
    onChangeFilters([
      {
        id: "userTypes",
        value: currentUserType,
        filter: currentUserType ? `userTypes: [${currentUserType}]` : null,
      },
    ]);
  };

  render() {
    const { classes, onChangeFilters, intl } = this.props;
    const { locationFilters, currentMedicalServiceType, currentMedicalServiceRoles } = this.state;
    return (
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
                  value={this.filterValue("code")}
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
                  value={this.filterValue("name")}
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
                    //label="ServiceType"
                    value={this.filterValue("type")}
                    onChange={(v) =>
                    this.debouncedOnChangeFilter([
                      {
                        id: "type",
                        value: v,
                        filter: `type: "${v}"`,
                      },
                    ])}
                />
              </Grid>
            }
          />
        </Grid>
        <Grid container justify="flex-end">
          <ControlledField
            module="admin"
            id="UserFilter.showHistory"
            field={
              <Grid item xs={2} className={classes.item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={this.state.showHistory}
                      onChange={(e) => this.onChangeShowHistory()}
                    />
                  }
                  label={formatMessage(intl, "admin", "showHistory")}
                />
              </Grid>
            }
          />
        </Grid>
      </section>
    );
  }
}

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(MedicalServiceFilter))),
);