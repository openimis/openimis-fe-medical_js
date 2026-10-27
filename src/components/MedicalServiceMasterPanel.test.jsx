import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// The fe-core barrel cannot be loaded whole in a module test; the inputs are
// stubbed so that each one exposes the readOnly flag it receives.
vi.mock("@openimis/fe-core", async () => {
  const React = await import("react");
  class FormPanel extends React.Component {
    updateAttribute = () => {};
    updateAttributes = () => {};
  }
  const input = ({ label, readOnly }) => <input aria-label={label} readOnly={!!readOnly} />;
  return {
    FormPanel,
    ErrorBoundary: ({ children }) => children,
    AmountInput: input,
    NumberInput: input,
    TextInput: input,
    ValidatedTextInput: input,
    PublishedComponent: ({ pubRef, readOnly }) => <input aria-label={pubRef} readOnly={!!readOnly} />,
    FormattedMessage: ({ id }) => id,
    withHistory: (component) => component,
    withModulesManager: (component) => component,
    GRID_RESPONSIVE_FULL: { xs: 12 },
    GRID_RESPONSIVE_LARGE: { xs: 12 },
    GRID_RESPONSIVE_HALF: { xs: 12 },
    GRID_RESPONSIVE_STANDARD: { xs: 12 },
    GRID_RESPONSIVE_SMALL: { xs: 12 },
  };
});
vi.mock("react-redux", () => ({ connect: () => (component) => component }));
vi.mock("react-intl", () => ({ injectIntl: (component) => component }));
vi.mock("../actions", () => ({
  medicalServicesValidationCheck: vi.fn(),
  medicalServicesValidationClear: vi.fn(),
  medicalServicesSetValid: vi.fn(),
}));

import MedicalServiceMasterPanel from "./MedicalServiceMasterPanel";

const CLASSIFICATION = [
  "medical.ServiceTypePicker",
  "medical.ServiceCategoryPicker",
  "medical.ServiceLevelPicker",
  "medical.CareTypePicker",
];

const renderPanel = (edited, readOnly = false) =>
  render(<MedicalServiceMasterPanel edited={edited} medicalService={edited} readOnly={readOnly} />);

describe("MedicalServiceMasterPanel", () => {
  // OP-3291: the full projection fetches uuid and never id
  it("locks the classification of a saved service", () => {
    renderPanel({ uuid: "x", code: "S1", packagetype: "S", type: "P", category: "O", level: "S", careType: "B" });
    CLASSIFICATION.forEach((picker) => expect(screen.getByLabelText(picker)).toHaveAttribute("readonly"));
  });

  it("keeps the price and frequency of a saved service editable", () => {
    renderPanel({ uuid: "x", code: "S1", packagetype: "S", type: "P", category: "O", level: "S", careType: "B" });
    ["medical.service.name", "medical.service.price", "medical.service.frequency"].forEach((label) =>
      expect(screen.getByLabelText(label)).not.toHaveAttribute("readonly"),
    );
  });

  it("lets a new service be classified", () => {
    renderPanel({});
    CLASSIFICATION.forEach((picker) => expect(screen.getByLabelText(picker)).not.toHaveAttribute("readonly"));
  });

  it("locks the classification when the form is read-only", () => {
    renderPanel({}, true);
    CLASSIFICATION.forEach((picker) => expect(screen.getByLabelText(picker)).toHaveAttribute("readonly"));
  });
});
