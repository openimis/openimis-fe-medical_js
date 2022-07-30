import React from "react";
import { withStyles, withTheme } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Grid } from "@material-ui/core";
import {
  AmountInput,
  FormPanel,
  PublishedComponent,
  TextInput,
  withHistory,
  withModulesManager,
  ErrorBoundary,
  formatMessage
} from "@openimis/fe-core";

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

class MedicalServiceMasterPanel extends FormPanel {

  constructor(props) {
    super(props);

    this.state = {
      readOnlyPrice : false,
    }
  }

  showCheckboxManual= (pSelection) => {
    console.log(this.state);
    console.log(this.props);
    console.log("PriceTotal");
    console.log(this.props.priceTotal);
    if(pSelection!=null && pSelection!="S"){
      this.showManual = true;
      this.setState(
        {
          readOnlyPrice : true
        }
      );
    }else{
      this.showManual = false;
      this.setState(
        {
          readOnlyPrice : false
        }
      );
    }
  };



  changeManual =  () => {
    this.setState(
      {
        readOnlyPrice : !this.state.readOnlyPrice,
      }
    );
  };

  render() {
    const { classes, edited, readOnly, intl } = this.props;
    return (
      <ErrorBoundary>
        <Grid container className={classes.item}>
          <Grid item xs={2} className={classes.item}>
            <TextInput
              module="admin"
              required
              label="medical.service.code"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.code : ""}
              onChange={(p) => this.updateAttribute("code", p)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.service.name"
              required
              readOnly={readOnly}
              value={edited && edited.name ? edited.name : ""}
              onChange={(name) => this.updateAttributes({ name })}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceTypePPPicker"
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.typepp : ""}
              onChange={(p) => {
                this.updateAttribute("typePP", p);
                this.showCheckboxManual(p);
              }}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceTypePicker"
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.type : ""}
              onChange={(p) => this.updateAttribute("type", p)}
            />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceCategoryPicker"
              withNull={true}
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.category : null}
              onChange={(p) => this.updateAttribute("category", p)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ServiceLevelPicker"
              withNull={true}
              required
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.level : ""}
              onChange={(p) => this.updateAttribute("level", p)}
            />
          </Grid>
          {this.showManual && <Grid item xs={2} className={classes.item}>
            <PublishedComponent
              pubRef="medical.ManualPricePicker"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.manualPrice : ""}
              onChange={(p) => this.updateAttribute("manualPrice", p)}
            />
          </Grid>
          }
          <Grid item xs={3} className={classes.item}>
            <AmountInput
              module="admin"
              label="medical.service.price"
              required={!this.state.readOnlyrice}
              name="price"
              readOnly={Boolean(edited.id) || readOnly || this.state.readOnlyPrice}
              value={this.props.priceTotal}
              onChange={(p) => {
                this.updateAttribute("price", p);
              }
              }
            />
          </Grid>
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.CareTypePicker"
              required
              withNull={true}
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.careType : ""}
              onChange={(p) => this.updateAttribute("careType", p)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <TextInput
              module="admin"
              label="medical.service.frequency"
              readOnly={Boolean(edited.id) || readOnly}
              value={edited ? edited.frequency : ""}
              onChange={(p) => this.updateAttribute("frequency", p)}
            />
          </Grid>
          <Grid item xs={4} className={classes.item}>
            <PublishedComponent
              pubRef="medical.PatientCategoryPicker"
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
  state
});

export default injectIntl(
  withModulesManager(withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(MedicalServiceMasterPanel))))),
);
