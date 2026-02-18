import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { FlowNotificationProvider } from "../components/FlowNotificationProvider";
import { Flow } from "@asyncflowstate/core";

describe("FlowNotificationProvider", () => {
    it("should catch success and error events globally", async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        render(
            <FlowNotificationProvider onSuccess={onSuccess} onError={onError}>
                <div>Test</div>
            </FlowNotificationProvider>
        );

        const flowSucceed = new Flow(async () => "ok", { debugName: "Succeed" });
        const flowFail = new Flow(async () => { throw new Error("fail") }, { debugName: "Fail" });

        await act(async () => {
            await flowSucceed.execute();
        });

        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
            flowName: "Succeed",
            type: "success"
        }));

        await act(async () => {
            await flowFail.execute();
        });

        expect(onError).toHaveBeenCalledWith(expect.objectContaining({
            flowName: "Fail",
            type: "error"
        }));
    });
});
