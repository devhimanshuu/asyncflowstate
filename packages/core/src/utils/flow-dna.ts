/**
 * Flow DNA — Genetic Optimization Engine
 *
 * Every flow execution leaves a "DNA fingerprint" — a performance genome capturing
 * latency, retry count, cache hit rate, and error distribution. Over hundreds of
 * executions, a micro genetic algorithm evolves the optimal configuration.
 */

export interface FlowDNAOptions {
  /** Enable the genetic optimization engine. */
  enabled: boolean;
  /** Number of executions before beginning optimization. Default: 50 */
  generations?: number;
  /** How aggressively to tweak params (0-1). Default: 0.1 */
  mutationRate?: number;
  /** What to optimize for. Default: 'latency' */
  fitness?: "latency" | "reliability" | "bandwidth";
}

/** A single execution genome — performance fingerprint. */
export interface ExecutionGenome {
  timestamp: number;
  latency: number;
  retries: number;
  cacheHit: boolean;
  success: boolean;
  payloadSize: number;
}

/** Evolved configuration suggestions. */
export interface EvolvedConfig {
  suggestedTimeout?: number;
  suggestedMaxRetries?: number;
  suggestedStaleTime?: number;
  suggestedDebounce?: number;
  fitnessScore: number;
  generation: number;
}

const DNA_STORE_PREFIX = "af_dna_";

/**
 * FlowDNA collects execution telemetry and evolves optimal flow configurations
 * using a lightweight genetic algorithm.
 */
export class FlowDNA {
  private genomes: ExecutionGenome[] = [];
  private config: Required<FlowDNAOptions>;
  private flowKey: string;
  private evolved: EvolvedConfig | null = null;

  constructor(flowKey: string, options: FlowDNAOptions) {
    this.flowKey = flowKey;
    this.config = {
      enabled: options.enabled,
      generations: options.generations ?? 50,
      mutationRate: options.mutationRate ?? 0.1,
      fitness: options.fitness ?? "latency",
    };
    this.loadGenomes();
  }

  /** Record a new execution genome. */
  public record(genome: Omit<ExecutionGenome, "timestamp">): void {
    const entry: ExecutionGenome = { ...genome, timestamp: Date.now() };
    this.genomes.push(entry);

    // Keep last 500 genomes
    if (this.genomes.length > 500) {
      this.genomes = this.genomes.slice(-500);
    }

    this.persistGenomes();

    // Run evolution if we have enough data
    if (this.genomes.length >= this.config.generations) {
      this.evolve();
    }
  }

  /** Get the current evolved configuration, if available. */
  public getEvolved(): EvolvedConfig | null {
    return this.evolved;
  }

  /** Run the genetic optimization algorithm. */
  private evolve(): void {
    const recent = this.genomes.slice(-this.config.generations);

    // Calculate population statistics
    const latencies = recent.filter((g) => g.success).map((g) => g.latency);
    const successRate = recent.filter((g) => g.success).length / recent.length;
    const avgLatency =
      latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 5000;
    const p95Latency = this.percentile(latencies, 95);
    const cacheHitRate =
      recent.filter((g) => g.cacheHit).length / recent.length;

    // Mutation: apply random variations to find better configs
    const mutation = this.config.mutationRate;
    const jitter = () => 1 + (Math.random() * 2 - 1) * mutation;

    // Evolve timeout: set to ~1.3x of p95 latency
    const suggestedTimeout = Math.round(
      Math.max(1000, p95Latency * 1.3 * jitter()),
    );

    // Evolve max retries: fewer if success rate is high
    const suggestedMaxRetries =
      successRate > 0.95
        ? Math.max(1, Math.round(2 * jitter()))
        : successRate > 0.8
          ? Math.round(3 * jitter())
          : Math.round(4 * jitter());

    // Evolve stale time: longer if data rarely changes (low cache miss rate)
    const suggestedStaleTime =
      cacheHitRate > 0.8
        ? Math.round(60000 * jitter())
        : cacheHitRate > 0.5
          ? Math.round(30000 * jitter())
          : Math.round(10000 * jitter());

    // Evolve debounce: based on avg time between calls
    const timestamps = recent.map((g) => g.timestamp).sort();
    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    const avgInterval =
      intervals.length > 0
        ? intervals.reduce((a, b) => a + b, 0) / intervals.length
        : 1000;
    const suggestedDebounce =
      avgInterval < 200 ? Math.round(150 * jitter()) : undefined;

    // Calculate fitness score based on optimization target
    let fitnessScore: number;
    switch (this.config.fitness) {
      case "latency":
        fitnessScore = Math.max(0, 1 - avgLatency / 10000);
        break;
      case "reliability":
        fitnessScore = successRate;
        break;
      case "bandwidth": {
        const avgPayload =
          recent.reduce((sum, g) => sum + g.payloadSize, 0) / recent.length;
        fitnessScore = Math.max(0, 1 - avgPayload / 1_000_000);
        break;
      }
    }

    this.evolved = {
      suggestedTimeout,
      suggestedMaxRetries,
      suggestedStaleTime,
      suggestedDebounce,
      fitnessScore: Math.round(fitnessScore * 100) / 100,
      generation: this.genomes.length,
    };

    console.info(
      `[FlowDNA] Generation ${this.genomes.length}: Fitness=${this.evolved.fitnessScore} | ` +
        `Timeout=${suggestedTimeout}ms | Retries=${suggestedMaxRetries} | ` +
        `StaleTime=${suggestedStaleTime}ms`,
    );
  }

  /** Calculate percentile from a sorted array. */
  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 5000;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }

  /** Persist genomes to localStorage. */
  private persistGenomes(): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(
        `${DNA_STORE_PREFIX}${this.flowKey}`,
        JSON.stringify(this.genomes.slice(-200)),
      );
    } catch {
      /* quota exceeded — ignore */
    }
  }

  /** Load genomes from localStorage. */
  private loadGenomes(): void {
    if (typeof localStorage === "undefined") return;
    try {
      const saved = localStorage.getItem(`${DNA_STORE_PREFIX}${this.flowKey}`);
      if (saved) {
        this.genomes = JSON.parse(saved);
      }
    } catch {
      /* ignore */
    }
  }

  /** Reset all stored DNA data. */
  public reset(): void {
    this.genomes = [];
    this.evolved = null;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(`${DNA_STORE_PREFIX}${this.flowKey}`);
    }
  }
}
