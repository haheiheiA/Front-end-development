<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => String(route.meta.title ?? 'JobTrack'))
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-[4.25rem] items-center gap-4 border-b border-line bg-surface/90 px-6 backdrop-blur-sm lg:px-10"
  >
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-ink-muted lg:hidden"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </div>

    <div class="flex min-w-0 items-center gap-2.5 text-sm">
      <span class="font-semibold tracking-tight text-ink">JobTrack</span>
      <span class="text-line-strong">/</span>
      <span class="truncate font-medium text-ink-muted">{{ pageTitle }}</span>
    </div>
  </header>
</template>