---
layout: home
title: AsyncFlowState - Predictable Async UI Behavior
titleTemplate: The Async Behavior Engine

hero:
  name: AsyncFlowState
  text: The AI-Powered Async Engine
  tagline: Eliminate boilerplate, predict user intent, and self-heal failures with AI — across React, Vue, Svelte, Angular, Solid, Next.js, Nuxt, Remix & Astro.
  image:
    src: /logo.png
    alt: AsyncFlowState Logo
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/devhimanshuu/asyncflowstate
---

<div class="absolute top-[300px] left-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] 2xl:w-[1000px] 2xl:h-[1000px] bg-brand/10 blur-[120px] rounded-full animate-float opacity-30 pointer-events-none z-[-1]"></div>
<div class="absolute top-[800px] right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] 2xl:w-[900px] 2xl:h-[900px] bg-accent/10 blur-[120px] rounded-full animate-pulse-slow opacity-20 pointer-events-none z-[-1]"></div>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- INSTALL COMMAND + VERSION BADGE                            -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section pt-0 pb-12">
<div class="afs-container flex flex-col items-center gap-5">

<InstallBar />
</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- BEFORE / AFTER CODE COMPARISON                             -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section py-24 bg-(--vp-c-bg-soft) border-y border-(--vp-c-divider)/30">
<div class="afs-container">

<div class="text-center mb-14">
<p class="afs-label">The Problem</p>
<h1 class="afs-heading">You've written this code <span class="text-brand italic">hundreds of times.</span></h1>
<p class="afs-subheading">Every async action needs loading states, error handling, double-click prevention, and accessibility. <span class="text-brand ">AsyncFlowState</span> handles all of it in one hook.</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

<!-- BEFORE -->
<div class="rounded-2xl border border-red-500/20 bg-(--vp-c-bg) overflow-hidden">
<div class="flex items-center gap-2 px-5 py-3.5 border-b border-(--vp-c-divider) bg-red-500/5">
<div class="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
<span class="text-[12px] font-bold text-red-400 uppercase tracking-wider">Before — 34 lines of boilerplate</span>
</div>
<div class="p-5 overflow-x-auto">

```tsx
function SaveButton({ data }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleClick = async () => {
    if (loading) return; // manual double-click guard
    setLoading(true);
    setError(null);
    try {
      await api.save(data);
      setSubmitted(true);
      toast.success("Saved!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        aria-disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
```

</div>
</div>

<!-- AFTER -->
<div class="rounded-2xl border border-emerald-500/20 bg-(--vp-c-bg) overflow-hidden">
<div class="flex items-center gap-2 px-5 py-3.5 border-b border-(--vp-c-divider) bg-emerald-500/5">
<div class="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
<span class="text-[12px] font-bold text-emerald-400 uppercase tracking-wider">After — 10 lines with AsyncFlowState</span>
</div>
<div class="p-5 overflow-x-auto">

```tsx
function SaveButton({ data }) {
  const flow = useFlow(async () => api.save(data), {
    onSuccess: () => toast.success("Saved!"),
    onError: (err) => toast.error(err.message),
  });

  return (
    <>
      <button {...flow.button()}>{flow.loading ? "Saving..." : "Save"}</button>
      {flow.error && (
        <p ref={flow.errorRef} role="alert">
          {flow.error.message}
        </p>
      )}
    </>
  );
}
```

</div>
</div>

</div>

<div class="mt-8 flex flex-wrap justify-center gap-6 text-[13px] font-bold opacity-50">
<span class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-500"></i> Loading state — automatic</span>
<span class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-500"></i> Double-click prevention — built in</span>
<span class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-500"></i> ARIA attributes — generated</span>
<span class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-500"></i> Error focus management — handled</span>
</div>

</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- CORE FEATURES BENTO GRID                                   -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section py-28">
<div class="afs-container">

<div class="text-center mb-16">
<p class="afs-label">Core Engine — v3.0</p>
<h1 class="afs-heading">Everything your async flows <span class="text-brand italic">need.</span></h1>
<p class="afs-subheading">30+ production-grade features. AI-powered debugging. Zero runtime dependencies. One API surface across nine frameworks.</p>
</div>

<!-- Bento Row 1: 2 large cards -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

<div class="afs-bento-card group">
<div class="flex items-start justify-between mb-6">
<div>
<p class="afs-label mb-2! text-left!">Concurrency Control</p>
<h3 class="text-2xl font-black tracking-tight">Behavioral Orchestration</h3>
</div>
<div class="w-11 h-11 rounded-xl bg-(--vp-c-brand-soft) flex items-center justify-center text-lg group-hover:scale-110 group-hover:bg-(--vp-c-brand-1) group-hover:text-white transition-all duration-300">
<i class="fa-solid fa-shuffle text-(--vp-c-brand-1) group-hover:text-white"></i>
</div>
</div>
<p class="text-sm opacity-50 leading-relaxed mb-6">Control overlapping requests with professional concurrency strategies. No more race conditions or manual <code>isLoading</code> flags.</p>
<div class="grid grid-cols-3 gap-3">
<div class="afs-mini-card">
<p class="font-bold text-[13px] mb-1">Exhaust</p>
<p class="text-[11px] opacity-40">Block while active</p>
</div>
<div class="afs-mini-card">
<p class="font-bold text-[13px] mb-1">Switch</p>
<p class="text-[11px] opacity-40">Cancel & restart</p>
</div>
<div class="afs-mini-card">
<p class="font-bold text-[13px] mb-1">Enqueue</p>
<p class="text-[11px] opacity-40">Process in order</p>
</div>
</div>
<a href="/guide/concurrency" class="afs-link mt-5">Learn about concurrency →</a>
</div>

<div class="afs-bento-card group">
<div class="flex items-start justify-between mb-6">
<div>
<p class="afs-label mb-2! text-left!" style="color: var(--afs-accent);">Resilience</p>
<h3 class="text-2xl font-black tracking-tight">Self-Healing Retry Engine</h3>
</div>
<div class="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-lg group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
<i class="fa-solid fa-rotate text-cyan-500 group-hover:text-white"></i>
</div>
</div>
<p class="text-sm opacity-50 leading-relaxed mb-6">Automatic retry with exponential backoff, randomized jitter, and circuit breaker patterns. Failed operations recover without flooding your backend.</p>
<div class="grid grid-cols-3 gap-3">
<div class="afs-mini-card">
<p class="font-bold text-[13px] mb-1">Backoff</p>
<p class="text-[11px] opacity-40">Exponential delay</p>
</div>
<div class="afs-mini-card">
<p class="font-bold text-[13px] mb-1">Jitter</p>
<p class="text-[11px] opacity-40">Prevent stampedes</p>
</div>
<div class="afs-mini-card">
<p class="font-bold text-[13px] mb-1">Circuit Breaker</p>
<p class="text-[11px] opacity-40">Stop cascading</p>
</div>
</div>
<a href="/guide/retry-error-handling" class="afs-link mt-5" style="color: var(--afs-accent);">Learn about retries →</a>
</div>

</div>

<!-- Bento Row 2: 4 smaller cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">

<div class="afs-bento-card group">
<div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-bolt text-amber-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Optimistic UI</h4>
<p class="text-[13px] opacity-45 leading-relaxed mb-4">Instant UI updates with automatic rollback on failure. Users see results before the server responds.</p>
<a href="/guide/optimistic-ui" class="afs-link text-amber-500">Learn more →</a>
</div>

<div class="afs-bento-card group">
<div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-clock-rotate-left text-purple-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Global Undo</h4>
<p class="text-[13px] opacity-45 leading-relaxed mb-4">Purgatory state holds operations in limbo. Give users a grace period to undo before commit.</p>
<a href="/guide/purgatory" class="afs-link text-purple-500">Learn more →</a>
</div>

<div class="afs-bento-card group">
<div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-water text-cyan-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Streaming</h4>
<p class="text-[13px] opacity-45 leading-relaxed mb-4">Native <code>AsyncIterable</code> and <code>ReadableStream</code> support for AI chat, live feeds, and SSE.</p>
<a href="/guide/streaming" class="afs-link text-cyan-500">Learn more →</a>
</div>

<div class="afs-bento-card group">
<div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-tower-broadcast text-emerald-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Cross-Tab Sync</h4>
<p class="text-[13px] opacity-45 leading-relaxed mb-4">Flow states sync across tabs via BroadcastChannel. One tab completes — all tabs update.</p>
<a href="/guide/cross-tab-sync" class="afs-link text-emerald-500">Learn more →</a>
</div>

</div>

<!-- Bento Row 3: 3 medium cards -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-5">

<div class="afs-bento-card group">
<div class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-database text-rose-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Smart Persistence</h4>
<p class="text-[13px] opacity-45 leading-relaxed">Resume interrupted operations across page refreshes with localStorage/sessionStorage persistence.</p>
<a href="/guide/persistence" class="afs-link mt-3 text-rose-500">Learn more →</a>
</div>

<div class="afs-bento-card group">
<div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-layer-group text-indigo-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Middleware & Interceptors</h4>
<p class="text-[13px] opacity-45 leading-relaxed">Add logging, analytics, auth-token injection, and request transforms with global or per-flow middleware.</p>
<a href="/guide/middleware" class="afs-link mt-3 text-indigo-500">Learn more →</a>
</div>

<div class="afs-bento-card group">
<div class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-timeline text-teal-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Visual Debugger</h4>
<p class="text-[13px] opacity-45 leading-relaxed">Real-time timeline/Gantt view of all async activity. Time-travel through state transitions for debugging.</p>
<a href="/guide/visual-debugger" class="afs-link mt-3 text-teal-500">Learn more →</a>
</div>

</div>

<!-- Bento Row 4: v3.0 Next-Gen AI Features -->
<div class="mt-5 p-[2px] rounded-2xl bg-linear-to-r from-brand/40 via-purple-500/40 to-cyan-500/40">
<div class="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-[14px] bg-(--vp-c-bg)">

<div class="afs-bento-card group border-fuchsia-500/20">
<div class="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-dna text-fuchsia-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Flow DNA</h4>
<p class="text-[13px] opacity-45 leading-relaxed">Genetic auto-tuning. Flows analyze P95 latency to continuously evolve their own optimal timeouts, retries, and stale times.</p>
<a href="/guide/flow-dna" class="afs-link mt-3 text-fuchsia-500">Learn more →</a>
</div>

<div class="afs-bento-card group border-emerald-500/20">
<div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-thermometer-half text-emerald-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Ambient Intelligence</h4>
<p class="text-[13px] opacity-45 leading-relaxed">Device-aware flows that monitor battery, network type, and CPU pressure to dynamically defer or compress payloads.</p>
<a href="/guide/ambient" class="afs-link mt-3 text-emerald-500">Learn more →</a>
</div>

<div class="afs-bento-card group border-orange-500/20">
<div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-base mb-5 group-hover:scale-110 transition-transform duration-300">
<i class="fa-solid fa-share-nodes text-orange-500"></i>
</div>
<h4 class="font-bold text-[15px] mb-2">Flow Mesh</h4>
<p class="text-[13px] opacity-45 leading-relaxed">Tabs form a local P2P network using BroadcastChannel. Leader election prevents duplicate API calls and shares cache instantly.</p>
<a href="/guide/mesh" class="afs-link mt-3 text-orange-500">Learn more →</a>
</div>

</div>
</div>
<p class="text-center mt-4 text-[11px] font-black uppercase tracking-[0.25em] opacity-25">✦ Next-Gen AI — Autonomous Async Orchestration ✦</p>

</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- LIVE ANIMATION SHOWCASE                                    -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section py-28 bg-linear-to-b from-transparent via-brand/5 to-transparent border-y border-(--vp-c-divider)/30 overflow-hidden">
<div class="afs-container">

<div class="flex flex-col lg:flex-row items-center gap-16">
<div class="lg:w-1/2 space-y-6">
<p class="afs-label">See It In Action</p>
<h1 class="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.1]">Concurrency strategies, <span class="text-brand italic">visualized.</span></h1>
<p class="text-lg opacity-50 leading-relaxed font-medium max-w-[480px]">Watch how <code>exhaust</code>, <code>switch</code>, and <code>enqueue</code> handle overlapping user clicks in real time. No custom logic required.</p>

<div class="space-y-3 pt-2">
<div class="flex items-start gap-3">
<i class="fa-solid fa-circle-check text-emerald-500 mt-1 text-sm shrink-0"></i>
<div class="text-sm opacity-60 m-0"><strong>Exhaust</strong> — Blocks new calls while one is active. For payments and form submissions.</div>
</div>
<div class="flex items-start gap-3">
<i class="fa-solid fa-circle-check text-emerald-500 mt-1 text-sm shrink-0"></i>
<div class="text-sm opacity-60 m-0"><strong>Switch</strong> — Cancels active and restarts. For search and autocomplete.</div>
</div>
<div class="flex items-start gap-3">
<i class="fa-solid fa-circle-check text-emerald-500 mt-1 text-sm shrink-0"></i>
<div class="text-sm opacity-60 m-0"><strong>Enqueue</strong> — Queues in order. For file uploads and batch operations.</div>
</div>
</div>

<a href="/guide/concurrency" class="afs-button-secondary mt-4">Explore Concurrency Docs →</a>

</div>

<div class="lg:w-1/2 relative">
<div class="absolute -inset-6 bg-linear-to-br from-brand/10 via-transparent to-accent/10 rounded-[40px] blur-2xl opacity-60"></div>
<div class="bg-(--vp-c-bg) rounded-2xl p-6 border border-(--vp-c-divider) shadow-2xl relative">
<ConcurrencyAnimation class="w-full" />
</div>
</div>
</div>

</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- RETRY ENGINE SHOWCASE                                      -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section py-28">
<div class="afs-container">

<div class="flex flex-col lg:flex-row-reverse items-center gap-16">
<div class="lg:w-1/2 space-y-6 text-center lg:text-left">
<p class="afs-label" style="color: var(--afs-accent);">Resilience Engineering</p>
<h1 class="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.1]">Failed requests <span class="text-accent italic">recover.</span></h1>
<p class="text-lg opacity-50 leading-relaxed font-medium max-w-[480px]">Network failures are inevitable. AsyncFlowState retries intelligently with backoff, jitter, and circuit breakers — so your users never see a broken state.</p>

<div class="space-y-3 pt-2 text-left">
<div class="flex items-start gap-3">
<i class="fa-solid fa-circle-check text-cyan-500 mt-1 text-sm shrink-0"></i>
<div class="text-sm opacity-60 m-0"><strong>Exponential backoff</strong> — Progressively longer delays between attempts.</div>
</div>
<div class="flex items-start gap-3">
<i class="fa-solid fa-circle-check text-cyan-500 mt-1 text-sm shrink-0"></i>
<div class="text-sm opacity-60 m-0"><strong>Circuit breaker</strong> — Halts retries after repeated failures to protect services.</div>
</div>
<div class="flex items-start gap-3">
<i class="fa-solid fa-circle-check text-cyan-500 mt-1 text-sm shrink-0"></i>
<div class="text-sm opacity-60 m-0"><strong>Dead letter queue</strong> — Captures permanently failed operations for replay.</div>
</div>
</div>

<a href="/guide/retry-error-handling" class="afs-button-secondary mt-4" style="border-color: rgba(6,182,212,0.2); color: var(--afs-accent);">Explore Retry Docs →</a>

</div>

<div class="lg:w-1/2 relative">
<div class="absolute -inset-6 bg-linear-to-br from-accent/10 via-transparent to-brand/10 rounded-[40px] blur-2xl opacity-60"></div>
<div class="bg-(--vp-c-bg) rounded-2xl p-6 border border-(--vp-c-divider) shadow-2xl relative">
<RetryAnimation class="w-full" />
</div>
</div>
</div>

</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- PACKAGE ECOSYSTEM                                          -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section py-28">
<div class="afs-container">

<div class="text-center mb-16">
<p class="afs-label">Package Ecosystem</p>
<h1 class="afs-heading">One core. <span class="text-brand italic">Nine adapters.</span></h1>
<p class="afs-subheading">A framework-agnostic engine with native bindings that speak each framework's idiom — hooks, composables, stores, services, and signals.</p>
</div>

<!-- Core package highlight -->
<div class="mb-8 p-6 rounded-2xl bg-(--vp-c-bg-soft) border border-(--vp-c-divider) flex flex-col md:flex-row items-center gap-6">
<div class="w-14 h-14 rounded-2xl bg-(--vp-c-brand-soft) flex items-center justify-center shrink-0">
<i class="fa-solid fa-microchip text-(--vp-c-brand-1) text-xl"></i>
</div>
<div class="flex-1 text-center md:text-left">
<p class="font-black text-lg tracking-tight mb-1">@asyncflowstate/core</p>
<p class="text-sm opacity-45">Framework-agnostic state machine engine. The foundation that powers every adapter. Can be used standalone with vanilla JavaScript.</p>
</div>
<a href="/api/core" class="afs-button-secondary shrink-0">API Reference →</a>
</div>

<!-- Framework adapters grid -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

<a href="/frameworks/react/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300" alt="React" />
<p class="font-bold text-sm">React</p>
<p class="text-[10px] opacity-35 font-semibold">useFlow · useParallel</p>
</a>

<a href="/frameworks/next/nextjs" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300 dark:invert" alt="Next.js" />
<p class="font-bold text-sm">Next.js</p>
<p class="text-[10px] opacity-35 font-semibold">Server Actions · SSR</p>
</a>

<a href="/frameworks/vue/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300" alt="Vue" />
<p class="font-bold text-sm">Vue 3</p>
<p class="text-[10px] opacity-35 font-semibold">useFlow composable</p>
</a>

<a href="/frameworks/svelte/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300" alt="Svelte" />
<p class="font-bold text-sm">Svelte</p>
<p class="text-[10px] opacity-35 font-semibold">$ auto-subscription</p>
</a>

<a href="/frameworks/angular/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300" alt="Angular" />
<p class="font-bold text-sm">Angular</p>
<p class="text-[10px] opacity-35 font-semibold">Observable bindings</p>
</a>

<a href="/frameworks/solidjs/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidjs/solidjs-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300" alt="SolidJS" />
<p class="font-bold text-sm">SolidJS</p>
<p class="text-[10px] opacity-35 font-semibold">Fine-grained signals</p>
</a>

<a href="/frameworks/nuxt/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300" alt="Nuxt" />
<p class="font-bold text-sm">Nuxt</p>
<p class="text-[10px] opacity-35 font-semibold">Auto-imports · Module</p>
</a>

<a href="/frameworks/remix/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300 text-blue-400" alt="Remix" style="filter: grayscale(1) invert(0.5) sepia(1) hue-rotate(180deg) saturate(3);" />
<p class="font-bold text-sm">Remix</p>
<p class="text-[10px] opacity-35 font-semibold">Actions · Loaders</p>
</a>

<a href="/frameworks/astro/" class="afs-framework-card group">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/astro/astro-original.svg" class="w-11 h-11 group-hover:scale-110 transition-transform duration-300 dark:invert" alt="Astro" />
<p class="font-bold text-sm">Astro</p>
<p class="text-[10px] opacity-35 font-semibold">Actions · Server Side</p>
</a>

</div>

</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- STATS BAR                                                  -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section py-16 bg-(--vp-c-bg-soft) border-y border-(--vp-c-divider)/30">
<div class="afs-container">
<div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

<div>
<p class="text-4xl lg:text-5xl font-black tracking-tighter text-(--vp-c-brand-1)">30+</p>
<p class="text-[12px] font-bold opacity-35 uppercase tracking-wider mt-2">Built-in Features</p>
</div>

<div>
<p class="text-4xl lg:text-5xl font-black tracking-tighter text-(--vp-c-brand-1)">9</p>
<p class="text-[12px] font-bold opacity-35 uppercase tracking-wider mt-2">Framework Adapters</p>
</div>

<div>
<p class="text-4xl lg:text-5xl font-black tracking-tighter text-(--vp-c-brand-1)">0</p>
<p class="text-[12px] font-bold opacity-35 uppercase tracking-wider mt-2">Runtime Dependencies</p>
</div>

<div>
<p class="text-4xl lg:text-5xl font-black tracking-tighter text-(--vp-c-brand-1)">100%</p>
<p class="text-[12px] font-bold opacity-35 uppercase tracking-wider mt-2">TypeScript Coverage</p>
</div>

</div>
</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- FINAL CTA                                                  -->
<!-- ═══════════════════════════════════════════════════════════ -->
<section class="afs-section py-32 text-center relative overflow-hidden">
<div class="absolute inset-0 bg-linear-to-b from-transparent via-brand/5 to-brand/8 pointer-events-none"></div>
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/8 blur-[140px] rounded-full pointer-events-none"></div>
<div class="relative afs-container">

<p class="afs-label mb-6">Get started in 30 seconds</p>
<h1 class="text-7xl lg:text-9xl font-black tracking-tighter mb-5 ">Ship flawless async UX<br/><span class="text-brand italic">in record time.</span></h1>
<p class="afs-subheading">Replace fragile state logic with a robust orchestration engine. Experience built-in concurrency control, optimistic updates, and automatic error recovery out-of-the-box.</p>

<div class="mb-10 mt-10">
<InstallBar />
</div>

<div class="flex flex-col sm:flex-row justify-center gap-3 mb-14">
<a href="/guide/getting-started" class="afs-button-primary">Get Started →</a>
<a href="https://github.com/devhimanshuu/asyncflowstate" class="afs-button-secondary">View on GitHub ↗</a>
</div>

<div class="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
<span>Type-Safe</span>
<span>·</span>
<span>Zero Dependencies</span>
<span>·</span>
<span>MIT Licensed</span>
<span>·</span>
<span>Enterprise Ready</span>
</div>

</div>
</section>

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SCOPED STYLES                                              -->
<!-- ═══════════════════════════════════════════════════════════ -->
<style scoped>
/* ─── Animations ─── */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}
.animate-float { animation: float 10s ease-in-out infinite; }

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}
.animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }

/* ─── Layout ─── */
.afs-section { position: relative; }
.afs-container { max-width: 1152px; margin: 0 auto; padding: 0 24px; }
@media (min-width: 1536px) { .afs-container { max-width: 1440px; } }
@media (min-width: 1920px) { .afs-container { max-width: 1600px; } }
@media (min-width: 2560px) { .afs-container { max-width: 1900px; } }
@media (min-width: 3840px) { .afs-container { max-width: 2400px; } }

/* ─── Typography ─── */
.afs-label {
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--vp-c-brand-1);
  margin-bottom: 12px;
}
.afs-heading {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: 12px;
}
@media (min-width: 1536px) { .afs-heading { font-size: 3.8rem; } }
@media (min-width: 1920px) { .afs-heading { font-size: 4.5rem; } }
@media (min-width: 2560px) { .afs-heading { font-size: 5.2rem; } }
.afs-subheading {
  font-size: 1.4rem;
  opacity: 0.45;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
  font-weight: 500;
}
@media (min-width: 1920px) { .afs-subheading { font-size: 1.7rem; max-width: 900px; } }
@media (min-width: 2560px) { .afs-subheading { font-size: 2.0rem; max-width: 1200px; } }


/* ─── Install Bar ─── */
.afs-install-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 24px;
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  width: fit-content;
}
.afs-install-code {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  letter-spacing: -0.02em;
  background: none;
  white-space: nowrap;
  padding: 0;
}
@media (min-width: 1920px) { .afs-install-code { font-size: 17px; } }
@media (min-width: 2560px) { .afs-install-code { font-size: 20px; } }

/* ─── Bento Cards ─── */
.afs-bento-card {
  padding: 24px;
  border-radius: 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
@media (min-width: 1920px) { .afs-bento-card { padding: 40px; border-radius: 32px; } }
@media (min-width: 2560px) { .afs-bento-card { padding: 56px; border-radius: 48px; } }
.afs-bento-card:hover {
  border-color: rgba(99, 102, 241, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 16px 40px -12px rgba(99, 102, 241, 0.15);
}

/* ─── Mini Feature Cards ─── */
.afs-mini-card {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

/* ─── Links ─── */
.afs-link {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.afs-link:hover { opacity: 0.7; }

/* ─── Buttons ─── */
.afs-button-primary {
  display: inline-block;
  padding: 14px 36px;
  background: var(--afs-brand);
  color: white;
  font-weight: 900;
  font-size: 15px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12px 32px -8px rgba(99, 102, 241, 0.4);
}
@media (min-width: 1920px) { .afs-button-primary { padding: 20px 48px; font-size: 18px; border-radius: 18px; } }
@media (min-width: 2560px) { .afs-button-primary { padding: 24px 64px; font-size: 22px; border-radius: 24px; } }
.afs-button-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.5);
}
.afs-button-secondary {
  display: inline-block;
  padding: 14px 36px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 900;
  font-size: 15px;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.afs-button-secondary:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.1);
}

/* ─── Framework Cards ─── */
.afs-framework-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}
.afs-framework-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 12px 28px -8px rgba(99, 102, 241, 0.15);
}

/* ─── Code block overrides within landing page ─── */
.vp-doc div[class*="language-"] {
  margin: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
}
</style>
