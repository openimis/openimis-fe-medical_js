import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { styled } from "@mui/material/styles";

import {
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  ErrorBoundary,
  Helmet,
} from "@openimis/fe-core";
import MedicalItemForm from "../components/MedicalItemForm";
import { createMedicalItem, updateMedicalItem } from "../actions";
import { RIGHT_MEDICALITEMS_ADD, RIGHT_MEDICALITEMS_EDIT } from "../constants";

const StyledMedicalItemPage = styled('div')(({ theme }) => ({
  ...theme.page ?? {},
}));

class MedicalItemPage extends Component {
  add = () => {
    historyPush(this.props.modulesManager, this.props.history, "medical.medicalItemNew");
  };

  save = (medicalItem) => {
    if (!medicalItem.uuid) {
      this.props.createMedicalItem(
        this.props.modulesManager,
        medicalItem,
        formatMessageWithValues(this.props.intl, "medical.item", "createMedicalItem.mutationLabel"),
      );
    } else {
      this.props.updateMedicalItem(
        this.props.modulesManager,
        medicalItem,
        formatMessageWithValues(this.props.intl, "medical.item", "updateMedicalItem.mutationLabel"),
      );
    }
  };

  render() {
    const { rights, medicalItemId, overview, modulesManager, history } = this.props;
    if (!rights.includes(RIGHT_MEDICALITEMS_EDIT)) return null;
    return (
      <StyledMedicalItemPage>
        <Helmet title={formatMessageWithValues(this.props.intl, "medical.item", "itemTitle")} />
        <ErrorBoundary>
          <MedicalItemForm
            overview={overview}
            medicalItemId={medicalItemId}
            back={(e) => historyPush(modulesManager, history, "medical.medicalItems")}
            add={rights.includes(RIGHT_MEDICALITEMS_ADD) ? this.add : null}
            save={rights.includes(RIGHT_MEDICALITEMS_EDIT) ? this.save : null}
          />
        </ErrorBoundary>
      </StyledMedicalItemPage>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  userId: props.match.params.user_id,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createMedicalItem, updateMedicalItem }, dispatch);

export { StyledMedicalItemPage };
export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(injectIntl(MedicalItemPage)),
  ),
);
