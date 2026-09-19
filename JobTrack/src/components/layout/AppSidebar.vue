<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    label: '概览',
    to: '/dashboard',
    icon: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  },
  {
    label: '岗位',
    to: '/jobs',
    icon: 'M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1m-9 0h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h10',
  },
] as const

function isNavActive(path: string) {
  return path === '/dashboard' ? route.path === path : route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <aside
    class="hidden border-r border-line bg-surface/95 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col"
  >
    <div class="flex h-[4.25rem] items-center border-b border-line px-5">
      <RouterLink to="/dashboard" class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-control bg-brand text-sm font-semibold text-white shadow-sm"
        >
          J
        </span>
        <span class="flex flex-col leading-none">
          <span class="text-sm font-semibold tracking-tight text-ink">JobTrack</span>
          <span class="mt-1 text-[11px] font-medium text-ink-subtle">个人工作台</span>
        </span>
      </RouterLink>
    </div>

    <div class="flex-1 px-3 py-6">
      <p class="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        Workspace
      </p>

      <nav class="mt-2 space-y-1" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors duration-150"
          :class="
            isNavActive(item.to)
              ? 'bg-brand-soft text-brand ring-1 ring-brand/15'
              : 'text-ink-muted hover:bg-surface-soft hover:text-ink'
          "
          :aria-current="isNavActive(item.to) ? 'page' : undefined"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-[18px] w-[18px] shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>