import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/auth.store";
import { useRole } from "@/hooks/use-role";
import { renderHook } from "@testing-library/react";

describe("useRole", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it("should return null role when no user", () => {
    const { result } = renderHook(() => useRole());

    expect(result.current.role).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isOperator).toBe(false);
  });

  it("should return isAdmin true for ADMIN user", () => {
    useAuthStore.setState({
      user: {
        id: "1",
        name: "Admin User",
        email: "admin@test.com",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      },
      token: "test-token",
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.role).toBe("ADMIN");
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isOperator).toBe(false);
  });

  it("should return isOperator true for OPERATOR user", () => {
    useAuthStore.setState({
      user: {
        id: "2",
        name: "Operator User",
        email: "operator@test.com",
        role: "OPERATOR",
        createdAt: new Date().toISOString(),
      },
      token: "test-token",
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.role).toBe("OPERATOR");
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isOperator).toBe(true);
  });
});
