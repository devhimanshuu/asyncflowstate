import { describe, it, expect, vi } from "vitest";
import { Flow } from "./flow";
import { FlowParallel } from "./parallel";

describe("FlowParallel", () => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  it("should execute multiple flows in parallel and succeed", async () => {
    const f1 = new Flow(async () => {
      await delay(10);
      return 1;
    });
    const f2 = new Flow(async () => {
      await delay(20);
      return 2;
    });

    const parallel = new FlowParallel([f1, f2]);
    const results = await parallel.execute();

    expect(results).toEqual([1, 2]);
    expect(parallel.state.status).toBe("success");
    expect(parallel.state.progress).toBe(100);
  });

  it("should handle error in 'all' strategy", async () => {
    const f1 = new Flow(async () => {
      await delay(10);
      return 1;
    });
    const f2 = new Flow<number>(async () => {
      await delay(10);
      throw new Error("fail");
    });

    const parallel = new FlowParallel([f1, f2], "all");
    const results = await parallel.execute();

    expect(results).toBeUndefined();
    expect(parallel.state.status).toBe("error");
    expect((parallel.state.errors as any[])[1].message).toBe("fail");
  });

  it("should handle 'allSettled' strategy with mixed results", async () => {
    const f1 = new Flow(async () => {
      await delay(10);
      return 1;
    });
    const f2 = new Flow<number>(async () => {
      await delay(10);
      throw new Error("fail");
    });

    const parallel = new FlowParallel([f1, f2], "allSettled");
    const results = await parallel.execute();

    expect(parallel.state.status).toBe("error"); // allSettled still reflects error if any failed in my implementation logic for UI
    expect((parallel.state.results as any[])[0]).toBe(1);
    expect((parallel.state.errors as any[])[1].message).toBe("fail");
  });

  it("should support record/map input", async () => {
    const f1 = new Flow(async () => 1);
    const f2 = new Flow(async () => 2);

    const parallel = new FlowParallel({ a: f1, b: f2 });
    const results = await parallel.execute();

    expect(results).toEqual({ a: 1, b: 2 });
    expect(parallel.state.results).toEqual({ a: 1, b: 2 });
  });

  it("should track aggregate progress", async () => {
    const f1 = new Flow(async () => {
      f1.setProgress(50);
      await delay(20);
      return 1;
    });
    const f2 = new Flow(async () => {
      f2.setProgress(20);
      await delay(20);
      return 2;
    });

    const parallel = new FlowParallel([f1, f2]);
    const promise = parallel.execute();

    await delay(10);
    expect(parallel.state.progress).toBe(35); // (50 + 20) / 2

    await promise;
    expect(parallel.state.progress).toBe(100);
  });
});
