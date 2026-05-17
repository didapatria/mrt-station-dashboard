import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", (false as boolean) && "hidden", "visible")).toBe(
      "base visible",
    );
  });

  it("should handle undefined and null", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });

  it("should merge tailwind conflicting classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("should merge tailwind with conditionals", () => {
    const isActive = true;
    expect(cn("text-sm", isActive && "text-primary")).toBe(
      "text-sm text-primary",
    );
  });
});
