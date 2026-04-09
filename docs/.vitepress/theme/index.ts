import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import type { Theme } from "vitepress";
import "./tailwind.css";

import StateAnimation from "./components/StateAnimation.vue";
import ConcurrencyAnimation from "./components/ConcurrencyAnimation.vue";
import RetryAnimation from "./components/RetryAnimation.vue";
import OptimisticAnimation from "./components/OptimisticAnimation.vue";
import StreamingAnimation from "./components/StreamingAnimation.vue";
import PersistenceAnimation from "./components/PersistenceAnimation.vue";
import PerformanceAnimation from "./components/PerformanceAnimation.vue";
import ConfigAnimation from "./components/ConfigAnimation.vue";
import MiddlewareAnimation from "./components/MiddlewareAnimation.vue";
import DebuggerAnimation from "./components/DebuggerAnimation.vue";
import RealWorldPattern from "./components/RealWorldPattern.vue";
import LogoDots from "./components/LogoDots.vue";
import HeroOrbital from "./components/HeroOrbital.vue";
import InstallBar from "./components/InstallBar.vue";
import ReleaseBanner from "./components/ReleaseBanner.vue";

import PurgatoryAnimation from "./components/PurgatoryAnimation.vue";
import DLQAnimation from "./components/DLQAnimation.vue";
import CompositionAnimation from "./components/CompositionAnimation.vue";
import GhostAnimation from "./components/GhostAnimation.vue";
import WorkerAnimation from "./components/WorkerAnimation.vue";
import SyncAnimation from "./components/SyncAnimation.vue";
import PredictiveAnimation from "./components/PredictiveAnimation.vue";
import TestingJitterAnimation from "./components/TestingJitterAnimation.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      "home-hero-image-after": () => h(LogoDots),
      "layout-top": () => [h(HeroOrbital), h(ReleaseBanner)],
    });
  },
  enhanceApp({ app }) {
    app.component("StateAnimation", StateAnimation);
    app.component("ConcurrencyAnimation", ConcurrencyAnimation);
    app.component("RetryAnimation", RetryAnimation);
    app.component("OptimisticAnimation", OptimisticAnimation);
    app.component("StreamingAnimation", StreamingAnimation);
    app.component("PersistenceAnimation", PersistenceAnimation);
    app.component("PerformanceAnimation", PerformanceAnimation);
    app.component("ConfigAnimation", ConfigAnimation);
    app.component("MiddlewareAnimation", MiddlewareAnimation);
    app.component("DebuggerAnimation", DebuggerAnimation);
    app.component("RealWorldPattern", RealWorldPattern);

    // Advanced features animations
    app.component("PurgatoryAnimation", PurgatoryAnimation);
    app.component("DLQAnimation", DLQAnimation);
    app.component("CompositionAnimation", CompositionAnimation);
    app.component("GhostAnimation", GhostAnimation);
    app.component("WorkerAnimation", WorkerAnimation);
    app.component("SyncAnimation", SyncAnimation);
    app.component("PredictiveAnimation", PredictiveAnimation);
    app.component("ReleaseBanner", ReleaseBanner);
    app.component("InstallBar", InstallBar);
    app.component("TestingJitterAnimation", TestingJitterAnimation);
  },
} satisfies Theme;
