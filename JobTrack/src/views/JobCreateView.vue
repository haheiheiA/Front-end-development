<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import JobForm from '../components/job/JobForm.vue'
import { useJobStore } from '../stores/job'
import type { Job } from '../types/job'

const router = useRouter()
const jobStore = useJobStore()
const saveError = ref('')

function handleSave(job: Job) {
  saveError.value = ''

  try {
    jobStore.addJob(job)
    router.push('/jobs')
  } catch {
    saveError.value = '保存失败，请稍后重试。'
  }
}

function handleCancel() {
  router.push('/jobs')
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <p class="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">JobTrack</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">添加岗位</h1>
      <p class="mt-2 text-sm text-ink-muted">记录一个新的求职目标。</p>
    </header>

    <JobForm
      submit-label="保存岗位"
      :error-message="saveError"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </section>
</template>