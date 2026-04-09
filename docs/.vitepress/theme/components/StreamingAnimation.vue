<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const chunks =
  "The quick brown fox jumps over the lazy dog to demonstrate a streaming AI response.".split(
    " ",
  );
const displayedWords = ref([]);
const isStreaming = ref(false);
const status = ref("idle");
let index = 0;
let timer;

const runSimulation = () => {
  status.value = "loading";
  displayedWords.value = [];
  isStreaming.value = false;
  index = 0;

  // Start streaming after slight delay
  timer = setTimeout(() => {
    status.value = "streaming";
    isStreaming.value = true;
    streamNext();
  }, 800);
};

const streamNext = () => {
  if (index < chunks.length) {
    displayedWords.value.push(chunks[index]);
    index++;
    // random delay for realistic AI feel
    const delay = Math.random() * 80 + 30;
    timer = setTimeout(streamNext, delay);
  } else {
    // Done
    status.value = "success";
    isStreaming.value = false;
    timer = setTimeout(runSimulation, 3000);
  }
};

onMounted(() => {
  runSimulation();
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="chat-mockup">
      <div class="chat-header">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <div class="title">AI Assistant Stream</div>
      </div>
      <div class="chat-body">
        <div class="user-bubble">Can you show me a streaming example?</div>
        <div class="ai-bubble-container" v-if="status !== 'idle'">
          <div class="ai-avatar">
            <i class="fa-solid fa-sparkles text-amber-500"></i>
          </div>
          <div
            class="ai-bubble"
            :class="{ 'is-loading': status === 'loading' }"
          >
            <span v-if="status === 'loading'" class="typing-indicator">
              <span></span><span></span><span></span>
            </span>
            <span v-else class="streamed-text">
              <span
                v-for="(word, i) in displayedWords"
                :key="i"
                class="word-anim"
              >
                {{ word }}
              </span>
              <span v-if="isStreaming" class="cursor"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.chat-mockup {
  width: 100%;
  max-width: 440px;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.chat-header {
  height: 40px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 6px;
  position: relative;
}

.dark .chat-header {
  background: rgba(255, 255, 255, 0.02);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-divider);
}

.dot:nth-child(1) {
  background: #ff5f56;
}
.dot:nth-child(2) {
  background: #ffbd2e;
}
.dot:nth-child(3) {
  background: #27c93f;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.chat-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 200px;
}

.user-bubble {
  align-self: flex-end;
  background: var(--vp-c-brand-1);
  color: white;
  padding: 10px 16px;
  border-radius: 16px;
  border-bottom-right-radius: 4px;
  font-size: 0.9rem;
  max-width: 80%;
}

.ai-bubble-container {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: 90%;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  background: var(--vp-c-brand-soft);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.ai-bubble {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 12px 16px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  min-width: 60px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 6px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--vp-c-text-3);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

.word-anim {
  animation: fadeIn 0.15s ease-out forwards;
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 14px;
  background: var(--vp-c-brand-1);
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 0.8s infinite;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
