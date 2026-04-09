import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useFlow } from "../hooks/useFlow";
import "@testing-library/jest-dom";

describe("useFlow Advanced Features (v2.0.0)", () => {

  it("should expose triggerUndo and handle Purgatory", async () => {
    const action = vi.fn().mockResolvedValue("success");
    
    function TestComponent() {
      const { loading, triggerUndo, execute } = useFlow(action, {
        purgatory: { duration: 100 }
      });
      return (
        <div>
          <span data-testid="loading">{loading ? "yes" : "no"}</span>
          <button onClick={() => execute()} data-testid="run">Run</button>
          <button onClick={() => triggerUndo()} data-testid="undo">Undo</button>
        </div>
      );
    }

    render(<TestComponent />);
    
    // Act is important for hook state updates
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

  it("should expose worker() and offload execution", async () => {
    const action = vi.fn().mockResolvedValue("worker result");
    
    function TestComponent() {
      const { worker, data } = useFlow(action);
      return (
        <div>
          <span data-testid="data">{data || "null"}</span>
          <button onClick={() => worker("arg")} data-testid="worker-btn">Worker</button>
        </div>
      );
    }

    render(<TestComponent />);
    
    // In JSDOM, Worker might not work as expected, so core falls back to execute.
    // We wrap in act and await the click.
    await act(async () => {
      fireEvent.click(screen.getByTestId("worker-btn"));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId("data")).toHaveTextContent("worker result");
    });
    expect(action).toHaveBeenCalledWith("arg");
  });

  it("should provide rollbackDiff on failure", async () => {
    const action = vi.fn().mockRejectedValue(new Error("fail"));
    
    function TestComponent() {
      const { rollbackDiff, execute } = useFlow(action, {
        optimisticResult: { title: "New" }
      });
      return (
        <div>
          <span data-testid="diff">{rollbackDiff && rollbackDiff.length > 0 ? "has-diff" : "no-diff"}</span>
          <button onClick={() => execute()} data-testid="btn">Run</button>
        </div>
      );
    }

    render(<TestComponent />);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId("btn"));
    });

    // Rollback is async because of diff-utils dynamic import
    await waitFor(() => {
      expect(screen.getByTestId("diff")).toHaveTextContent("has-diff");
    }, { timeout: 2000 });
  });

  it("should prefetch on hover if configured", async () => {
    const action = vi.fn().mockResolvedValue("prefetched");
    
    function TestComponent() {
      const { button } = useFlow(action, {
        predictive: { prefetchOnHover: true }
      });
      return <button {...button({ "data-testid": "btn" })}>Hover Me</button>;
    }

    render(<TestComponent />);
    const btn = screen.getByTestId("btn");
    
    await act(async () => {
      fireEvent.mouseEnter(btn);
    });
    
    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
  });
});
