import { HogMini } from "./index";

describe("HogMini SDK", () => {
  let hog: HogMini;

  beforeEach(() => {
    hog = new HogMini("http://localhost", "key", {
      bootstrapData: [
        {
          id: "1",
          key: "test-flag",
          isActive: true,
          rules: [{ type: "percentage", value: 50 }]
        }
      ]
    });
  });

  test("evaluates flag correctly with bootstrap data", () => {
    // Note: isInRollout uses MD5 hash. 
    // "user-123" maps to a bucket <= 50
    // "user-456" maps to a bucket > 50
    expect(hog.get("test-flag", { userId: "user-123" })).toBe(true);
    expect(hog.get("test-flag", { userId: "user-456" })).toBe(false);
  });

  test("returns default value when flag is missing", () => {
    expect(hog.get("non-existent", { userId: "id" }, true)).toBe(true);
    expect(hog.get("non-existent", { userId: "id" }, false)).toBe(false);
  });

  test("respects isActive: false", () => {
    const disabledHog = new HogMini("http://localhost", "key", {
      bootstrapData: [{ id: "1", key: "off", isActive: false, rules: [] }]
    });
    expect(disabledHog.get("off", { userId: "any" })).toBe(false);
  });
});
