import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFlowSequence } from "../hooks/useFlowSequence";
import { Flow } from "@asyncflowstate/core";

describe("useFlowSequence Hook", () => {
  it("should orchastrate sequence state in React", async () => {
    const flow1 = new Flow(async () => "step1");
    const flow2 = new Flow(async () => "step2");

    const steps = [
      { name: "S1", flow: flow1 },
      { name: "S2", flow: flow2 },
    ];

    const { result } = renderHook(() => useFlowSequence(steps));

    expect(result.current.status).toBe("idle");

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.status).toBe("success");
    expect(result.current.results).toEqual(["step1", "step2"]);
    expect(result.current.progress).toBe(100);
  });
});
