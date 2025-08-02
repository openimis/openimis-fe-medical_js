import React, { Component } from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Grid, FormControlLabel, Checkbox } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  withModulesManager,
  PublishedComponent,
  ControlledField,
  TextInput,
  formatMessage,
  ErrorBoundary,
} from "@openimis/fe-core";

const StyledMedicalItemFilter = styled('div')(({ theme }) => ({
  '& .dialogTitle': theme.dialog.title,
  '& .dialogContent': theme.dialog.content,
  '& .form': {
    padding: "0 0 10px 0",
    width: "100%",
  },
  '& .item': {
    padding: theme.spacing(1),
  },
  '& .paperDivider': theme.paper.divider,
}));

class MedicalItemFilter extends Component {
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
    const { intl } = this.props;
    return (
      <StyledMedicalItemFilter>
        <ErrorBoundary>
          <section className="form">
            <Grid container>
              <ControlledField
                module="admin"
                id="medicalItemFilter.code"
                field={
                  <Grid item xs={3} className="item">
                    <TextInput
                      module="medicalItem"
                      label="medical.item.code"
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
                id="medicalItemFilter.name"
                field={
                  <Grid item xs={3} className="item">
                    <TextInput
                      module="medicalItem"
                      label="medical.item.name"
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
                id="medicalItemFilter.type"
                field={
                  <Grid item xs={3} className="item">
                    <PublishedComponent
                      pubRef="medical.ItemTypePicker"
                      module="medical"
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
                  <Grid item xs={3} className="item">
                    <TextInput
                      module="medicalItem"
                      label="medical.item.package"
                      name="package"
                      value={this.filterTextFieldValue("package")}
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
                  <Grid item xs={2} className="item">
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
      </StyledMedicalItemFilter>
    );
  }
}

export default withModulesManager(injectIntl(MedicalItemFilter));
