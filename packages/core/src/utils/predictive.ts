/**
 * Tiny utility to predict user intent based on mouse trajectory.
 * In a real-world scenario, this would wrap a Transformers.js model or window.ai.
 * Here we provide a heuristic-based "Intent Tracker" that simulates the behavior.
 */
export class IntentTracker {
  private static instance: IntentTracker;
  private points: { x: number; y: number; t: number }[] = [];
  private velocity = 0;

  private constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", this.track.bind(this));
    }
  }

  public static getInstance(): IntentTracker {
    if (!IntentTracker.instance) {
      IntentTracker.instance = new IntentTracker();
    }
    return IntentTracker.instance;
  }

  private track(e: MouseEvent) {
    this.points.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    if (this.points.length > 10) this.points.shift();

    if (this.points.length >= 2) {
      const p1 = this.points[this.points.length - 2];
      const p2 = this.points[this.points.length - 1];
      const dist = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2),
      );
      const dt = p2.t - p1.t;
      this.velocity = dist / dt;
    }
  }

  /**
   * Predicts if the user is intending to click a specific element.
   * @param rect The bounding client rect of the target element.
   * @returns Probability score (0-1)
   */
  public predictIntent(rect: DOMRect): number {
    if (this.points.length < 5) return 0;

    const lastPoint = this.points[this.points.length - 1];

    // Calculate distance to element center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.sqrt(
      Math.pow(lastPoint.x - centerX, 2) + Math.pow(lastPoint.y - centerY, 2),
    );

    // Heuristic: If velocity is high and moving TOWARDS the element, probability is high.
    // Also if distance is small, probability is high.

    // Simplification for this project: return high score if close and slowing down
    if (dist < 100 && this.velocity < 0.5) return 0.8;
    if (dist < 50) return 0.95;

    return 0;
  }
}

/**
 * Higher-level function to automatically pre-warm flows based on intent.
 */
export function monitorIntent(
  element: HTMLElement,
  onIntent: () => void,
  threshold = 0.7,
) {
  const tracker = IntentTracker.getInstance();
  const check = () => {
    const rect = element.getBoundingClientRect();
    const probability = tracker.predictIntent(rect);
    if (probability >= threshold) {
      onIntent();
    }
  };

  const interval = setInterval(check, 100);
  return () => clearInterval(interval);
}
