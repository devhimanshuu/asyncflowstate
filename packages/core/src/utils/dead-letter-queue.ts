/**
 * Dead Letter Queue (DLQ) — stores failed actions for later inspection or replay.
 * 
 * When an action fails permanently (after all retries), the DLQ captures the
 * arguments, error, timestamp, and metadata so developers can:
 * - Inspect failures in a dashboard
 * - Replay failed actions manually
 * - Export failure logs for debugging
 */

export interface DeadLetterEntry<TArgs extends any[] = any[]> {
  /** Unique ID for this entry */
  id: string;
  /** The arguments that were passed to the failed action */
  args: TArgs;
  /** The error that caused the failure */
  error: any;
  /** ISO timestamp of the failure */
  timestamp: string;
  /** Number of attempts made before giving up */
  attempts: number;
  /** Optional metadata (flow name, user context, etc.) */
  meta?: Record<string, any>;
}

export class DeadLetterQueue {
  private static instance: DeadLetterQueue | null = null;
  private entries: DeadLetterEntry[] = [];
  private listeners = new Set<(entries: DeadLetterEntry[]) => void>();
  private maxSize: number;
  private storageKey = '__asyncflow_dlq__';

  private constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.restore();
  }

  /**
   * Get or create the singleton DLQ instance.
   */
  public static getInstance(maxSize = 100): DeadLetterQueue {
    if (!DeadLetterQueue.instance) {
      DeadLetterQueue.instance = new DeadLetterQueue(maxSize);
    }
    return DeadLetterQueue.instance;
  }

  /**
   * Push a failed action into the dead letter queue.
   */
  public push<TArgs extends any[]>(entry: Omit<DeadLetterEntry<TArgs>, 'id' | 'timestamp'>): void {
    const full: DeadLetterEntry<TArgs> = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
      timestamp: new Date().toISOString(),
    };

    this.entries.push(full);

    // Evict oldest if over capacity
    while (this.entries.length > this.maxSize) {
      this.entries.shift();
    }

    this.persist();
    this.notify();
  }

  /**
   * Get all entries in the DLQ.
   */
  public getAll(): DeadLetterEntry[] {
    return [...this.entries];
  }

  /**
   * Get the number of entries in the DLQ.
   */
  public get size(): number {
    return this.entries.length;
  }

  /**
   * Remove a specific entry by ID.
   */
  public remove(id: string): boolean {
    const before = this.entries.length;
    this.entries = this.entries.filter(e => e.id !== id);
    if (this.entries.length !== before) {
      this.persist();
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Clear all entries from the DLQ.
   */
  public clear(): void {
    this.entries = [];
    this.persist();
    this.notify();
  }

  /**
   * Subscribe to DLQ changes.
   */
  public subscribe(listener: (entries: DeadLetterEntry[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Export all entries as JSON.
   */
  public export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  private notify(): void {
    const snapshot = this.getAll();
    this.listeners.forEach(l => l(snapshot));
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
      }
    } catch { /* storage unavailable */ }
  }

  private restore(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored) {
          this.entries = JSON.parse(stored);
        }
      }
    } catch { /* storage unavailable */ }
  }
}
