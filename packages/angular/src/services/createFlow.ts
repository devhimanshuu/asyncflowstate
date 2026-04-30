import { BehaviorSubject } from "rxjs";
import { Flow, type FlowAction } from "@asyncflowstate/core";
import type { AngularFlowOptions, FlowSignalState } from "../types";

function mapFlowState<TData, TError, TArgs extends any[]>(
  flow: Flow<TData, TError, TArgs>,
): FlowSignalState<TData, TError> {
  const state = flow.state;
  return {
    status: state.status,
    data: state.data,
    error: state.error,
    progress: state.progress ?? 0,
    loading: flow.isLoading,
    isLoading: flow.isLoading,
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isIdle: state.status === "idle",
    isStreaming: state.status === "streaming",
    isPrewarmed: state.status === "prewarmed",
    rollbackDiff: (state as any).rollbackDiff ?? null,
  };
}

/**
 * Creates an Angular-friendly flow instance with BehaviorSubject and Observable.
 * Use in components or services with the `async` pipe.
 *
 * @example
 * ```typescript
 * @Component({
 *   template: `
 *     <ng-container *ngIf="userFlow.state$ | async as state">
 *       <button (click)="userFlow.execute('user-123')" [disabled]="state.loading">
 *         {{ state.loading ? 'Loading...' : 'Fetch User' }}
 *       </button>
 *       <p *ngIf="state.data">{{ state.data.name }}</p>
 *     </ng-container>
 *   `
 * })
 * export class UserComponent implements OnDestroy {
 *   userFlow = createFlow(async (id: string) => api.fetchUser(id));
 *   ngOnDestroy() { this.userFlow.destroy(); }
 * }
 * ```
 */
export function createFlow<
  TData = any,
  TError = any,
  TArgs extends any[] = any[],
>(
  action: FlowAction<TData, TArgs>,
  options: AngularFlowOptions<TData, TError, TArgs> = {},
) {
  const flow = new Flow<TData, TError, TArgs>(action, options);

  const initialState = mapFlowState<TData, TError, TArgs>(flow);
  const state$ = new BehaviorSubject<FlowSignalState<TData, TError>>(
    initialState,
  );

  const cleanupFns: (() => void)[] = [];
  let lastArgs: TArgs | null = null;

  const unsubscribeFlow = flow.subscribe(() => {
    state$.next(mapFlowState(flow));
  });
  cleanupFns.push(unsubscribeFlow);

  // Auto-revalidation
  if (typeof window !== "undefined") {
    if (options.revalidateOnFocus) {
      const handleFocus = () => {
        if (document.visibilityState === "visible" && lastArgs) {
          flow.execute(...lastArgs);
        }
      };
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);
      cleanupFns.push(() => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      });
    }

    if (options.revalidateOnReconnect) {
      const handleOnline = () => {
        if (lastArgs) flow.execute(...lastArgs);
      };
      window.addEventListener("online", handleOnline);
      cleanupFns.push(() => window.removeEventListener("online", handleOnline));
    }
  }

  function execute(...args: TArgs): Promise<TData | undefined> {
    lastArgs = args;
    return flow.execute(...args);
  }

  function destroy() {
    cleanupFns.forEach((fn) => fn());
    state$.complete();
    flow.dispose();
  }

  const announcement$ = new BehaviorSubject<string>("");

  const unsubscribeStatus = state$.subscribe((s) => {
    if (s.status === "success" && options.a11y?.announceSuccess) {
      const msg =
        typeof options.a11y.announceSuccess === "function"
          ? options.a11y.announceSuccess(s.data!)
          : options.a11y.announceSuccess;
      announcement$.next(msg);
    } else if (s.status === "error" && options.a11y?.announceError) {
      const msg =
        typeof options.a11y.announceError === "function"
          ? options.a11y.announceError(s.error!)
          : options.a11y.announceError;
      announcement$.next(msg);
    }
  });
  cleanupFns.push(() => unsubscribeStatus.unsubscribe());

  return {
    state$,
    state: state$.asObservable(),
    execute,
    setOptions: (
      newOptions: Partial<AngularFlowOptions<TData, TError, TArgs>>,
    ) => {
      flow.setOptions({ ...options, ...newOptions });
    },
    prewarm: flow.prewarm.bind(flow),
    askDebugger: flow.askDebugger.bind(flow),
    reset: flow.reset.bind(flow),
    cancel: flow.cancel.bind(flow),
    setProgress: flow.setProgress.bind(flow),
    exportState: flow.exportState.bind(flow),
    importState: flow.importState.bind(flow),
    triggerUndo: flow.triggerUndo.bind(flow),
    worker: flow.worker.bind(flow),
    flow,
    signals: flow.signals,
    announcement$: announcement$.asObservable(),
    destroy,
    snapshot: () => state$.getValue(),
  };
}
