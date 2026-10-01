<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const emit = defineEmits<{
  toggleMenu: []
}>()
const pageTitle = computed(() => String(route.meta.title ?? 'JobTrack'))
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-sm sm:gap-4 sm:px-6 lg:px-10"
  >
    <button
      type="button"
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:bg-surface-soft lg:hidden"
      aria-label="打开导航菜单"
      @click="emit('toggleMenu')"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>

    <div class="flex min-w-0 items-center gap-2.5 text-sm">
      <span class="font-semibold tracking-tight text-ink">JobTrack</span>
      <span class="text-line-strong">/</span>
      <span class="truncate font-medium text-ink-muted">{{ pageTitle }}</span>
    </div>
  </header>
</template>