import { describe, expect, it } from "vitest";

import { validateCategories } from "./utils";

describe("validateCategories", () => {
  it.each([
    ["everyone", 15],
    ["adult men", 1 | 4],
    ["minor women", 2 | 8],
    ["both genders, adults only", 1 | 2 | 4],
  ])("accepts %s", (_label, patientCategory) => {
    expect(validateCategories(patientCategory)).toBe(true);
  });

  it.each([
    ["no category", 0],
    ["a gender without an age group", 1 | 2],
    ["an age group without a gender", 4 | 8],
    ["a single gender", 2],
    ["a missing value", undefined],
  ])("rejects %s", (_label, patientCategory) => {
    expect(validateCategories(patientCategory)).toBe(false);
  });
});
