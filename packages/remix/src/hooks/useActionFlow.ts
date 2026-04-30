import { useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useEffect, useCallback } from "react";
import { useFlow, type ReactFlowOptions } from "@asyncflowstate/react";

/**
 * A specialized hook for Remix Actions.
 * Integrates useFlow with Remix's useSubmit and useNavigation.
 */
export function useActionFlow<TData = any, TError = any>(
  options: ReactFlowOptions<TData, TError, any> = {},
) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<TData>();

  // Define the action that triggers Remix's submit
  const remixAction = useCallback(
    async (target: any, submitOptions?: any) => {
      return submit(target, submitOptions);
    },
    [submit],
  );

  const flow = useFlow(remixAction as any, options);

  // Sync Remix navigation state with flow state
  useEffect(() => {
    if (navigation.state === "submitting" || navigation.state === "loading") {
      // We could manually trigger flow state changes here if needed,
      // but tsup/core handles the execution lifecycle.
    }
  }, [navigation.state]);

  // Sync action data
  useEffect(() => {
    if (actionData && flow.status !== "success") {
      // Inject external data into flow if necessary
    }
  }, [actionData, flow]);

  return {
    ...flow,
    navigation,
    isSubmitting: navigation.state === "submitting",
  };
}
