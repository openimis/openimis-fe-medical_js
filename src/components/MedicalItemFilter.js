import React, { Component } from "react";
import _debounce from "lodash/debounce";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
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

class MedicalItemFilter extends Component {
  state = {
    showHistory: false,
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

  render() {
    const { classes, intl } = this.props;
    return (
      <ErrorBoundary>
        <section className={classes.form}>
          <Grid container>
            <ControlledField
              module="admin"
              id="medicalItemFilter.code"
              field={
                <Grid item xs={3} className={classes.item}>
                  <TextInput
                    module="medicalItem"
                    label="medical.item.code"
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
              id="medicalItemFilter.name"
              field={
                <Grid item xs={3} className={classes.item}>
                  <TextInput
                    module="medicalItem"
                    label="medical.item.name"
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
              id="medicalItemFilter.type"
              field={
                <Grid item xs={3} className={classes.item}>
                  <PublishedComponent
                    pubRef="medical.ItemTypePicker"
                    module="medical"
                    //label="ItemType"
                    value={this.filterValue("type")}
                    withNull={true}
                    nullLabel="medical.itemType.any"
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
            <ControlledField
              module="admin"
              id="medicalItemFilter.package"
              field={
                <Grid item xs={3} className={classes.item}>
                  <TextInput
                    module="medicalItem"
                    label="medical.item.package"
                    name="package"
                    value={this.filterValue("package")}
                    onChange={(v) =>
                      this.debouncedOnChangeFilter([
                        {
                          id: "package",
                          value: v,
                          filter: `package_Icontains: "${v}"`,
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
              id="MedicalItemFilter.showHistory"
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
      </ErrorBoundary>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MedicalItemFilter))));
