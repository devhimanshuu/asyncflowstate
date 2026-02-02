import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useFlow } from "./useFlow";
import "@testing-library/jest-dom";

describe("useFlow Hook", () => {
  it("should manage basic loading/success states", async () => {
    const action = vi.fn().mockResolvedValue("success data");

    function TestComponent() {
      const { status, loading, data, execute } = useFlow(action);
      return (
        <div>
          <span data-testid="status">{status}</span>
          <span data-testid="loading">{loading ? "yes" : "no"}</span>
          <span data-testid="data">{data || "null"}</span>
          <button onClick={() => execute()} data-testid="btn">
            Run
          </button>
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByTestId("status")).toHaveTextContent("idle");
    expect(screen.getByTestId("loading")).toHaveTextContent("no");

    fireEvent.click(screen.getByTestId("btn"));

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    expect(screen.getByTestId("loading")).toHaveTextContent("yes");

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("success"),
    );
    expect(screen.getByTestId("data")).toHaveTextContent("success data");
    expect(screen.getByTestId("loading")).toHaveTextContent("no");
  });

  it("button() helper should provide loading props", () => {
    const action = vi.fn().mockResolvedValue("ok");

    function TestComponent() {
      const { button, execute } = useFlow(action);
      return <button {...button({ "data-testid": "btn" })}>Click</button>;
    }

    render(<TestComponent />);
    const btn = screen.getByTestId("btn");

    expect(btn).not.toBeDisabled();
    expect(btn).not.toHaveAttribute("aria-busy", "true");

    fireEvent.click(btn);

    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("form() helper should handle preventDefault and validation", async () => {
    const action = vi.fn().mockResolvedValue("ok");
    const validate = vi.fn().mockReturnValue({ email: "invalid" });

    function TestComponent() {
      const { form, fieldErrors } = useFlow(action);
      return (
        <form {...form({ validate, "data-testid": "form" })}>
          <input name="email" defaultValue="test@test.com" />
          {fieldErrors.email && (
            <span data-testid="error">{fieldErrors.email}</span>
          )}
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(<TestComponent />);

    fireEvent.submit(screen.getByTestId("form"));

    // Should NOT have called action because of validation
    expect(validate).toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("invalid"),
    );
  });

  it("form() helper should extract data with extractFormData: true", async () => {
    const action = vi.fn().mockResolvedValue("ok");

    function TestComponent() {
      const { form } = useFlow(action);
      return (
        <form {...form({ extractFormData: true, "data-testid": "form" })}>
          <input name="username" defaultValue="alice" />
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(<TestComponent />);
    fireEvent.submit(screen.getByTestId("form"));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith({ username: "alice" });
    });
  });

  it("should announce status via LiveRegion", async () => {
    const action = vi.fn().mockResolvedValue("done");

    function TestComponent() {
      const { execute, LiveRegion } = useFlow(action, {
        a11y: { announceSuccess: "Mission accomplished" },
      });
      return (
        <div>
          <button onClick={() => execute()}>Go</button>
          <LiveRegion />
        </div>
      );
    }

    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Mission accomplished")).toBeInTheDocument();
    });
  });

  it("should revalidate on focus", async () => {
    const action = vi.fn().mockResolvedValue("ok");
    const originalVisibility = Object.getOwnPropertyDescriptor(
      document,
      "visibilityState",
    );

    function TestComponent() {
      const { execute } = useFlow(action, { revalidateOnFocus: true });
      return <button onClick={() => execute("arg1")}>Run</button>;
    }

    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    // Mock visibilityState
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });

    fireEvent(document, new Event("visibilitychange"));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(2);
      expect(action).toHaveBeenLastCalledWith("arg1");
    });

    // Cleanup
    if (originalVisibility) {
      Object.defineProperty(document, "visibilityState", originalVisibility);
    }
  });
});
