import { Flow, type FlowAction, type FlowOptions } from "../flow";

/**
 * Composes multiple async functions into a single pipeline.
 * Each function receives the output of the previous one.
 *
 * @example
 * ```ts
 * const pipeline = pipe(
 *   async (userId: string) => api.fetchUser(userId),
 *   async (user) => api.fetchPosts(user.id),
 *   async (posts) => posts.filter(p => p.published)
 * );
 *
 * const result = await pipeline.execute('user-123');
 * // result = published posts for that user
 * ```
 */
export function pipe<TFirst extends (...args: any[]) => any>(
  ...fns: [TFirst, ...((input: any) => any | Promise<any>)[]]
): Flow<any, any, Parameters<TFirst>> {
  const composedAction: FlowAction<any, Parameters<TFirst>> = async (
    ...args: Parameters<TFirst>
  ) => {
    let result = await fns[0](...args);
    for (let i = 1; i < fns.length; i++) {
      result = await fns[i](result);
    }
    return result;
  };

  return new Flow(composedAction);
}

/**
 * Creates a Flow that runs multiple actions in sequence, passing context between them.
 * Unlike `pipe`, each step receives the accumulated context object.
 *
 * @example
 * ```ts
 * const workflow = chain([
 *   async (ctx) => ({ ...ctx, user: await api.fetchUser(ctx.userId) }),
 *   async (ctx) => ({ ...ctx, posts: await api.fetchPosts(ctx.user.id) }),
 *   async (ctx) => ({ ...ctx, comments: await api.fetchComments(ctx.posts[0].id) }),
 * ]);
 *
 * const result = await workflow.execute({ userId: 'user-123' });
 * // result = { userId, user, posts, comments }
 * ```
 */
export function chain<TContext = any>(
  steps: ((ctx: TContext) => TContext | Promise<TContext>)[],
  options?: FlowOptions<TContext, any, [TContext]>,
): Flow<TContext, any, [TContext]> {
  const composedAction: FlowAction<TContext, [TContext]> = async (
    initialCtx: TContext,
  ) => {
    let ctx = initialCtx;
    for (const step of steps) {
      ctx = await step(ctx);
    }
    return ctx;
  };

  return new Flow(composedAction, options);
}

/**
 * Creates a Flow that races multiple actions and returns the first to succeed.
 * All losers are ignored (not cancelled — use Quantum for cancellation).
 *
 * @example
 * ```ts
 * const fastest = raceFlows(
 *   async () => fetchFromCDN1(),
 *   async () => fetchFromCDN2(),
 *   async () => fetchFromCDN3(),
 * );
 *
 * const result = await fastest.execute();
 * ```
 */
export function raceFlows<TData>(
  ...actions: (() => Promise<TData>)[]
): Flow<TData, any, []> {
  const composedAction: FlowAction<TData, []> = async () => {
    return Promise.race(actions.map((fn) => fn()));
  };

  return new Flow(composedAction);
}

/**
 * Creates a Flow that retries with a fallback action if the primary action fails.
 *
 * @example
 * ```ts
 * const resilient = withFallback(
 *   async () => fetchFromPrimary(),
 *   async () => fetchFromCache(),
 * );
 *
 * const result = await resilient.execute();
 * ```
 */
export function withFallback<TData, TArgs extends any[]>(
  primary: FlowAction<TData, TArgs>,
  fallback: FlowAction<TData, TArgs>,
  options?: FlowOptions<TData, any, TArgs>,
): Flow<TData, any, TArgs> {
  const composedAction: FlowAction<TData, TArgs> = async (...args: TArgs) => {
    try {
      return await primary(...args);
    } catch {
      return await fallback(...args);
    }
  };

  return new Flow(composedAction, options);
}
