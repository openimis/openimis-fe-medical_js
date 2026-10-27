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
  medicalItemsValidationCheck: vi.fn(),
  medicalItemsValidationClear: vi.fn(),
  medicalItemsSetValid: vi.fn(),
}));

import MedicalItemMasterPanel from "./MedicalItemMasterPanel";

const CLASSIFICATION = ["medical.ItemTypePicker", "medical.CareTypePicker"];

const renderPanel = (edited, readOnly = false) =>
  render(<MedicalItemMasterPanel edited={edited} readOnly={readOnly} />);

describe("MedicalItemMasterPanel", () => {
  // OP-3291: the full projection fetches uuid and never id
  it("locks the classification of a saved item", () => {
    renderPanel({ uuid: "x", code: "I1", type: "D", careType: "B" });
    CLASSIFICATION.forEach((picker) => expect(screen.getByLabelText(picker)).toHaveAttribute("readonly"));
  });

  it("keeps the price and frequency of a saved item editable", () => {
    renderPanel({ uuid: "x", code: "I1", type: "D", careType: "B" });
    ["medical.item.name", "medical.item.price", "medical.item.frequency"].forEach((label) =>
      expect(screen.getByLabelText(label)).not.toHaveAttribute("readonly"),
    );
  });

  it("lets a new item be classified", () => {
    renderPanel({});
    CLASSIFICATION.forEach((picker) => expect(screen.getByLabelText(picker)).not.toHaveAttribute("readonly"));
  });

  it("locks the classification when the form is read-only", () => {
    renderPanel({}, true);
    CLASSIFICATION.forEach((picker) => expect(screen.getByLabelText(picker)).toHaveAttribute("readonly"));
  });
});
