/**
 * Emotional UX — User Sentiment Detection
 *
 * Detects subtle frustration patterns — hesitation before clicking, erratic scrolling,
 * rapid form abandonment, repeated back-navigation — and provides a frustration score
 * for proactive UX adaptation.
 */

export interface SentimentOptions {
  /** Enable sentiment detection. */
  enabled: boolean;
  /** Which signals to monitor. */
  signals?: (
    | "hesitation"
    | "abandonment"
    | "erraticScroll"
    | "backNavigation"
    | "rageClick"
  )[];
  /** Called when frustration is detected. */
  onFrustration?: (level: number, signals: SentimentSignal[]) => void;
  /** Adaptive UI options. */
  adaptiveUI?: {
    /** Auto-hide optional fields when user is frustrated. */
    simplifyOnFrustration?: boolean;
    /** Make buttons bigger under stress. */
    enlargeTargetsOnStress?: boolean;
    /** Offer autocomplete suggestions. */
    offerAutocomplete?: boolean;
  };
}

export interface SentimentSignal {
  type: string;
  value: number;
  timestamp: number;
}

/**
 * SentimentTracker monitors user interaction patterns to compute a frustration score.
 */
export class SentimentTracker {
  private static instance: SentimentTracker;
  private signals: SentimentSignal[] = [];
  private mouseEntropy = 0;
  private lastMousePositions: { x: number; y: number; t: number }[] = [];
  private scrollDeltas: number[] = [];
  private focusBlurCycles = 0;
  private lastFocusTime = 0;
  private listeners = new Set<
    (level: number, signals: SentimentSignal[]) => void
  >();

  private constructor() {
    if (typeof window !== "undefined") {
      this.attachListeners();
    }
  }

  public static getInstance(): SentimentTracker {
    if (!SentimentTracker.instance) {
      SentimentTracker.instance = new SentimentTracker();
    }
    return SentimentTracker.instance;
  }

  private attachListeners(): void {
    // Track mouse entropy (randomness of movement)
    window.addEventListener("mousemove", (e) => {
      this.lastMousePositions.push({
        x: e.clientX,
        y: e.clientY,
        t: Date.now(),
      });
      if (this.lastMousePositions.length > 30) this.lastMousePositions.shift();
      this.computeMouseEntropy();
    });

    // Track erratic scrolling
    window.addEventListener("scroll", () => {
      this.scrollDeltas.push(Date.now());
      if (this.scrollDeltas.length > 50) this.scrollDeltas.shift();
    });

    // Track form focus/blur cycles (abandonment detection)
    document.addEventListener("focusin", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        this.lastFocusTime = Date.now();
      }
    });

    document.addEventListener("focusout", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        const focusDuration = Date.now() - this.lastFocusTime;
        // Short focus then blur = abandonment signal
        if (focusDuration < 1000 && focusDuration > 50) {
          this.focusBlurCycles++;
          this.addSignal("abandonment", Math.min(1, this.focusBlurCycles / 5));
        }
      }
    });

    // Decay signals every 10 seconds
    setInterval(() => {
      this.focusBlurCycles = Math.max(0, this.focusBlurCycles - 1);
      this.signals = this.signals.filter(
        (s) => Date.now() - s.timestamp < 30000,
      );
    }, 10000);
  }

  private computeMouseEntropy(): void {
    if (this.lastMousePositions.length < 10) return;

    const positions = this.lastMousePositions;
    const angles: number[] = [];

    for (let i = 2; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      angles.push(angle);
    }

    // Calculate angle variance (high variance = erratic movement)
    const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
    const variance =
      angles.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / angles.length;

    this.mouseEntropy = Math.min(1, variance / Math.PI);

    if (this.mouseEntropy > 0.6) {
      this.addSignal("erraticMouse", this.mouseEntropy);
    }
  }

  private addSignal(type: string, value: number): void {
    this.signals.push({ type, value, timestamp: Date.now() });

    // Compute overall frustration level
    const level = this.getFrustrationLevel();
    if (level > 0.5) {
      this.listeners.forEach((fn) => fn(level, [...this.signals]));
    }
  }

  /** Get current frustration level (0-1). */
  public getFrustrationLevel(): number {
    const recentSignals = this.signals.filter(
      (s) => Date.now() - s.timestamp < 15000,
    );

    if (recentSignals.length === 0) return 0;

    const avgValue =
      recentSignals.reduce((sum, s) => sum + s.value, 0) / recentSignals.length;
    const density = Math.min(1, recentSignals.length / 10);

    return Math.min(1, avgValue * 0.6 + density * 0.4);
  }

  /** Register a frustration listener. */
  public onFrustration(
    callback: (level: number, signals: SentimentSignal[]) => void,
  ): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /** Check if user is showing hesitation (long pause before a target). */
  public detectHesitation(targetElement: HTMLElement): number {
    const rect = targetElement.getBoundingClientRect();
    const lastPos = this.lastMousePositions[this.lastMousePositions.length - 1];
    if (!lastPos) return 0;

    const dist = Math.sqrt(
      Math.pow(lastPos.x - (rect.left + rect.width / 2), 2) +
        Math.pow(lastPos.y - (rect.top + rect.height / 2), 2),
    );

    // Near the target but not clicking = hesitation
    if (dist < 100) {
      const recentPositions = this.lastMousePositions.slice(-5);
      const velocities: number[] = [];
      for (let i = 1; i < recentPositions.length; i++) {
        const d = Math.sqrt(
          Math.pow(recentPositions[i].x - recentPositions[i - 1].x, 2) +
            Math.pow(recentPositions[i].y - recentPositions[i - 1].y, 2),
        );
        const dt = recentPositions[i].t - recentPositions[i - 1].t;
        velocities.push(d / dt);
      }

      const avgVelocity =
        velocities.length > 0
          ? velocities.reduce((a, b) => a + b, 0) / velocities.length
          : 0;

      // Low velocity near target = high hesitation
      if (avgVelocity < 0.3) return 0.8;
      if (avgVelocity < 0.5) return 0.5;
    }

    return 0;
  }

  /** Get current scroll entropy (erratic scrolling indicator). */
  public getScrollEntropy(): number {
    if (this.scrollDeltas.length < 5) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < this.scrollDeltas.length; i++) {
      intervals.push(this.scrollDeltas[i] - this.scrollDeltas[i - 1]);
    }

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) /
      intervals.length;

    // High variance in scroll intervals = erratic scrolling
    return Math.min(1, variance / 100000);
  }

  /** Reset all sentiment data. */
  public reset(): void {
    this.signals = [];
    this.mouseEntropy = 0;
    this.lastMousePositions = [];
    this.scrollDeltas = [];
    this.focusBlurCycles = 0;
  }
}
