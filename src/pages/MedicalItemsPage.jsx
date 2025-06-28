import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { RIGHT_MEDICALITEMS_ADD, ITEMS_MODULE_NAME} from "../constants";
import {
  formatMessage,
  formatMessageWithValues,
  Helmet,
  historyPush,
  withHistory,
  withModulesManager,
  withTooltip,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import MedicalItemSearcher from "../components/MedicalItemSearcher";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class MedicalItemsPage extends Component {
  onDoubleClick = (ms, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalItemOverview", [ms.uuid], newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalItemNew");
  };

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== ITEMS_MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { classes, rights, intl } = this.props;
    return (
      <div className={classes.page}>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.item", "itemsTitle")} />
        <MedicalItemSearcher cacheFiltersKey="medicalItemsPageFiltersCache" onDoubleClick={this.onDoubleClick} />
        {rights.includes(RIGHT_MEDICALITEMS_ADD) &&
          withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, "medical.medicalItem", "medical.addNewMedicalItem.tooltip"),
          )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default injectIntl(
  withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(MedicalItemsPage)))),
  ),
);
