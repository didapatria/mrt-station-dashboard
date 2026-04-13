import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/store/auth.store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("should init from localStorage", () => {
    const user = {
      id: "1",
      name: "Test",
      email: "test@test.com",
      role: "ADMIN" as const,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify(user));

    useAuthStore.getState().initFromStorage();

    const state = useAuthStore.getState();
    expect(state.token).toBe("test-token");
    expect(state.user?.name).toBe("Test");
    expect(state.user?.role).toBe("ADMIN");
  });

  it("should handle invalid JSON in localStorage", () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", "invalid-json");

    useAuthStore.getState().initFromStorage();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should logout and clear storage", () => {
    useAuthStore.setState({
      user: {
        id: "1",
        name: "Test",
        email: "test@test.com",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      },
      token: "test-token",
    });
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", "{}");

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("should clear error", () => {
    useAuthStore.setState({ error: "Some error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
