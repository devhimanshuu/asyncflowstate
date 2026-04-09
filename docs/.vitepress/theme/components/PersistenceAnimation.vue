<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const inputValue = ref("");
const isRefreshing = ref(false);
const showLoader = ref(false);
let timer;

const sequence = () => {
  inputValue.value = "";
  isRefreshing.value = false;
  showLoader.value = false;

  // Simulate typing
  setTimeout(() => typeText("Jane Doe"), 500);
};

const typeText = (text) => {
  let i = 0;
  const interval = setInterval(() => {
    inputValue.value += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      // Wait a bit, then refresh page
      timer = setTimeout(triggerRefresh, 1000);
    }
  }, 100);
};

const triggerRefresh = () => {
  isRefreshing.value = true;
  showLoader.value = true;

  // Blank out
  setTimeout(() => {
    // Finish refresh
    showLoader.value = false;
    // Form is immediately restored!
    setTimeout(() => {
      isRefreshing.value = false;
      timer = setTimeout(sequence, 2500);
    }, 800);
  }, 600);
};

onMounted(() => {
  sequence();
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <div class="animation-container">
    <div class="browser-window">
      <div class="browser-header">
        <div class="nav-controls">
          <span class="btn"></span>
          <span class="btn"></span>
          <span class="btn"></span>
        </div>
        <div class="url-bar">
          <span class="refresh-icon" :class="{ spin: showLoader }">↻</span>
          <span>localhost:3000/register</span>
        </div>
      </div>

      <div class="browser-body" :class="{ 'is-loading': showLoader }">
        <div class="mock-form" v-if="!showLoader">
          <div class="form-title">Registration</div>
          <div class="input-group">
            <label>Full Name</label>
            <div
              class="input-field"
              :class="{ 'has-value': inputValue.length > 0 }"
            >
              {{ inputValue
              }}<span
                class="cursor"
                v-if="!isRefreshing && inputValue.length < 8"
                >|</span
              >

              <div v-if="isRefreshing && inputValue.length > 0" class="badge">
                <span class="badge-icon"
                  ><i class="fa-solid fa-bolt text-yellow-400"></i
                ></span>
                Restored
              </div>
            </div>
          </div>
          <div class="submit-btn">Submit</div>
        </div>
        <div class="loader" v-else>
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 3rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.browser-window {
  width: 100%;
  max-width: 420px;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.15);
}

.browser-header {
  height: 44px;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
}
.dark .browser-header {
  background: rgba(255, 255, 255, 0.03);
}

.nav-controls {
  display: flex;
  gap: 6px;
}
.btn {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-divider);
}
.btn:nth-child(1) {
  background: #ff5f56;
}
.btn:nth-child(2) {
  background: #ffbd2e;
}
.btn:nth-child(3) {
  background: #27c93f;
}

.url-bar {
  flex: 1;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  height: 26px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 10px;
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
}

.refresh-icon {
  font-size: 0.9rem;
}
.refresh-icon.spin {
  animation: spin 0.6s linear infinite;
  color: var(--vp-c-brand-1);
}

.browser-body {
  padding: 30px;
  min-height: 240px;
  position: relative;
}
.browser-body.is-loading {
  background: var(--vp-c-bg-soft);
}

.mock-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 6px;
  display: block;
}

.input-field {
  height: 40px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  position: relative;
  transition: all 0.3s ease;
}

.input-field.has-value {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.cursor {
  animation: blink 1s step-end infinite;
}

.badge {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--vp-c-success-soft, rgba(16, 185, 129, 0.15));
  color: var(--vp-c-success-1, #10b981);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.submit-btn {
  background: var(--vp-c-brand-1);
  color: white;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.5;
}

.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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

@keyframes popIn {
  0% {
    transform: translateY(-50%) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
}
</style>
