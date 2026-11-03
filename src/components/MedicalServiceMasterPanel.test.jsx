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

// Every field of the panel, classification included.
const FIELDS = [
  "medical.service.code",
  "medical.service.name",
  "medical.ServiceTypePPPicker",
  "medical.ServiceTypePicker",
  "medical.ServiceCategoryPicker",
  "medical.ServiceLevelPicker",
  "medical.CareTypePicker",
  "medical.service.maximumAmount",
  "medical.ManualPricePicker",
  "medical.service.price",
  "medical.service.frequency",
  "medical.PatientCategoryPicker",
];

const SAVED = {
  uuid: "x",
  code: "S1",
  name: "Service",
  packagetype: "P",
  manualPrice: true,
  type: "P",
  category: "O",
  level: "S",
  careType: "B",
  price: 10,
  frequency: 1,
};

const renderPanel = (edited, readOnly = false) =>
  render(<MedicalServiceMasterPanel edited={edited} medicalService={edited} readOnly={readOnly} />);

describe("MedicalServiceMasterPanel", () => {
  // OP-3291: a saved service stays fully editable; only the readOnly prop locks the panel.
  it("keeps every field of a saved service editable", () => {
    renderPanel(SAVED);
    FIELDS.forEach((label) => expect(screen.getByLabelText(label)).not.toHaveAttribute("readonly"));
  });

  it("keeps every field of a new service editable", () => {
    renderPanel({ packagetype: "P", manualPrice: true });
    FIELDS.forEach((label) => expect(screen.getByLabelText(label)).not.toHaveAttribute("readonly"));
  });

  it("locks every field when the panel is read-only", () => {
    renderPanel(SAVED, true);
    FIELDS.forEach((label) => expect(screen.getByLabelText(label)).toHaveAttribute("readonly"));
  });
});
