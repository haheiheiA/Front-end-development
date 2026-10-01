<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-canvas text-ink">
    <AppSidebar :open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="min-h-screen min-w-0 lg:pl-64">
      <AppHeader @toggle-menu="isSidebarOpen = !isSidebarOpen" />

      <main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>