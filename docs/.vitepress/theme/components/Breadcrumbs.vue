<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";

const { page, theme } = useData();

const breadcrumbs = computed(() => {
  const crumbs = [];
  const sidebar = theme.value.sidebar || [];
  const currentPath =
    "/" +
    page.value.relativePath.replace(/\.md$/, "").replace(/index$/, "");

  // 1. Home
  crumbs.push({ text: "Home", link: "/" });

  // 2. Sidebar Section (if found)
  for (const group of sidebar) {
    if (group.items) {
      const hasItem = group.items.some((item: any) => {
        const itemLink = item.link?.startsWith("/") ? item.link : "/" + item.link;
        const normalizedPath = currentPath.endsWith("/") ? currentPath : currentPath + "/";
        const normalizedLink = itemLink?.endsWith("/") ? itemLink : itemLink + "/";
        return normalizedLink === normalizedPath;
      });

      if (hasItem) {
        // Remove HTML tags (icons) and emoji characters for a clean text breadcrumb
        const text = group.text
          .replace(/<[^>]*>/g, "")
          .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
          .trim();
        crumbs.push({ text, link: null });
        break;
      }
    }
  }

  // 3. Current Page
  const title = (
    page.value.title ||
    page.value.relativePath
      .split("/")
      .pop()!
      .replace(".md", "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  )
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ""
    )
    .trim();

  crumbs.push({ text: title, link: null });

  return crumbs;
});
</script>

<template>
  <nav
    v-if="breadcrumbs.length > 1"
    class="afs-breadcrumbs"
    aria-label="Breadcrumb"
  >
    <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        <a
          v-if="crumb.link"
          :href="crumb.link"
          class="breadcrumb-link"
          itemprop="item"
        >
          <span itemprop="name">{{ crumb.text }}</span>
        </a>
        <span v-else class="breadcrumb-current" itemprop="name">{{ crumb.text }}</span>
        <meta itemprop="position" :content="(index + 1).toString()" />
        <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">
          <i class="fa-solid fa-chevron-right"></i>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.afs-breadcrumbs {
  margin-bottom: 2rem;
  font-size: 0.8rem;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
  align-items: center;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-text-2);
}

.breadcrumb-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--vp-c-brand-1);
}

.breadcrumb-current {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.breadcrumb-separator {
  opacity: 0.3;
  font-size: 0.7rem;
}
</style>
