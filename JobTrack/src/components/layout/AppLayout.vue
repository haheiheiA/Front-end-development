<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-canvas text-ink">
    <AppSidebar />

    <div class="min-h-screen min-w-0 lg:pl-64">
      <AppHeader />

      <main class="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>