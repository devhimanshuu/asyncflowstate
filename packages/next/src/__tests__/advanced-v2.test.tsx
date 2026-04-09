import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { useServerActionFlow } from "../hooks/useServerActionFlow";
import "@testing-library/jest-dom";

describe("useServerActionFlow Advanced Features (v2.0.0)", () => {
  it("should support Purgatory and triggerUndo", async () => {
    const action = vi.fn().mockResolvedValue("success");

    function TestComponent() {
      const { loading, triggerUndo, execute } = useServerActionFlow(action, {
        purgatory: { duration: 100 },
      });
      return (
        <div>
          <span data-testid="loading">{loading ? "yes" : "no"}</span>
          <button onClick={() => execute()} data-testid="run">
            Run
          </button>
          <button onClick={() => triggerUndo()} data-testid="undo">
            Undo
          </button>
        </div>
      );
    }

    render(<TestComponent />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("run"));
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("yes");
    expect(action).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByTestId("undo"));
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("no");
    expect(action).not.toHaveBeenCalled();
  });

  it("should support worker() offloading surface", async () => {
    const action = vi.fn().mockResolvedValue("done");

    function TestComponent() {
      const { worker, data } = useServerActionFlow(action);
      return (
        <div>
          <span data-testid="data">{data || "null"}</span>
          <button onClick={() => worker("arg")} data-testid="btn">
            Worker
          </button>
        </div>
      );
    }

    render(<TestComponent />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent("done");
    });
    expect(action).toHaveBeenCalledWith("arg");
  });
});
