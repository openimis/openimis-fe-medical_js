import React from "react";
import MedicalChildPanel from "./MedicalChildPanel";

// The services of a package service: each line holds the picked service.
const MedicalServiceChildPanel = (props) => (
  <MedicalChildPanel {...props} editedKey="serviceserviceSet" valueKey="service" />
);

export { StyledMedicalChildPanel as StyledMedicalServiceChildPanel } from "./MedicalChildPanel";
export default MedicalServiceChildPanel;
