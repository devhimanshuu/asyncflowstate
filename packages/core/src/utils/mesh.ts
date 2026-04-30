/**
 * Flow Mesh — Cross-Tab / Cross-Device Orchestration
 *
 * Flows across multiple browser tabs form a mesh network. They share cache,
 * coordinate execution via leader election, and prevent duplicate work.
 */

export interface MeshOptions {
  /** BroadcastChannel name for this mesh. */
  channel: string;
  /** Coordination strategy. */
  strategy?: "leader-follower" | "peer-to-peer";
  /** Share successful results across tabs. Default: true */
  shareCache?: boolean;
  /** Propagate errors to prevent retry storms. Default: true */
  shareErrors?: boolean;
  /** Leader election heartbeat interval (ms). Default: 5000 */
  heartbeat?: number;
}

interface MeshMessage {
  type:
    | "heartbeat"
    | "cache"
    | "error"
    | "election"
    | "leader"
    | "request"
    | "response";
  senderId: string;
  payload?: any;
  timestamp: number;
}

/**
 * FlowMesh manages cross-tab coordination with leader election.
 */
export class FlowMesh {
  private channel: BroadcastChannel | null = null;
  private config: Required<MeshOptions>;
  private instanceId: string;
  private isLeader = false;
  private lastHeartbeat = 0;
  private heartbeatTimer: any = null;
  private electionTimer: any = null;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private listeners = new Map<string, Set<(data: any) => void>>();
  private peerCount = 0;

  constructor(options: MeshOptions) {
    this.instanceId = this.generateId();
    this.config = {
      channel: options.channel,
      strategy: options.strategy ?? "leader-follower",
      shareCache: options.shareCache ?? true,
      shareErrors: options.shareErrors ?? true,
      heartbeat: options.heartbeat ?? 5000,
    };

    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(this.config.channel);
      this.channel.onmessage = (event) => this.handleMessage(event.data);
      this.startElection();
    }
  }

  /** Check if this tab is the mesh leader. */
  public get leader(): boolean {
    return this.isLeader;
  }

  /** Get the number of connected peers. */
  public get peers(): number {
    return this.peerCount;
  }

  /** Share a cache entry across the mesh. */
  public shareResult(key: string, data: any): void {
    if (!this.channel || !this.config.shareCache) return;

    this.cache.set(key, { data, timestamp: Date.now() });
    this.broadcast({
      type: "cache",
      senderId: this.instanceId,
      payload: { key, data },
      timestamp: Date.now(),
    });
  }

  /** Check if a cached result exists in the mesh. */
  public getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Consider cache fresh for 30 seconds
    if (Date.now() - entry.timestamp > 30000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /** Share an error across the mesh to prevent retry storms. */
  public shareError(key: string, error: any): void {
    if (!this.channel || !this.config.shareErrors) return;

    this.broadcast({
      type: "error",
      senderId: this.instanceId,
      payload: { key, error: String(error) },
      timestamp: Date.now(),
    });
  }

  /** Request the leader to execute an action. */
  public requestExecution(key: string): boolean {
    if (this.isLeader) return false; // We are the leader, execute locally

    if (this.channel) {
      this.broadcast({
        type: "request",
        senderId: this.instanceId,
        payload: { key },
        timestamp: Date.now(),
      });
      return true; // Delegated to leader
    }

    return false;
  }

  /** Subscribe to cache updates for a specific key. */
  public onCacheUpdate(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }

  private handleMessage(msg: MeshMessage): void {
    if (msg.senderId === this.instanceId) return;

    switch (msg.type) {
      case "heartbeat":
        this.lastHeartbeat = Date.now();
        this.peerCount = Math.max(this.peerCount, 1);
        break;

      case "cache":
        if (this.config.shareCache && msg.payload) {
          this.cache.set(msg.payload.key, {
            data: msg.payload.data,
            timestamp: msg.timestamp,
          });
          // Notify listeners
          this.listeners
            .get(msg.payload.key)
            ?.forEach((cb) => cb(msg.payload.data));
        }
        break;

      case "error":
        if (this.config.shareErrors) {
          console.warn(
            `[FlowMesh] Error shared from peer: ${msg.payload?.key} — ${msg.payload?.error}`,
          );
        }
        break;

      case "election":
        // If our ID is "higher", respond to claim leadership
        if (this.instanceId > msg.senderId) {
          this.broadcast({
            type: "leader",
            senderId: this.instanceId,
            timestamp: Date.now(),
          });
          this.becomeLeader();
        }
        break;

      case "leader":
        // Someone else claimed leadership
        this.isLeader = false;
        this.lastHeartbeat = Date.now();
        break;

      case "request":
        if (this.isLeader) {
          // Leader handles the request
          this.listeners.get("__request")?.forEach((cb) => cb(msg.payload));
        }
        break;
    }
  }

  private startElection(): void {
    // Bully algorithm: announce ourselves
    this.broadcast({
      type: "election",
      senderId: this.instanceId,
      timestamp: Date.now(),
    });

    // If no one responds with a higher ID within 2 seconds, become leader
    this.electionTimer = setTimeout(() => {
      if (Date.now() - this.lastHeartbeat > this.config.heartbeat) {
        this.becomeLeader();
      }
    }, 2000);

    // Periodic heartbeats
    this.heartbeatTimer = setInterval(() => {
      if (this.isLeader) {
        this.broadcast({
          type: "heartbeat",
          senderId: this.instanceId,
          timestamp: Date.now(),
        });
      } else {
        // Check if leader is still alive
        if (Date.now() - this.lastHeartbeat > this.config.heartbeat * 2) {
          this.startElection();
        }
      }
    }, this.config.heartbeat);
  }

  private becomeLeader(): void {
    this.isLeader = true;
    console.info(
      `[FlowMesh] This tab is now the mesh leader (${this.instanceId.slice(0, 8)})`,
    );
  }

  private broadcast(msg: MeshMessage): void {
    try {
      this.channel?.postMessage(msg);
    } catch {
      /* Channel closed */
    }
  }

  private generateId(): string {
    return `mesh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  /** Destroy the mesh connection. */
  public dispose(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.electionTimer) clearTimeout(this.electionTimer);
    this.channel?.close();
    this.channel = null;
    this.cache.clear();
    this.listeners.clear();
  }
}
