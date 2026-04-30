/**
 * Collaborative Flows — CRDT-Based Conflict Resolution
 *
 * For real-time collaborative apps, flows that multiple users execute on the same
 * resource need conflict resolution. This integrates Last-Writer-Wins (LWW)
 * register semantics with custom merge strategies.
 */

export interface CollaborativeOptions {
  /** Enable collaborative mode. */
  enabled: boolean;
  /** Conflict resolution strategy. */
  strategy?: "last-writer-wins" | "merge" | "custom";
  /** Custom merge function for 'custom' strategy. */
  merge?: (local: any, remote: any) => any;
  /** Track presence (who is editing what). */
  presence?: boolean;
  /** BroadcastChannel name for sync. */
  channel?: string;
}

export interface PresenceEntry {
  userId: string;
  field?: string;
  lastSeen: number;
  cursor?: { x: number; y: number };
}

interface CollabMessage {
  type: "update" | "presence" | "conflict";
  senderId: string;
  payload: any;
  timestamp: number;
  vectorClock: number;
}

/**
 * LWW Register — Last-Writer-Wins conflict resolution.
 * Each value has a timestamp; the latest timestamp wins.
 */
export class LWWRegister<T = any> {
  private value: T | null = null;
  private timestamp = 0;

  public set(value: T, timestamp?: number): void {
    const ts = timestamp ?? Date.now();
    if (ts >= this.timestamp) {
      this.value = value;
      this.timestamp = ts;
    }
  }

  public get(): T | null {
    return this.value;
  }

  public getTimestamp(): number {
    return this.timestamp;
  }

  public merge(other: LWWRegister<T>): void {
    if (other.timestamp > this.timestamp) {
      this.value = other.value;
      this.timestamp = other.timestamp;
    }
  }
}

/**
 * CollaborativeState manages multi-user state synchronization.
 */
export class CollaborativeState<TData = any> {
  private channel: BroadcastChannel | null = null;
  private config: Required<CollaborativeOptions>;
  private register = new LWWRegister<TData>();
  private vectorClock = 0;
  private instanceId: string;
  private presenceMap = new Map<string, PresenceEntry>();
  private updateListeners = new Set<
    (data: TData, source: "local" | "remote") => void
  >();
  private presenceListeners = new Set<(entries: PresenceEntry[]) => void>();

  constructor(options: CollaborativeOptions) {
    this.instanceId = `collab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.config = {
      enabled: options.enabled,
      strategy: options.strategy ?? "last-writer-wins",
      merge: options.merge ?? ((_, remote) => remote),
      presence: options.presence ?? false,
      channel: options.channel ?? "af-collab",
    };

    if (typeof BroadcastChannel !== "undefined" && this.config.enabled) {
      this.channel = new BroadcastChannel(this.config.channel);
      this.channel.onmessage = (event) => this.handleMessage(event.data);
    }

    // Presence cleanup
    if (this.config.presence) {
      setInterval(() => {
        const cutoff = Date.now() - 30000;
        for (const [id, entry] of this.presenceMap) {
          if (entry.lastSeen < cutoff) {
            this.presenceMap.delete(id);
          }
        }
        this.notifyPresence();
      }, 10000);
    }
  }

  /** Apply a local update. */
  public update(data: TData): void {
    this.vectorClock++;
    this.register.set(data);
    this.notifyUpdate(data, "local");

    // Broadcast to peers
    this.broadcast({
      type: "update",
      senderId: this.instanceId,
      payload: data,
      timestamp: Date.now(),
      vectorClock: this.vectorClock,
    });
  }

  /** Resolve a conflict between local and remote state. */
  public resolve(local: TData, remote: TData): TData {
    switch (this.config.strategy) {
      case "last-writer-wins":
        return remote; // Remote is always newer in LWW
      case "merge":
      case "custom":
        return this.config.merge(local, remote);
      default:
        return remote;
    }
  }

  /** Update presence information. */
  public updatePresence(userId: string, field?: string): void {
    if (!this.config.presence) return;

    const entry: PresenceEntry = {
      userId,
      field,
      lastSeen: Date.now(),
    };

    this.presenceMap.set(userId, entry);
    this.notifyPresence();

    this.broadcast({
      type: "presence",
      senderId: this.instanceId,
      payload: entry,
      timestamp: Date.now(),
      vectorClock: this.vectorClock,
    });
  }

  /** Get all active presence entries. */
  public getPresence(): PresenceEntry[] {
    return Array.from(this.presenceMap.values());
  }

  /** Get the current resolved value. */
  public getValue(): TData | null {
    return this.register.get();
  }

  /** Subscribe to data updates. */
  public onUpdate(
    callback: (data: TData, source: "local" | "remote") => void,
  ): () => void {
    this.updateListeners.add(callback);
    return () => this.updateListeners.delete(callback);
  }

  /** Subscribe to presence changes. */
  public onPresenceChange(
    callback: (entries: PresenceEntry[]) => void,
  ): () => void {
    this.presenceListeners.add(callback);
    return () => this.presenceListeners.delete(callback);
  }

  private handleMessage(msg: CollabMessage): void {
    if (msg.senderId === this.instanceId) return;

    switch (msg.type) {
      case "update": {
        const local = this.register.get();
        const remote = msg.payload;

        if (local !== null) {
          const resolved = this.resolve(local, remote);
          this.register.set(resolved, msg.timestamp);
          this.notifyUpdate(resolved, "remote");
        } else {
          this.register.set(remote, msg.timestamp);
          this.notifyUpdate(remote, "remote");
        }

        if (msg.vectorClock > this.vectorClock) {
          this.vectorClock = msg.vectorClock;
        }
        break;
      }

      case "presence": {
        if (msg.payload) {
          this.presenceMap.set(msg.payload.userId, msg.payload);
          this.notifyPresence();
        }
        break;
      }
    }
  }

  private notifyUpdate(data: TData, source: "local" | "remote"): void {
    this.updateListeners.forEach((cb) => cb(data, source));
  }

  private notifyPresence(): void {
    const entries = this.getPresence();
    this.presenceListeners.forEach((cb) => cb(entries));
  }

  private broadcast(msg: CollabMessage): void {
    try {
      this.channel?.postMessage(msg);
    } catch {
      /* ignore */
    }
  }

  /** Destroy collaborative state. */
  public dispose(): void {
    this.channel?.close();
    this.channel = null;
    this.updateListeners.clear();
    this.presenceListeners.clear();
    this.presenceMap.clear();
  }
}
