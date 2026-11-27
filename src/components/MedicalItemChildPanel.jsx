import React from "react";
import MedicalChildPanel, { StyledMedicalChildPanel } from "./MedicalChildPanel";

// The items of a package service: each line holds the picked item.
const MedicalItemChildPanel = (props) => <MedicalChildPanel {...props} editedKey="servicesLinked" valueKey="item" />;

export { StyledMedicalChildPanel as StyledMedicalItemChildPanel };
export default MedicalItemChildPanel;
