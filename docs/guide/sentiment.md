---
outline: deep
---

# 🎭 Emotional UX — Sentiment Detection

<div class="tip custom-block" style="padding: 12px 20px; border-left: 4px solid #ec4899;">
Detect subtle user frustration patterns — hesitation, erratic scrolling, form abandonment — and <strong>proactively adapt the UI</strong>.
</div>

<SentimentAnimation />

## The Concept

Beyond rage-click detection, **Sentiment Analysis** monitors multiple behavioral signals to compute a 0-1 frustration score. When frustration exceeds a threshold, your app can simplify the UI, offer help, or reduce complexity.

## Quick Start

```ts
const { data, execute } = useFlow(submitForm, {
  sentiment: {
    enabled: true,
    signals: ["hesitation", "abandonment", "erraticScroll", "rageClick"],
    onFrustration: (level) => {
      if (level > 0.7) {
        showHelpBubble(
          "Need help? Our AI assistant can fill this out for you.",
        );
      }
    },
  },
});
```

## Detected Signals

| Signal             | Detection Method                            | Indicator                            |
| ------------------ | ------------------------------------------- | ------------------------------------ |
| **Hesitation**     | Low mouse velocity near interactive targets | User is unsure where to click        |
| **Abandonment**    | Rapid focus/blur cycles on form inputs      | User starts filling forms then stops |
| **Erratic Scroll** | High variance in scroll intervals           | User is scanning frantically         |
| **Erratic Mouse**  | High angular variance in mouse movement     | User is moving cursor randomly       |

## Frustration Score

The frustration level (0-1) is computed as a weighted combination:

```
frustrationLevel = (avgSignalValue × 0.6) + (signalDensity × 0.4)
```

Signals decay over time (30-second window) to avoid stale readings.

## API Reference

### `SentimentTracker`

```ts
import { SentimentTracker } from "@asyncflowstate/core";

const tracker = SentimentTracker.getInstance();

// Get current frustration level
const level = tracker.getFrustrationLevel(); // 0.0 - 1.0

// Listen for frustration events
const unsubscribe = tracker.onFrustration((level, signals) => {
  console.log(`Frustration: ${level}`, signals);
});

// Detect hesitation near a specific element
const hesitation = tracker.detectHesitation(
  document.getElementById("submit-btn"),
);
```

## Adaptive UI Examples

```ts
// Auto-simplify forms when frustrated
if (frustrationLevel > 0.6) {
  hideOptionalFields();
  enlargeSubmitButton();
  showTooltips();
}

// Offer live chat
if (frustrationLevel > 0.8) {
  openChatWidget();
}
```
