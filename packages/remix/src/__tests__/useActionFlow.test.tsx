import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActionFlow } from "../hooks/useActionFlow";
// Use hoisted to share mocks between test and module factory
const { mockSubmit } = vi.hoisted(() => ({
  mockSubmit: vi.fn(),
}));

// Mock Remix
vi.mock("@remix-run/react", () => ({
  useSubmit: () => mockSubmit,
  useNavigation: () => ({ state: "idle" }),
  useActionData: () => null,
}));

// Mock @asyncflowstate/react
vi.mock("@asyncflowstate/react", () => ({
  useFlow: vi.fn((action) => ({
    status: "idle",
    data: null,
    error: null,
    execute: action,
  })),
}));

describe("useActionFlow", () => {
  it("should initialize and provide Remix navigation state", () => {
    const { result } = renderHook(() => useActionFlow());

    expect(result.current.status).toBe("idle");
    expect(result.current.navigation.state).toBe("idle");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should trigger submit when executed", async () => {
    const { result } = renderHook(() => useActionFlow());

    await act(async () => {
      await result.current.execute({ formData: "data" });
    });

    expect(mockSubmit).toHaveBeenCalled();
    expect(mockSubmit.mock.calls[0][0]).toEqual({ formData: "data" });
  });
});
