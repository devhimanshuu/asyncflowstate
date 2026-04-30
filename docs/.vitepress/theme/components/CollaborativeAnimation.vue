<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const docState = ref("Initial Document");
const cursorA = ref({ visible: false, text: "Adding title..." });
const cursorB = ref({ visible: false, text: "Editing body..." });
const crdtState = ref("idle");

let timer;

const runSimulation = () => {
  docState.value = "Initial Document";
  crdtState.value = "idle";

  setTimeout(() => {
    // Both start typing
    cursorA.value.visible = true;
    cursorB.value.visible = true;

    setTimeout(() => {
      // Conflict!
      cursorA.value.visible = false;
      cursorB.value.visible = false;
      crdtState.value = "merging";

      setTimeout(() => {
        // Resolved
        crdtState.value = "resolved";
        docState.value = "New Title\nEdited body...";
        setTimeout(runSimulation, 2500);
      }, 800);
    }, 1500);
  }, 1000);
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
    <div class="collab-panel">
      <div class="users">
        <div class="user user-a">
          <div class="avatar">A</div>
          User A
        </div>
        <div class="crdt-status" :class="crdtState">
          <i class="fa-solid fa-code-merge" v-if="crdtState === 'merging'"></i>
          <i
            class="fa-solid fa-check-double"
            v-if="crdtState === 'resolved'"
          ></i>
          {{
            crdtState === "idle"
              ? "CRDT Engine"
              : crdtState === "merging"
                ? "Merging Conflict..."
                : "LWW Merged ✓"
          }}
        </div>
        <div class="user user-b">
          User B
          <div class="avatar">B</div>
        </div>
      </div>

      <div class="document">
        <div class="content">{{ docState }}</div>

        <div class="cursor cursor-a" v-if="cursorA.visible">
          <div class="line"></div>
          <div class="tag">User A {{ cursorA.text }}</div>
        </div>

        <div class="cursor cursor-b" v-if="cursorB.visible">
          <div class="line"></div>
          <div class="tag">User B {{ cursorB.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-container {
  margin: 2rem 0;
  padding: 2.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  justify-content: center;
}

.collab-panel {
  width: 100%;
  max-width: 450px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.users {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.85rem;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-a .avatar {
  background: #14b8a6;
} /* teal */
.user-b .avatar {
  background: #8b5cf6;
} /* purple */

.crdt-status {
  font-size: 0.75rem;
  font-family: monospace;
  padding: 4px 8px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s;
}

.crdt-status.merging {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-color: #f59e0b;
}
.crdt-status.resolved {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border-color: #14b8a6;
}

.document {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  height: 120px;
  padding: 1rem;
  position: relative;
  font-family: monospace;
  white-space: pre-wrap;
  color: var(--vp-c-text-1);
}

.cursor {
  position: absolute;
}

.cursor-a {
  top: 20px;
  left: 40px;
}
.cursor-b {
  top: 60px;
  right: 40px;
}

.line {
  width: 2px;
  height: 16px;
  animation: blink 1s infinite;
}

.cursor-a .line {
  background: #14b8a6;
}
.cursor-b .line {
  background: #8b5cf6;
}

.tag {
  position: absolute;
  top: -20px;
  left: 0;
  padding: 2px 6px;
  color: white;
  font-size: 0.6rem;
  border-radius: 4px;
  white-space: nowrap;
}

.cursor-a .tag {
  background: #14b8a6;
}
.cursor-b .tag {
  background: #8b5cf6;
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
