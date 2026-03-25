import { clampAmount, formatCurrency, parseAmountInput } from "./money";

describe("money utils", () => {
  it("formats currency", () => {
    expect(formatCurrency(12.5).replace(/\s/g, " ")).toMatch(/12/);
  });

  it("clamps invalid amounts", () => {
    expect(clampAmount(-1)).toBe(0);
    expect(clampAmount(NaN)).toBe(0);
  });

  it("parses amount input", () => {
    expect(parseAmountInput("$1,234.50")).toBe(1234.5);
  });
});
