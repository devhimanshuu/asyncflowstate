import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Flow } from "@asyncflowstate/core";
import { useFlowParallel } from "../hooks/useFlowParallel";

describe("useFlowParallel", () => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    it("should track loading state and results", async () => {
        const f1 = new Flow(async () => {
            await delay(20);
            return "a";
        });
        const f2 = new Flow(async () => {
            await delay(20);
            return "b";
        });

        const { result } = renderHook(() => useFlowParallel([f1, f2]));

        expect(result.current.status).toBe("idle");

        let promise: any;
        await act(async () => {
            promise = result.current.execute();
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await promise;
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.status).toBe("success");
        expect(result.current.results).toEqual(["a", "b"]);
    });
});
