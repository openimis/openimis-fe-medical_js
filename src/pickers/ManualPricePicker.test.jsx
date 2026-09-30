import React from "react";
import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/i18n"));

const { default: ManualPricePicker } = await import("./ManualPricePicker");
const { default: messages } = await import("../translations/en.json");
const { renderWithProviders, screen, userEvent } = await import("@openimis/fe-core/testing");

const renderPicker = (props = {}) => {
  const onChange = vi.fn();
  renderWithProviders(<ManualPricePicker value={false} onChange={onChange} {...props} />, { messages });
  return onChange;
};

describe("ManualPricePicker", () => {
  it.each([true, false])("shows manual price %s as given", (value) => {
    renderPicker({ value });

    expect(screen.getByRole("checkbox", { name: "Manual" }).checked).toBe(value);
  });

  it.each([
    [false, true],
    [true, false],
  ])("reports the opposite of %s when ticked", async (value, expected) => {
    const onChange = renderPicker({ value });

    await userEvent.click(screen.getByRole("checkbox", { name: "Manual" }));

    expect(onChange).toHaveBeenCalledWith(expected);
  });

  // Currently fails: the picker ignores its readOnly prop, so the service master panel
  // cannot lock it on an existing or historical service.
  it.fails("cannot be changed when read-only", () => {
    renderPicker({ value: false, readOnly: true });

    expect(screen.getByRole("checkbox", { name: "Manual" })).toBeDisabled();
  });
});
