<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

const navItems = [
  {
    label: '概览',
    to: '/dashboard',
    icon: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  },
  {
    label: '我的岗位',
    to: '/jobs',
    icon: 'M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1m-9 0h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h10',
  },
  {
    label: '求职进度',
    to: '/progress',
    icon: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
] as const

function isNavActive(path: string) {
  return path === '/dashboard'
    ? route.path === path
    : route.path === path || route.path.startsWith(`${path}/`)
}

function handleNavigate() {
  emit('close')
}
</script>

<template>
  <button
    v-if="open"
    type="button"
    class="fixed inset-0 z-40 bg-ink/25 lg:hidden"
    aria-label="关闭导航菜单"
    @click="emit('close')"
  />

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-line bg-surface/95 lg:z-40 lg:flex lg:shadow-none',
      open ? 'flex shadow-card' : 'hidden',
    ]"
  >
    <div class="flex h-[4.25rem] shrink-0 items-center border-b border-line px-5">
      <RouterLink to="/dashboard" class="flex items-center gap-3" @click="handleNavigate">
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

    <div class="flex-1 overflow-y-auto px-3 py-6">
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
          @click="handleNavigate"
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
