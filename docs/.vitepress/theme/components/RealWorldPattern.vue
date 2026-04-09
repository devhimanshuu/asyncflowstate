<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  }
});

const containerRef = ref(null);
const isVisible = ref(false);
const status = ref('idle'); // idle, loading, success
const progress = ref(0);
const isPointerActive = ref(false);

const aiWords = ['import', '{', 'useFlow', '}', 'from', "'@asyncflowstate/react'"];

let observer = null;
let resetTimeout = null;
let actionTimeout = null;

const startSimulation = () => {
  if (status.value !== 'idle') return;
  
  // Reset states
  progress.value = 0;
  
  // Step 1: Show pointer and move it
  isPointerActive.value = true;
  
  // Step 2: After pointer "clicks", start the action
  actionTimeout = setTimeout(() => {
    status.value = 'loading';
    isPointerActive.value = false;
    
    // Custom logic per type
    let duration = 2000;
    if (props.type === 'upload') duration = 3500;
    if (props.type === 'saas') duration = 2500;
    if (props.type === 'ai') duration = 3000;
    if (props.type === 'admin') duration = 2500;
    if (props.type === 'infinite-scroll') duration = 2000;
    if (props.type === 'wizard') duration = 2000;
    if (props.type === 'auto-save') duration = 1500;
    if (props.type === 'form-validation') duration = 2000;
    if (props.type === 'form-login') duration = 2000;
    if (props.type === 'form-settings') duration = 1500;
    if (props.type === 'basic-save') duration = 1500;
    if (props.type === 'basic-delete') duration = 1500;
    
    if (props.type === 'upload' || props.type === 'admin' || props.type === 'infinite-scroll') {
      const interval = setInterval(() => {
        progress.value += 10;
        if (progress.value >= 100) {
          clearInterval(interval);
          status.value = 'success';
          resetTimeout = setTimeout(reset, 3000);
        }
      }, props.type === 'upload' ? 150 : 120);
    } else {
      setTimeout(() => {
        status.value = 'success';
        resetTimeout = setTimeout(reset, 3000);
      }, duration);
    }
  }, 1500); // Wait for pointer animation
};

const reset = () => {
  status.value = 'idle';
  progress.value = 0;
  isPointerActive.value = false;
  if (isVisible.value) startSimulation();
};

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      isVisible.value = true;
      reset(); // Trigger initial simulation
    } else {
      isVisible.value = false;
      clearTimeout(resetTimeout);
      clearTimeout(actionTimeout);
      status.value = 'idle';
      isPointerActive.value = false;
    }
  }, { threshold: 0.5 });
  
  if (containerRef.value) observer.observe(containerRef.value);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  clearTimeout(resetTimeout);
  clearTimeout(actionTimeout);
});
</script>

<template>
  <div ref="containerRef" class="animation-container p-8 rounded-4xl border border-(--vp-c-divider) bg-(--vp-c-bg-soft) shadow-xl overflow-hidden relative group transition-all duration-500 min-h-[300px] flex flex-col justify-center">
    <div class="absolute inset-0 bg-linear-to-tr from-brand/5 to-accent/5 opacity-50"></div>
    
    <!-- Simulated Pointer (Windows Style: White with Black Outline) -->
    <div v-show="isPointerActive" class="simulated-pointer absolute z-50 pointer-events-none transition-all duration-1000 ease-in-out animate-pointer-move">
      <div class="relative">
        <!-- Using custom SVG for real Windows pointer look -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
          <path d="M5.5 3.5V18.5L9.5 14.5L12 20.5L14.5 19.5L12 13.5H18.5L5.5 3.5Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <div class="click-ripple absolute top-1 left-1 w-10 h-10 rounded-full bg-brand/40 -translate-x-1/2 -translate-y-1/2 animate-ripple" style="animation-delay: 1s;"></div>
      </div>
    </div>

    <!-- Animation Area -->
    <div class="relative z-10 w-full flex flex-col items-center">
      
      <!-- Type Label -->
      <div class="absolute top-0 right-0 px-3 py-1 rounded-full bg-brand/10 text-brand text-[8px] font-black uppercase tracking-widest border border-brand/20">
        {{ type.replace('-', ' ') }}
      </div>

      <!-- Scenarios -->
      <div v-if="type === 'cart'" class="w-full flex flex-col items-center gap-6 p-4">
        <div class="relative">
          <i class="fa-solid fa-cart-shopping text-6xl transition-all duration-500" :class="status === 'success' ? 'text-brand scale-110' : 'text-brand/20'"></i>
          <div v-if="status === 'success'" class="absolute -top-3 -right-3 w-8 h-8 bg-accent text-xs text-white flex items-center justify-center font-black rounded-full animate-bounce shadow-lg border-2 border-white/10">1</div>
        </div>
        <div class="simulated-button px-10 py-4 rounded-2xl bg-brand text-white font-black text-sm shadow-xl transition-all relative overflow-hidden" :class="{ 'scale-95 brightness-90': status === 'loading' || isPointerActive }">
          <span v-if="status === 'idle'">ADD TO CART</span>
          <span v-else-if="status === 'loading'">ADDING...</span>
          <span v-else-if="status === 'success'">ITEM ADDED!</span>
          <div v-if="status === 'loading'" class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <div v-else-if="type === 'dashboard'" class="w-full max-w-[340px] p-6 space-y-6">
         <div class="grid grid-cols-2 gap-4">
           <div v-for="i in 4" :key="i" class="p-4 bg-(--vp-c-bg) border border-(--vp-c-divider) rounded-2xl overflow-hidden relative">
              <div class="h-2 w-12 bg-brand/10 rounded-full mb-3"></div>
              <div class="h-5 w-full bg-linear-to-r from-transparent via-brand/10 to-transparent rounded-lg" :class="{ 'animate-shimmer-fast': status === 'loading' }"></div>
           </div>
         </div>
         <div class="simulated-button py-3 rounded-2xl border-2 border-brand/20 text-brand font-black text-xs transition-all flex items-center justify-center gap-3" :class="{ 'bg-brand/5': status === 'loading' }">
           <i class="fa-solid fa-sync" :class="{ 'animate-spin': status === 'loading' }"></i> 
           {{ status === 'loading' ? 'REFRESHING ASYNC DATA...' : 'REFRESH DASHBOARD' }}
         </div>
      </div>

      <div v-else-if="type === 'search'" class="w-full max-w-[340px] p-4">
        <div class="relative mb-6">
          <div class="w-full h-14 bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-2xl px-12 flex items-center text-sm opacity-50 relative overflow-hidden">
            <i class="fa-solid fa-search absolute left-4 opacity-40"></i>
            <span v-if="isVisible" class="animate-typewriter overflow-hidden whitespace-nowrap block" >searching for components...</span>
            <div v-if="status === 'loading'" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand">
              <i class="fa-solid fa-circle-notch animate-spin"></i>
            </div>
          </div>
        </div>
        <div v-if="status === 'success'" class="space-y-3 animate-fade-in-up">
          <div v-for="i in 3" :key="i" class="p-4 bg-(--vp-c-bg) border border-(--vp-c-divider) rounded-2xl flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center text-brand text-[10px]"><i class="fa-solid fa-cube"></i></div>
              <div class="h-2 w-28 bg-brand/10 rounded-full"></div>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] opacity-20"></i>
          </div>
        </div>
      </div>

      <div v-else-if="type === 'saas'" class="w-full flex flex-col items-center p-6 gap-8">
        <!-- SaaS Subscription Management -->
        <div class="plan-card w-56 p-8 rounded-4xl bg-(--vp-c-bg) border-2 border-(--vp-c-divider) shadow-2xl relative transition-all duration-500 scale-100" :class="{ 'border-accent -translate-y-4 shadow-accent/20': status === 'success' }">
           <div class="flex items-center justify-between mb-6">
             <div class="h-2.5 w-16 bg-accent/20 rounded-full"></div>
             <div class="badge-upgrade px-3 py-1 rounded-full text-[10px] font-black bg-accent text-white transition-opacity" :class="status === 'success' ? 'opacity-100' : 'opacity-0'">PRO ACTIVE</div>
           </div>
           <div class="h-12 w-full bg-linear-to-br from-brand/5 to-accent/5 rounded-2xl mb-6 border border-(--vp-c-divider) animate-pulse" v-if="status === 'loading'"></div>
           <div v-else class="h-12 w-full bg-linear-to-br from-(--vp-c-bg-soft) to-(--vp-c-bg) rounded-2xl mb-6 border border-(--vp-c-divider)"></div>
           <div class="space-y-3">
             <div class="h-2.5 w-full bg-(--vp-c-divider)/40 rounded-full"></div>
             <div class="h-2.5 w-3/4 bg-(--vp-c-divider)/40 rounded-full"></div>
           </div>
        </div>
        <div class="simulated-button w-full max-w-[240px] py-4 rounded-2xl bg-brand text-white font-black text-sm shadow-xl flex items-center justify-center relative overflow-hidden" :class="{ 'scale-95 brightness-90': status === 'loading' || isPointerActive }">
           {{ status === 'loading' ? 'PROCESSING PAYMENT...' : status === 'success' ? 'PAYMENT SUCCESS' : 'UPGRADE TO PRO' }}
           <div v-if="status === 'loading'" class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <div v-else-if="type === 'ai'" class="w-full max-w-[340px] flex flex-col gap-4 p-4 min-h-[180px] justify-end">
        <!-- AI Message Streaming -->
        <div class="user-bubble ml-auto p-4 bg-brand/10 border border-brand/20 rounded-3xl rounded-tr-none text-[10px] font-mono shadow-sm transition-all duration-300" :class="{ 'opacity-40': status === 'loading' }">
          "Build a high-end AI dashboard..."
        </div>
        <div class="ai-bubble p-5 bg-(--vp-c-bg) border border-(--vp-c-divider) rounded-3xl rounded-tl-none shadow-2xl relative min-h-[100px] transition-all duration-500 overflow-hidden" :class="status === 'idle' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'">
           <div v-if="status === 'loading'" class="typing-loader flex gap-1.5 mb-2 absolute top-4 right-6">
              <div class="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce" style="animation-delay: 0.2s;"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce" style="animation-delay: 0.4s;"></div>
           </div>
           <div class="text-[10px] leading-relaxed text-brand font-black font-mono flex flex-wrap gap-x-2">
             <span v-for="(word, i) in aiWords" :key="i" class="word-span opacity-0" :class="{ 'animate-word-in': status === 'loading' || status === 'success' }" :style="`animation-delay: ${0.5 + i * 0.15}s; animation-fill-mode: forwards;`">{{ word }}</span>
           </div>
           <div class="absolute inset-0 bg-linear-to-t from-(--vp-c-bg) to-transparent h-1/2 top-1/2 opacity-20 pointer-events-none"></div>
        </div>
        <div class="simulated-button w-full h-1 py-1 rounded bg-brand/5 opacity-0">TRIGGER</div>
      </div>

      <div v-else-if="type === 'admin'" class="w-full max-w-[320px] p-4 flex flex-col items-center">
        <!-- Bulk Operations -->
        <div class="grid grid-cols-4 gap-3 mb-8 w-full">
          <div v-for="i in 12" :key="i" class="admin-item h-12 rounded-2xl bg-(--vp-c-bg) border-2 border-(--vp-c-divider) flex items-center justify-center relative overflow-hidden transition-all duration-700" :class="{ 'opacity-0 scale-50 -translate-y-10': Boolean(status === 'loading' || status === 'success') && i <= 8 && i % 2 === 0 }" :style="`transition-delay: ${(i % 3) * 0.2}s;`" >
             <i v-if="i <= 8 && i % 2 === 0" class="fa-solid fa-trash text-[10px] text-red-500/20"></i>
             <div v-else class="w-5 h-5 rounded-lg bg-brand/10 border border-brand/20"></div>
          </div>
        </div>
        <div class="w-full h-3 bg-brand/5 border border-brand/10 rounded-full mb-8 overflow-hidden relative">
           <div class="h-full bg-linear-to-r from-brand to-accent transition-all duration-300" :style="`width: ${progress}%`"></div>
        </div>
        <div class="simulated-button w-full py-4 rounded-2xl bg-brand text-white font-black text-sm shadow-xl flex items-center justify-center overflow-hidden" :class="{ 'scale-95 brightness-90': status === 'loading' || isPointerActive }">
           {{ status === 'loading' ? 'PROCESSING DELETIONS...' : status === 'success' ? '8 ITEMS DELETED' : 'DELETE 8 SELECTED' }}
        </div>
      </div>

      <div v-else-if="type === 'optimistic'" class="w-full flex flex-col items-center p-6">
         <div class="text-6xl mb-8 transition-all duration-500" :class="status === 'loading' || status === 'success' ? 'scale-125 shadow-2xl' : 'grayscale opacity-20'"><i class="fa-solid fa-heart text-red-500"></i></div>
         <div class="simulated-button group flex items-center gap-4 px-10 py-5 rounded-full border-2 border-brand/20 bg-brand/5 transition-all shadow-lg overflow-hidden" :class="{ 'scale-95 brightness-90': status === 'loading' || isPointerActive }">
           <i class="fa-solid fa-heart" :class="status === 'loading' || status === 'success' ? 'text-red-500' : 'text-brand/20'"></i>
           <span class="text-sm font-black uppercase text-brand tracking-widest">
             {{ status === 'loading' ? 'OPTIMISTIC LIKE...' : status === 'success' ? 'LIKED!' : 'LIKE POST' }}
           </span>
         </div>
      </div>

      <div v-else-if="type === 'upload'" class="w-full max-w-[300px] p-4">
         <div class="p-8 bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-[2.5rem] flex flex-col items-center shadow-inner mb-6 relative overflow-hidden transition-all duration-500" :class="{ 'border-brand/30': status === 'loading' }">
           <i class="fa-solid fa-file-arrow-up text-5xl mb-4 transition-colors duration-500" :class="status === 'loading' ? 'text-brand' : 'opacity-20'"></i>
           <div class="text-xs font-mono font-bold opacity-40">report_v2_final.pdf</div>
           <div v-if="status === 'loading'" class="absolute inset-0 bg-brand/5 flex items-center justify-center backdrop-blur-[2px]">
              <div class="text-4xl font-black text-brand tracking-tighter">{{ progress }}%</div>
           </div>
         </div>
         <div v-if="status === 'loading' || status === 'success'" class="w-full h-2.5 bg-(--vp-c-bg-soft) rounded-full mb-6 overflow-hidden border border-(--vp-c-divider)">
           <div class="h-full bg-linear-to-r from-brand to-accent transition-all duration-300" :style="`width: ${progress}%`"></div>
         </div>
         <div class="simulated-button w-full py-4 rounded-2xl bg-brand text-white font-black text-sm shadow-xl flex items-center justify-center overflow-hidden" :class="{ 'scale-95 brightness-90': status === 'loading' || isPointerActive }">
           {{ status === 'loading' ? 'UPLOADING...' : status === 'success' ? 'UPLOAD COMPLETE' : 'START UPLOAD' }}
         </div>
      </div>

      <div v-else-if="type === 'form'" class="w-full max-w-[340px] p-6">
         <div class="space-y-4 mb-8">
           <div class="h-12 w-full bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-2xl px-4 flex items-center">
              <div class="h-2.5 w-32 bg-brand/10 rounded-full"></div>
           </div>
           <div class="h-28 w-full bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-2xl p-6">
              <div class="space-y-3">
                <div class="h-2.5 w-full bg-brand/5 rounded-full"></div>
                <div class="h-2.5 w-full bg-brand/5 rounded-full"></div>
                <div class="h-2.5 w-2/3 bg-brand/5 rounded-full"></div>
              </div>
           </div>
         </div>
         <div class="flex gap-3">
           <div class="simulated-button flex-1 py-4 rounded-2xl bg-brand text-white font-black text-sm shadow-xl flex items-center justify-center overflow-hidden" :class="{ 'scale-95 brightness-90': status === 'loading' || isPointerActive }">
             {{ status === 'loading' ? 'SAVING DRAFT...' : 'SAVE CHANGES' }}
           </div>
           <div v-if="status === 'success'" class="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center animate-fade-in-up border-2 border-green-500/20">
             <i class="fa-solid fa-check text-xl"></i>
           </div>
         </div>
      </div>

      <!-- PRODUCTION SHOWCASE -->
      <div v-else-if="type === 'production'" class="w-full h-48 flex items-center justify-center gap-14 relative p-10">
         <div class="flex flex-col items-center gap-4">
           <div class="w-20 h-20 rounded-4xl bg-brand/5 border-2 border-brand/20 flex items-center justify-center text-brand relative shadow-lg" :class="{ 'animate-pulse': status === 'loading' }">
             <i class="fa-solid fa-server text-3xl"></i>
             <div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-(--vp-c-bg) shadow-sm"></div>
           </div>
           <span class="text-[10px] font-black opacity-30 tracking-widest uppercase">SERVER</span>
         </div>
         
         <div class="flex-1 max-w-[120px] flex flex-col gap-4">
            <div v-for="i in 3" :key="i" class="h-2 w-full bg-brand/5 rounded-full overflow-hidden border border-brand/10">
               <div v-if="status === 'loading'" class="h-full bg-brand w-0 animate-fill-progress" :style="`animation-delay: ${i * 0.2}s`"></div>
            </div>
         </div>

         <div class="flex flex-col items-center gap-4">
           <div class="w-20 h-20 rounded-4xl bg-accent/5 border-2 border-accent/20 flex items-center justify-center text-accent relative shadow-lg" :class="{ 'animate-pulse': status === 'loading' }">
             <i class="fa-solid fa-mobile-screen-button text-3xl"></i>
             <div v-if="status === 'success'" class="absolute -top-1 -left-1 w-5 h-5 bg-brand rounded-full border-4 border-(--vp-c-bg) shadow-sm animate-ping"></div>
           </div>
           <span class="text-[10px] font-black opacity-30 tracking-widest uppercase">CLIENT</span>
         </div>
      </div>

      <!-- NEW: Infinite Scroll -->
      <div v-else-if="type === 'infinite-scroll'" class="w-full max-w-[340px] p-4 space-y-3">
        <div v-for="i in 3" :key="i" class="p-4 bg-(--vp-c-bg) border border-(--vp-c-divider) rounded-2xl flex items-center gap-4">
           <div class="w-10 h-10 rounded-xl bg-brand/5"></div>
           <div class="h-2 w-32 bg-brand/10 rounded-full"></div>
        </div>
        <div v-if="status === 'loading'" class="p-4 bg-(--vp-c-bg) border border-dashed border-brand/30 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
           <i class="fa-solid fa-circle-notch animate-spin text-brand"></i>
           <span class="text-[10px] font-bold text-brand/60">LOADING MORE...</span>
        </div>
        <div v-if="status === 'success'" class="p-4 bg-(--vp-c-bg) border border-brand/20 rounded-2xl flex items-center gap-4 animate-fade-in-up">
           <div class="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand"><i class="fa-solid fa-plus"></i></div>
           <div class="h-2 w-40 bg-brand/20 rounded-full"></div>
        </div>
        <div class="simulated-button h-1 opacity-0">TRIGGER</div>
      </div>

      <!-- NEW: Sequential Wizard -->
      <div v-else-if="type === 'wizard'" class="w-full max-w-[340px] p-6">
        <div class="flex items-center justify-between mb-8 relative">
           <div class="absolute top-1/2 left-0 w-full h-1 bg-(--vp-c-divider) -translate-y-1/2 z-0"></div>
           <div class="absolute top-1/2 left-0 h-1 bg-brand -translate-y-1/2 z-0 transition-all duration-1000" :style="`width: ${status === 'loading' ? '50%' : status === 'success' ? '100%' : '0%'}`"></div>
           <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full border-2 z-10 flex items-center justify-center text-[10px] font-bold transition-all duration-500" :class="status === 'success' || (status === 'loading' && i <= 2) ? 'bg-brand border-brand text-white' : 'bg-(--vp-c-bg) border-(--vp-c-divider)'">
             {{ i }}
           </div>
        </div>
        <div class="p-6 bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-3xl min-h-[80px] flex flex-col justify-center">
            <div v-if="status === 'loading'" class="h-2 w-3/4 bg-brand/10 rounded-full mb-3 animate-pulse"></div>
            <div v-else-if="status === 'success'" class="text-xs font-bold text-brand animate-fade-in-up text-center">FINAL STEP READY!</div>
            <div v-else class="h-2 w-1/2 bg-(--vp-c-divider)/40 rounded-full"></div>
        </div>
        <div class="simulated-button mt-6 w-full py-3 rounded-2xl bg-brand text-white font-black text-xs flex items-center justify-center">
           {{ status === 'loading' ? 'MOVING TO STEP 2...' : 'NEXT STEP' }}
        </div>
      </div>

      <!-- NEW: Background Auto-save -->
      <div v-else-if="type === 'auto-save'" class="w-full max-w-[340px] p-6 bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-[2.5rem] shadow-inner relative">
         <div class="absolute top-4 right-6 flex items-center gap-2">
            <div v-if="status === 'loading'" class="flex items-center gap-2 text-brand animate-pulse">
               <i class="fa-solid fa-cloud-arrow-up text-[10px]"></i>
               <span class="text-[8px] font-black tracking-tight">SAVING...</span>
            </div>
            <div v-else-if="status === 'success'" class="flex items-center gap-2 text-green-500">
               <i class="fa-solid fa-check-circle text-[10px]"></i>
               <span class="text-[8px] font-black tracking-tight">SAVED</span>
            </div>
            <div v-else class="text-(--vp-c-divider) flex items-center gap-2">
               <i class="fa-solid fa-cloud text-[10px]"></i>
               <span class="text-[8px] font-black tracking-tight">IDLE</span>
            </div>
         </div>
         <div class="space-y-3 pt-4">
            <div class="h-4 w-3/4 bg-brand/10 rounded-lg animate-typewriter-short" v-if="isVisible"></div>
            <div class="h-4 w-1/2 bg-brand/5 rounded-lg animate-typewriter-short" style="animation-delay: 2s" v-if="isVisible"></div>
         </div>
         <div class="simulated-button h-1 w-1 opacity-0">TRIGGER</div>
      </div>

      <!-- NEW: Form Validation -->
      <div v-else-if="type === 'form-validation'" class="w-full max-w-[340px] p-6 space-y-4">
         <div v-for="i in 2" :key="i" class="space-y-2">
            <div class="h-10 w-full bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-xl px-4 flex items-center">
               <div class="h-2 w-20 bg-brand/10 rounded-full"></div>
            </div>
            <div v-if="status === 'loading' && i === 2" class="text-[9px] font-bold text-red-500 animate-fade-in-up">
               <i class="fa-solid fa-triangle-exclamation"></i> INVALID EMAIL FORMAT
            </div>
         </div>
         <div class="simulated-button w-full py-3.5 rounded-2xl bg-brand text-white font-black text-xs flex items-center justify-center shadow-lg transition-all" :class="{ 'bg-red-500': status === 'loading' }">
            {{ status === 'loading' ? 'CHECKING ERRORS...' : 'SIGN UP' }}
         </div>
      </div>

      <!-- NEW: Login Flow -->
      <div v-else-if="type === 'form-login'" class="w-full max-w-[280px] p-8 bg-(--vp-c-bg) border-2 border-(--vp-c-divider) rounded-4xl shadow-2xl relative overflow-hidden">
         <div class="flex flex-col items-center gap-6">
            <div class="w-16 h-16 rounded-full bg-brand/5 border-2 border-brand/20 flex items-center justify-center text-brand">
               <i class="fa-solid fa-user-lock text-2xl"></i>
            </div>
            <div class="space-y-3 w-full">
               <div class="h-1 w-full bg-brand/10 rounded-full"></div>
               <div class="h-1 w-2/3 bg-brand/10 rounded-full"></div>
            </div>
            <div class="simulated-button w-full py-3 rounded-xl bg-brand text-white font-black text-[10px] flex items-center justify-center relative overflow-hidden">
               {{ status === 'loading' ? 'AUTHENTICATING...' : status === 'success' ? 'WELCOME BACK!' : 'SIGN IN' }}
               <div v-if="status === 'loading'" class="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
         </div>
         <div v-if="status === 'success'" class="absolute inset-0 bg-brand/5 backdrop-blur-[1px] flex items-center justify-center animate-fade-in">
            <div class="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg animate-bounce">
               <i class="fa-solid fa-check text-xl"></i>
            </div>
         </div>
      </div>

      <!-- NEW: Settings Form -->
      <div v-else-if="type === 'form-settings'" class="w-full max-w-[340px] p-6 space-y-4">
         <div class="flex items-center justify-between p-4 bg-(--vp-c-bg) border border-(--vp-c-divider) rounded-2xl" v-for="i in 2" :key="i">
            <div class="h-2 w-24 bg-brand/10 rounded-full"></div>
            <div class="w-10 h-5 bg-brand/20 rounded-full relative">
               <div class="absolute right-1 top-1 w-3 h-3 bg-brand rounded-full transition-all" :class="{ 'translate-x-0': status !== 'success', '-translate-x-5 opacity-40': status === 'success' }"></div>
            </div>
         </div>
         <div class="simulated-button w-full py-3.5 rounded-2xl bg-brand text-white font-black text-xs flex items-center justify-center shadow-xl">
            {{ status === 'loading' ? 'UPDATING...' : status === 'success' ? 'SETTINGS SAVED!' : 'SAVE SETTINGS' }}
         </div>
      </div>

      <!-- NEW: Basic Save -->
      <div v-else-if="type === 'basic-save'" class="w-full flex flex-col items-center p-6">
         <div class="w-20 h-20 rounded-3xl bg-brand/5 border-2 border-brand/20 flex items-center justify-center text-brand mb-8" :class="{ 'animate-pulse': status === 'loading' }">
            <i class="fa-solid fa-floppy-disk text-2xl"></i>
         </div>
         <div class="simulated-button px-12 py-4 rounded-2xl bg-brand text-white font-black text-sm shadow-xl">
            {{ status === 'loading' ? 'SAVING...' : status === 'success' ? 'SAVED!' : 'SAVE CHANGES' }}
         </div>
      </div>

      <!-- NEW: Basic Delete -->
      <div v-else-if="type === 'basic-delete'" class="w-full flex flex-col items-center p-6">
         <div class="w-20 h-20 rounded-3xl bg-red-500/5 border-2 border-red-500/20 flex items-center justify-center text-red-500 mb-8" :class="{ 'opacity-0 scale-50 transition-all duration-700': status === 'success' }">
            <i class="fa-solid fa-trash-can text-2xl"></i>
         </div>
         <div class="simulated-button px-12 py-4 rounded-2xl bg-red-500 text-white font-black text-sm shadow-xl" :class="{ 'opacity-40': status === 'loading' }">
            {{ status === 'loading' ? 'DELETING...' : status === 'success' ? 'DELETED' : 'DELETE ITEM' }}
         </div>
      </div>

    </div>

    <!-- Status Ticker -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-6 text-[8px] font-black text-brand/20 uppercase tracking-[0.25em] z-0">
      <span class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-current"></div> AUTO-FLOW: ON</span>
      <span class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-current"></div> SIMULATION ACTIVE</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes pointer-move {
  0% { top: 100%; left: 0%; opacity: 0; transform: scale(1.2); }
  20% { opacity: 1; }
  80% { top: 82%; left: 50%; transform: scale(1); }
  90% { top: 86%; left: 50%; transform: scale(0.92); }
  100% { top: 82%; left: 50%; transform: scale(1); }
}

.animate-pointer-move {
  animation: pointer-move 1.5s ease-in-out forwards;
}

@keyframes ripple {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}

.animate-ripple {
  animation: ripple 0.6s ease-out forwards;
}

@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}

.animate-typewriter {
  animation: typewriter 1s steps(25) forwards;
  animation-delay: 0.5s;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 1s infinite linear;
}

@keyframes shimmer-fast {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer-fast {
  animation: shimmer-fast 0.8s infinite linear;
}

@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fill-progress {
  0% { width: 0; }
  100% { width: 100%; }
}

.animate-fill-progress {
  animation: fill-progress 1.5s forwards cubic-bezier(0.65, 0, 0.35, 1);
}

@keyframes word-in {
  from { opacity: 0; transform: translateY(5px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-word-in {
  animation: word-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes typewriter-short {
  from { width: 0; opacity: 0; }
  to { width: 100%; opacity: 1; }
}

.animate-typewriter-short {
  animation: typewriter-short 1s steps(20) forwards;
}

.simulated-button {
  user-select: none;
  pointer-events: none;
}
</style>
