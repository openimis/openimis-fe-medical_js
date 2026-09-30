import React from "react";
import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/i18n")),
  ...(await vi.importActual("@openimis/fe-core/constants/responsiveGrid")),
}));

const { default: PatientCategoryPicker } = await import("./PatientCategoryPicker");
const { default: messages } = await import("../translations/en.json");
const { renderWithProviders, screen, userEvent } = await import("@openimis/fe-core/testing");

const renderPicker = (props = {}) => {
  const onChange = vi.fn();
  renderWithProviders(<PatientCategoryPicker value={0} onChange={onChange} {...props} />, { messages });
  return onChange;
};

const checked = () =>
  screen.getAllByRole("checkbox").filter((box) => box.checked).map((box) => box.closest("label").textContent);

describe("PatientCategoryPicker", () => {
  it("offers both genders and both age groups under their headings", () => {
    renderPicker();

    expect(screen.getByText("Gender Categories *")).toBeInTheDocument();
    expect(screen.getByText("Age Categories *")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox").map((box) => box.closest("label").textContent))
      .toEqual(["Male", "Female", "Adult", "Minor"]);
  });

  it.each([
    [15, ["Male", "Female", "Adult", "Minor"]],
    [1 | 8, ["Male", "Minor"]],
    [2 | 4, ["Female", "Adult"]],
    [0, []],
  ])("ticks the categories encoded in %i", (value, expected) => {
    renderPicker({ value });

    expect(checked()).toEqual(expected);
  });

  it("reports the combined mask when a category is added", async () => {
    const onChange = renderPicker({ value: 1 | 4 });

    await userEvent.click(screen.getByRole("checkbox", { name: "Minor" }));

    expect(onChange).toHaveBeenLastCalledWith(1 | 4 | 8);
    expect(checked()).toEqual(["Male", "Adult", "Minor"]);
  });

  it("reports the combined mask when a category is removed", async () => {
    const onChange = renderPicker({ value: 15 });

    await userEvent.click(screen.getByRole("checkbox", { name: "Female" }));

    expect(onChange).toHaveBeenLastCalledWith(1 | 4 | 8);
  });

  it("cannot be changed when read-only", () => {
    renderPicker({ value: 15, readOnly: true });

    screen.getAllByRole("checkbox").forEach((box) => expect(box).toBeDisabled());
  });
});
