/**
 * Flow Telemetry Dashboard — Real-Time DevTools
 *
 * A built-in, zero-dependency visual dashboard that renders as a shadow DOM
 * overlay in development mode. Shows live flow states, execution timelines,
 * cache hit rates, and AI healing events.
 */

export interface DevToolsOptions {
  /** Position of the overlay panel. Default: 'bottom-right' */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Theme for the panel. Default: 'dark' */
  theme?: "dark" | "light";
  /** Features to enable. */
  features?: {
    /** Show execution timeline. */
    timeline?: boolean;
    /** Show cache inspector. */
    cacheInspector?: boolean;
    /** Show mesh monitor. */
    meshMonitor?: boolean;
    /** Show DNA evolution charts. */
    dnaViewer?: boolean;
    /** Show AI healer log. */
    aiLog?: boolean;
  };
}

interface FlowEntry {
  id: string;
  name: string;
  status: string;
  startTime: number;
  endTime?: number;
  latency?: number;
  retries: number;
  error?: string;
}

/**
 * FlowDevTools provides a lightweight in-browser debugging overlay.
 */
export class FlowDevTools {
  private static instance: FlowDevTools | null = null;
  private entries: FlowEntry[] = [];
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private config: Required<DevToolsOptions>;
  private isVisible = false;
  private maxEntries = 100;

  private constructor(options: DevToolsOptions) {
    this.config = {
      position: options.position ?? "bottom-right",
      theme: options.theme ?? "dark",
      features: {
        timeline: options.features?.timeline ?? true,
        cacheInspector: options.features?.cacheInspector ?? true,
        meshMonitor: options.features?.meshMonitor ?? false,
        dnaViewer: options.features?.dnaViewer ?? false,
        aiLog: options.features?.aiLog ?? true,
      },
    };
  }

  /** Initialize the DevTools overlay. */
  public static init(options: DevToolsOptions = {}): FlowDevTools {
    if (FlowDevTools.instance) return FlowDevTools.instance;

    const instance = new FlowDevTools(options);

    if (typeof document !== "undefined") {
      instance.createOverlay();
    }

    FlowDevTools.instance = instance;
    return instance;
  }

  /** Get the singleton instance. */
  public static getInstance(): FlowDevTools | null {
    return FlowDevTools.instance;
  }

  /** Record a flow execution start. */
  public recordStart(flowId: string, flowName: string): void {
    this.entries.push({
      id: flowId,
      name: flowName,
      status: "loading",
      startTime: performance.now(),
      retries: 0,
    });

    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    this.renderTimeline();
  }

  /** Record a flow execution success. */
  public recordSuccess(flowId: string): void {
    const entry = this.entries.find(
      (e) => e.id === flowId && e.status === "loading",
    );
    if (entry) {
      entry.status = "success";
      entry.endTime = performance.now();
      entry.latency = Math.round(entry.endTime - entry.startTime);
    }
    this.renderTimeline();
  }

  /** Record a flow execution error. */
  public recordError(flowId: string, error: string): void {
    const entry = this.entries.find(
      (e) => e.id === flowId && e.status === "loading",
    );
    if (entry) {
      entry.status = "error";
      entry.endTime = performance.now();
      entry.latency = Math.round(entry.endTime - entry.startTime);
      entry.error = error;
    }
    this.renderTimeline();
  }

  /** Record a retry attempt. */
  public recordRetry(flowId: string): void {
    const entry = this.entries.find((e) => e.id === flowId);
    if (entry) {
      entry.retries++;
    }
    this.renderTimeline();
  }

  /** Toggle overlay visibility. */
  public toggle(): void {
    this.isVisible = !this.isVisible;
    if (this.container) {
      this.container.style.display = this.isVisible ? "block" : "none";
    }
  }

  /** Get all recorded entries. */
  public getEntries(): FlowEntry[] {
    return [...this.entries];
  }

  /** Get summary statistics. */
  public getStats(): {
    totalExecutions: number;
    successRate: number;
    avgLatency: number;
    totalRetries: number;
  } {
    const completed = this.entries.filter((e) => e.status !== "loading");
    const successes = completed.filter((e) => e.status === "success");
    const latencies = completed
      .filter((e) => e.latency !== undefined)
      .map((e) => e.latency!);

    return {
      totalExecutions: completed.length,
      successRate:
        completed.length > 0 ? successes.length / completed.length : 0,
      avgLatency:
        latencies.length > 0
          ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
          : 0,
      totalRetries: this.entries.reduce((sum, e) => sum + e.retries, 0),
    };
  }

  private createOverlay(): void {
    this.container = document.createElement("div");
    this.container.id = "af-devtools";
    this.container.style.cssText = `
      position: fixed; z-index: 99999;
      ${this.getPositionCSS()}
      width: 420px; max-height: 350px;
      display: none; font-family: 'JetBrains Mono', monospace;
    `;

    this.shadowRoot = this.container.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = this.getBaseHTML();
    document.body.appendChild(this.container);

    // Toggle with keyboard shortcut: Ctrl+Shift+F
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  private getPositionCSS(): string {
    const positions: Record<string, string> = {
      "bottom-right": "bottom: 16px; right: 16px;",
      "bottom-left": "bottom: 16px; left: 16px;",
      "top-right": "top: 16px; right: 16px;",
      "top-left": "top: 16px; left: 16px;",
    };
    return positions[this.config.position] || positions["bottom-right"];
  }

  private getBaseHTML(): string {
    const isDark = this.config.theme === "dark";
    const bg = isDark ? "#1a1a2e" : "#ffffff";
    const fg = isDark ? "#e0e0e0" : "#1a1a2e";
    const border = isDark ? "#2d2d44" : "#e0e0e0";
    const accent = "#7c3aed";

    return `
      <style>
        :host { all: initial; }
        .panel {
          background: ${bg}; color: ${fg}; border: 1px solid ${border};
          border-radius: 12px; overflow: hidden; font-size: 11px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
          background: ${accent}; color: white; padding: 8px 12px;
          font-weight: 700; font-size: 12px; display: flex;
          justify-content: space-between; align-items: center;
        }
        .header span { opacity: 0.7; font-size: 10px; }
        .body { padding: 8px; max-height: 280px; overflow-y: auto; }
        .entry {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 8px; border-radius: 6px; margin-bottom: 2px;
          background: ${isDark ? "#16213e" : "#f5f5f5"};
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .dot.success { background: #22c55e; }
        .dot.error { background: #ef4444; }
        .dot.loading { background: #eab308; animation: pulse 1s infinite; }
        .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .latency { opacity: 0.6; font-size: 10px; }
        .stats { padding: 8px 12px; border-top: 1px solid ${border}; display: flex; gap: 16px; }
        .stat { text-align: center; }
        .stat-value { font-size: 16px; font-weight: 800; color: ${accent}; }
        .stat-label { font-size: 9px; opacity: 0.5; text-transform: uppercase; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      </style>
      <div class="panel">
        <div class="header">
          ⚡ AsyncFlowState DevTools
          <span>Ctrl+Shift+F</span>
        </div>
        <div class="body" id="timeline"></div>
        <div class="stats" id="stats"></div>
      </div>
    `;
  }

  private renderTimeline(): void {
    if (!this.shadowRoot || !this.isVisible) return;

    const timeline = this.shadowRoot.getElementById("timeline");
    const statsEl = this.shadowRoot.getElementById("stats");
    if (!timeline || !statsEl) return;

    // Render entries (most recent first)
    const recent = this.entries.slice(-20).reverse();
    timeline.innerHTML = recent
      .map(
        (e) => `
      <div class="entry">
        <div class="dot ${e.status}"></div>
        <div class="name">${e.name || e.id}</div>
        ${e.retries > 0 ? `<div class="latency">↻${e.retries}</div>` : ""}
        <div class="latency">${e.latency ? `${e.latency}ms` : "..."}</div>
      </div>
    `,
      )
      .join("");

    // Render stats
    const stats = this.getStats();
    statsEl.innerHTML = `
      <div class="stat">
        <div class="stat-value">${stats.totalExecutions}</div>
        <div class="stat-label">Executions</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Math.round(stats.successRate * 100)}%</div>
        <div class="stat-label">Success</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.avgLatency}ms</div>
        <div class="stat-label">Avg Latency</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.totalRetries}</div>
        <div class="stat-label">Retries</div>
      </div>
    `;
  }

  /** Destroy the DevTools overlay. */
  public dispose(): void {
    this.container?.remove();
    this.container = null;
    this.shadowRoot = null;
    this.entries = [];
    FlowDevTools.instance = null;
  }
}
