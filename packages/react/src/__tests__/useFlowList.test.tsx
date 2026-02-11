import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlowList } from "./useFlowList";
import { FlowProvider } from "./FlowProvider";

describe("useFlowList", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FlowProvider>{children}</FlowProvider>
    );

    it("should manage multiple independent flows", async () => {
        vi.useFakeTimers();
        const action = vi.fn().mockImplementation(async (val: string) => {
            await new Promise(r => setTimeout(r, val === "data-a" ? 100 : 500));
            return val;
        });
        const { result } = renderHook(() => useFlowList(action), { wrapper });

        // Execute flow A
        act(() => {
            result.current.execute("flow-a", "data-a");
        });

        expect(result.current.getStatus("flow-a").status).toBe("loading");
        expect(result.current.isAnyLoading).toBe(true);

        // Execute flow B
        act(() => {
            result.current.execute("flow-b", "data-b");
        });

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current.getStatus("flow-a").status).toBe("success");
        expect(result.current.getStatus("flow-a").data).toBe("data-a");
        expect(result.current.getStatus("flow-b").status).toBe("loading");

        vi.useRealTimers();
    });
});
