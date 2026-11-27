import React from "react";
import MedicalChildPanel, { StyledMedicalChildPanel } from "./MedicalChildPanel";

// The services of a package service: each line holds the picked service.
const MedicalServiceChildPanel = (props) => (
  <MedicalChildPanel {...props} editedKey="serviceserviceSet" valueKey="service" />
);

export { StyledMedicalChildPanel as StyledMedicalServiceChildPanel };
export default MedicalServiceChildPanel;
