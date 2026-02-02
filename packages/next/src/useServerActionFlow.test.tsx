import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useServerActionFlow } from "./useServerActionFlow";
import "@testing-library/jest-dom";

describe("useServerActionFlow", () => {
    it("should handle server actions correctly", async () => {
        const serverAction = vi.fn().mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 50));
            return { success: true, id: 123 };
        });

        function TestComponent() {
            const { execute, status, loading, data } = useServerActionFlow(serverAction);

            return (
                <div>
                    <span data-testid="status">{status}</span>
                    <span data-testid="loading">{loading ? "yes" : "no"}</span>
                    <span data-testid="data">{data ? data.id : "none"}</span>
                    <button onClick={() => execute()} data-testid="submit-btn">Submit</button>
                </div>
            );
        }

        render(<TestComponent />);

        const btn = screen.getByTestId("submit-btn");
        expect(screen.getByTestId("status")).toHaveTextContent("idle");

        fireEvent.click(btn);

        expect(screen.getByTestId("status")).toHaveTextContent("loading");
        expect(screen.getByTestId("loading")).toHaveTextContent("yes");

        await waitFor(() => {
            expect(screen.getByTestId("status")).toHaveTextContent("success");
        });

        expect(screen.getByTestId("data")).toHaveTextContent("123");
        expect(serverAction).toHaveBeenCalled();
    });

    it("should provide access to core flow options", async () => {
        const serverAction = vi.fn().mockResolvedValue("done");
        const onSuccess = vi.fn();

        function TestComponent() {
            const { execute } = useServerActionFlow(serverAction, { onSuccess });
            return <button onClick={() => execute()} data-testid="btn">Run</button>;
        }

        render(<TestComponent />);
        fireEvent.click(screen.getByTestId("btn"));

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith("done");
        });
    });

    it("should handle server action errors", async () => {
        const errorAction = vi.fn().mockRejectedValue(new Error("Server error"));

        function TestComponent() {
            const { execute, status, error } = useServerActionFlow(errorAction);
            return (
                <div>
                    <span data-testid="status">{status}</span>
                    <span data-testid="error">{error ? error.message : "none"}</span>
                    <button onClick={() => execute()} data-testid="btn">Fail</button>
                </div>
            );
        }

        render(<TestComponent />);
        fireEvent.click(screen.getByTestId("btn"));

        await waitFor(() => {
            expect(screen.getByTestId("status")).toHaveTextContent("error");
        });
        expect(screen.getByTestId("error")).toHaveTextContent("Server error");
    });
});
