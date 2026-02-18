import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { useServerActionFlow } from "../hooks/useServerActionFlow";
import { FlowProvider } from "@asyncflowstate/react";

describe("useServerActionFlow Persistence", () => {
    const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
    };

    beforeEach(() => {
        vi.stubGlobal("localStorage", mockStorage);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function TestComponent({ action, options }: any) {
        const flow = useServerActionFlow(action, options);
        return (
            <div>
                <div data-testid="status">{flow.status}</div>
                <div data-testid="data">{JSON.stringify(flow.data)}</div>
                <button data-testid="execute" onClick={() => flow.execute()}>Execute</button>
            </div>
        );
    }

    it("should support persistence in server action flow", async () => {
        const action = vi.fn().mockResolvedValue({ result: "next-ok" });

        render(
            <FlowProvider>
                <TestComponent action={action} options={{ persist: { key: "next-flow" } }} />
            </FlowProvider>
        );

        await act(async () => {
            screen.getByTestId("execute").click();
        });

        await waitFor(() => {
            expect(screen.getByTestId("status").textContent).toBe("success");
        });

        // Wait for async persistence
        await act(async () => {
            await new Promise(r => setTimeout(r, 100));
        });

        expect(mockStorage.setItem).toHaveBeenCalledWith(
            "next-flow",
            expect.stringContaining('"status":"success"')
        );
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            "next-flow",
            expect.stringContaining('"data":{"result":"next-ok"}')
        );
    });
});
