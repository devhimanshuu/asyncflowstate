import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import {
  FlowProvider,
  useFlowContext,
  mergeFlowOptions,
} from "../components/FlowProvider";
import { useFlow } from "../hooks/useFlow";

describe("FlowProvider", () => {
  it("should provide global configuration to child components", () => {
    const globalConfig = {
      retry: { maxAttempts: 3 },
      loading: { minDuration: 500 },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FlowProvider config={globalConfig}>{children}</FlowProvider>
    );

    const { result } = renderHook(() => useFlowContext(), { wrapper });

    expect(result.current).toEqual(globalConfig);
  });

  it("should return null when not within a FlowProvider", () => {
    const { result } = renderHook(() => useFlowContext());
    expect(result.current).toBeNull();
  });

  it("should merge global and local options correctly", () => {
    const globalConfig = {
      retry: { maxAttempts: 3, delay: 1000 },
      loading: { minDuration: 500 },
      onError: vi.fn(),
    };

    const localOptions = {
      retry: { maxAttempts: 5 }, // Override maxAttempts
      onSuccess: vi.fn(),
    };

    const merged = mergeFlowOptions(globalConfig, localOptions);

    expect(merged.retry).toEqual({
      maxAttempts: 5, // Local override
      delay: 1000, // From global
    });
    expect(merged.loading).toEqual({ minDuration: 500 });
    expect(merged.onSuccess).toBe(localOptions.onSuccess);
    expect(merged.onError).toBe(globalConfig.onError);
  });

  it("should chain local and global onError", () => {
    const globalOnError = vi.fn();
    const localOnError = vi.fn();

    const globalConfig = {
      onError: globalOnError,
    };

    const localOptions = {
      onError: localOnError,
    };

    const merged = mergeFlowOptions(globalConfig, localOptions);

    // Call the merged function
    merged.onError?.({ message: "test" });

    // Both should be called
    expect(globalOnError).toHaveBeenCalledWith({ message: "test" });
    expect(localOnError).toHaveBeenCalledWith({ message: "test" });
  });

  it("should use replace mode when specified", () => {
    const globalConfig = {
      retry: { maxAttempts: 3 },
      loading: { minDuration: 500 },
      overrideMode: "replace" as const,
    };

    const localOptions = {
      retry: { maxAttempts: 1 },
    };

    const merged = mergeFlowOptions(globalConfig, localOptions);

    // In replace mode, only local options should be used
    expect(merged.retry).toEqual({ maxAttempts: 1 });
    expect(merged.loading).toBeUndefined();
  });

  it("should integrate with useFlow hook", async () => {
    const globalOnError = vi.fn();
    const mockAction = vi.fn().mockRejectedValue(new Error("Test error"));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FlowProvider
        config={{
          onError: globalOnError,
          retry: { maxAttempts: 1 },
        }}
      >
        {children}
      </FlowProvider>
    );

    const { result } = renderHook(() => useFlow(mockAction), { wrapper });

    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(globalOnError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should allow nested FlowProviders with different configs", () => {
    const outerConfig = {
      retry: { maxAttempts: 3 },
    };

    const innerConfig = {
      retry: { maxAttempts: 5 },
      loading: { minDuration: 300 },
    };

    const OuterWrapper = ({ children }: { children: React.ReactNode }) => (
      <FlowProvider config={outerConfig}>{children}</FlowProvider>
    );

    const InnerWrapper = ({ children }: { children: React.ReactNode }) => (
      <FlowProvider config={innerConfig}>{children}</FlowProvider>
    );

    const { result: outerResult } = renderHook(() => useFlowContext(), {
      wrapper: OuterWrapper,
    });

    const { result: innerResult } = renderHook(() => useFlowContext(), {
      wrapper: ({ children }) => (
        <OuterWrapper>
          <InnerWrapper>{children}</InnerWrapper>
        </OuterWrapper>
      ),
    });

    expect(outerResult.current?.retry?.maxAttempts).toBe(3);
    expect(innerResult.current?.retry?.maxAttempts).toBe(5);
    expect(innerResult.current?.loading?.minDuration).toBe(300);
  });

  it("should handle empty global config gracefully", () => {
    const localOptions = {
      retry: { maxAttempts: 2 },
    };

    const merged = mergeFlowOptions(null, localOptions);

    expect(merged).toEqual(localOptions);
  });

  it("should merge all nested options correctly", () => {
    const globalConfig = {
      retry: { maxAttempts: 3, delay: 1000, backoff: "exponential" as const },
      autoReset: { enabled: true, delay: 2000 },
      loading: { minDuration: 500, delay: 200 },
      concurrency: "keep" as const,
    };

    const localOptions = {
      retry: { maxAttempts: 5 },
      loading: { minDuration: 300 },
    };

    const merged = mergeFlowOptions(globalConfig, localOptions);

    expect(merged.retry).toEqual({
      maxAttempts: 5,
      delay: 1000,
      backoff: "exponential",
    });
    expect(merged.autoReset).toEqual({ enabled: true, delay: 2000 });
    expect(merged.loading).toEqual({ minDuration: 300, delay: 200 });
    expect(merged.concurrency).toBe("keep");
  });

  it("should preserve advanced local flow options", () => {
    const globalConfig = {
      loading: { minDuration: 200 },
    };

    const localOptions = {
      persist: { key: "profile-flow", persistLoading: true as const },
      polling: { interval: 1500 },
      dedupKey: "profile",
      staleTime: 10_000,
      debugName: "ProfileFlow",
      triggerOn: [true],
    };

    const merged = mergeFlowOptions(globalConfig, localOptions);

    expect(merged.persist).toEqual(localOptions.persist);
    expect(merged.polling).toEqual(localOptions.polling);
    expect(merged.dedupKey).toBe("profile");
    expect(merged.staleTime).toBe(10_000);
    expect(merged.debugName).toBe("ProfileFlow");
    expect(merged.triggerOn).toEqual([true]);
  });
});
