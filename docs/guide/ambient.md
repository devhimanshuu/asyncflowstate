---
outline: deep
---

# 🌡️ Ambient Intelligence

<div class="tip custom-block" style="padding: 12px 20px; border-left: 4px solid #22c55e;">
Flows that sense the device's physical state — battery, network quality, CPU pressure — and <strong>dynamically adapt</strong> their behavior.
</div>

<AmbientAnimation />

## The Concept

A heavy data sync shouldn't drain a dying phone. A large payload shouldn't be fetched on 2G. **Ambient Intelligence** makes flows device-aware.

## Quick Start

```ts
const { data, execute } = useFlow(syncHeavyData, {
  ambient: {
    enabled: true,
    rules: {
      lowBattery: { below: 15, action: "defer" },
      slowNetwork: { below: "2g", action: "compress" },
      highCPU: { above: 80, action: "throttle" },
    },
    onAdapt: (adaptation) => {
      toast.info(`Flow adapted: ${adaptation.reason}`);
    },
  },
});
```

## Device Sensors

| Sensor   | API Used                                          | Fallback                      |
| -------- | ------------------------------------------------- | ----------------------------- |
| Battery  | `navigator.getBattery()`                          | Ignored if unavailable        |
| Network  | `navigator.connection.effectiveType`              | Ignored if unavailable        |
| CPU Load | Frame rate monitoring via `requestAnimationFrame` | Estimated from FPS drop       |
| Memory   | `performance.measureUserAgentSpecificMemory()`    | Not available on all browsers |

## Adaptation Actions

| Action     | Behavior                                          |
| ---------- | ------------------------------------------------- |
| `defer`    | Queue execution for later when conditions improve |
| `compress` | Request compressed/minimal payload variant        |
| `throttle` | Reduce polling frequency and concurrency          |
| `purge`    | Aggressively clear cache to free memory           |
| `skip`     | Skip execution entirely                           |

## API Reference

### `AmbientSensor`

```ts
import { AmbientSensor } from "@asyncflowstate/core";

const sensor = AmbientSensor.getInstance();
const state = sensor.getState();
// { battery: 23, charging: false, networkType: '4g', estimatedCPU: 15, ... }
```

The sensor is a **singleton** that monitors device state globally — it's shared across all flows.
