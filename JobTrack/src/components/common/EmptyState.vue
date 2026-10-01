<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    role="status"
    class="rounded-card border border-dashed border-line bg-surface-soft p-8 text-center"
  >
    <p class="text-sm font-semibold text-ink">{{ title }}</p>
    <p v-if="description" class="mt-2 text-sm text-ink-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5 flex justify-center">
      <slot />
    </div>
  </div>
</template>
