/**
 * Edge-First Flows — Cloudflare Workers / Edge Runtime Awareness
 *
 * Flows that are aware they might be running on the edge and automatically adapt.
 * They use edge-native caching (Cache API), skip browser-only APIs, and can split
 * execution between edge and client.
 */

export interface EdgeOptions {
  /** Enable edge awareness. */
  enabled: boolean;
  /** Runtime to target. */
  runtime?: "auto" | "cloudflare" | "vercel" | "deno" | "browser";
  /** Cache configuration for edge. */
  cache?: {
    /** Caching strategy. */
    strategy?: "stale-while-revalidate" | "cache-first" | "network-first";
    /** Time-to-live in seconds. */
    ttl?: number;
    /** Cache scope. */
    scope?: "global" | "per-user" | "per-region";
  };
  /** Split execution between edge and client. */
  split?: {
    /** Action to run on edge. */
    edge?: (...args: any[]) => Promise<any>;
    /** Action to run on client to enrich edge data. */
    client?: (edgeData: any) => Promise<any>;
  };
}

export type EdgeRuntime =
  | "cloudflare"
  | "vercel"
  | "deno"
  | "browser"
  | "node"
  | "unknown";

/**
 * EdgeDetector identifies the current runtime environment.
 */
export class EdgeDetector {
  /** Detect the current edge runtime. */
  public static detect(): EdgeRuntime {
    // Cloudflare Workers
    if (
      typeof (globalThis as any).caches !== "undefined" &&
      typeof (globalThis as any).HTMLElement === "undefined"
    ) {
      return "cloudflare";
    }

    // Deno
    if (typeof (globalThis as any).Deno !== "undefined") {
      return "deno";
    }

    // Vercel Edge (has EdgeRuntime global)
    if (typeof (globalThis as any).EdgeRuntime !== "undefined") {
      return "vercel";
    }

    // Browser
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      return "browser";
    }

    // Node.js
    if (
      typeof (globalThis as any).process !== "undefined" &&
      (globalThis as any).process.versions?.node
    ) {
      return "node";
    }

    return "unknown";
  }

  /** Check if running on an edge runtime. */
  public static isEdge(): boolean {
    const runtime = this.detect();
    return (
      runtime === "cloudflare" || runtime === "vercel" || runtime === "deno"
    );
  }

  /** Check if running in a browser. */
  public static isBrowser(): boolean {
    return this.detect() === "browser";
  }
}

/**
 * EdgeCache provides a unified caching interface that works across
 * edge runtimes and browsers.
 */
export class EdgeCache {
  private runtime: EdgeRuntime;
  private ttl: number;
  private strategy: string;
  private memoryCache = new Map<string, { data: any; expires: number }>();

  constructor(options: EdgeOptions["cache"] = {}) {
    this.runtime = EdgeDetector.detect();
    this.ttl = (options.ttl ?? 60) * 1000;
    this.strategy = options.strategy ?? "stale-while-revalidate";
  }

  /** Get a cached value. */
  public async get(key: string): Promise<any | null> {
    // Try Cache API (edge + browser)
    if (typeof caches !== "undefined") {
      try {
        const cache = await caches.open("af-edge-cache");
        const response = await cache.match(this.keyToUrl(key));
        if (response) {
          const data = await response.json();
          if (data.__expires > Date.now()) {
            return data.value;
          }
          // Stale — delete from cache
          await cache.delete(this.keyToUrl(key));
        }
      } catch {
        /* fallback to memory */
      }
    }

    // Fallback: memory cache
    const entry = this.memoryCache.get(key);
    if (entry && entry.expires > Date.now()) {
      return entry.data;
    }
    this.memoryCache.delete(key);

    return null;
  }

  /** Set a cached value. */
  public async set(key: string, data: any): Promise<void> {
    const expires = Date.now() + this.ttl;

    // Cache API (edge + browser)
    if (typeof caches !== "undefined") {
      try {
        const cache = await caches.open("af-edge-cache");
        const response = new Response(
          JSON.stringify({ value: data, __expires: expires }),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": `max-age=${Math.floor(this.ttl / 1000)}`,
            },
          },
        );
        await cache.put(this.keyToUrl(key), response);
        return;
      } catch {
        /* fallback to memory */
      }
    }

    // Fallback: memory cache
    this.memoryCache.set(key, { data, expires });
  }

  /** Invalidate a cache entry. */
  public async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (typeof caches !== "undefined") {
      try {
        const cache = await caches.open("af-edge-cache");
        await cache.delete(this.keyToUrl(key));
      } catch {
        /* ignore */
      }
    }
  }

  /** Clear all cached data. */
  public async clear(): Promise<void> {
    this.memoryCache.clear();

    if (typeof caches !== "undefined") {
      try {
        await caches.delete("af-edge-cache");
      } catch {
        /* ignore */
      }
    }
  }

  private keyToUrl(key: string): string {
    return `https://af-cache.internal/${encodeURIComponent(key)}`;
  }
}

/**
 * Execute a split flow — edge preprocessing + client enrichment.
 */
export async function executeSplitFlow(
  options: EdgeOptions,
  ...args: any[]
): Promise<any> {
  if (!options.split) {
    throw new Error("[EdgeFlow] No split configuration provided.");
  }

  const isEdge = EdgeDetector.isEdge();

  if (isEdge && options.split.edge) {
    // On edge: run edge function only
    return options.split.edge(...args);
  }

  if (!isEdge && options.split.edge && options.split.client) {
    // On client: run edge first (simulated as regular call), then enrich
    const edgeResult = await options.split.edge(...args);
    return options.split.client(edgeResult);
  }

  // Fallback: just run client
  if (options.split.client) {
    return options.split.client(null);
  }

  return null;
}
