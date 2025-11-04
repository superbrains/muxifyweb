import {
  formatPrice,
  formatNaira,
  formatPriceCompact,
  formatNairaCompact,
} from "../formatPrice";

describe("formatPrice utility", () => {
  describe("formatNaira", () => {
    it("should format numbers correctly", () => {
      expect(formatNaira(1000)).toBe("₦1,000");
      expect(formatNaira(50000)).toBe("₦50,000");
      expect(formatNaira(25550000)).toBe("₦25,550,000");
      expect(formatNaira(100000000)).toBe("₦100,000,000");
    });

    it("should handle string inputs", () => {
      expect(formatNaira("1000")).toBe("₦1,000");
      expect(formatNaira("50000")).toBe("₦50,000");
    });

    it("should handle decimal places", () => {
      expect(formatNaira(1000.5, { minimumFractionDigits: 2 })).toBe(
        "₦1,000.50"
      );
      expect(formatNaira(1000.5, { minimumFractionDigits: 2 })).toBe(
        "₦1,000.50"
      );
    });

    it("should handle compact format", () => {
      expect(formatNairaCompact(1000000)).toBe("₦1M");
      expect(formatNairaCompact(1000000000)).toBe("₦1B");
    });
  });

  describe("formatPrice with different currencies", () => {
    it("should format USD correctly", () => {
      expect(formatPrice(1000, { currency: "USD" })).toBe("$1,000.00");
      expect(formatPrice(50000, { currency: "USD" })).toBe("$50,000.00");
    });

    it("should format EUR correctly", () => {
      expect(formatPrice(1000, { currency: "EUR" })).toBe("€1,000.00");
      expect(formatPrice(50000, { currency: "EUR" })).toBe("€50,000.00");
    });
  });

  describe("edge cases", () => {
    it("should handle zero", () => {
      expect(formatNaira(0)).toBe("₦0");
    });

    it("should handle negative numbers", () => {
      expect(formatNaira(-1000)).toBe("₦-1,000");
    });

    it("should handle invalid inputs", () => {
      expect(formatNaira("invalid")).toBe("₦0");
      expect(formatNaira(NaN)).toBe("₦0");
    });

    it("should handle very large numbers", () => {
      expect(formatNaira(1000000000)).toBe("₦1,000,000,000");
    });
  });

  describe("options", () => {
    it("should hide symbol when showSymbol is false", () => {
      expect(formatNaira(1000, { showSymbol: false })).toBe("1,000");
    });

    it("should use custom locale", () => {
      expect(formatNaira(1000, { locale: "en-US" })).toBe("₦1,000");
    });
  });
});
