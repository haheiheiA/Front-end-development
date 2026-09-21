<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import JobForm from '../components/job/JobForm.vue'
import { useJobStore } from '../stores/job'
import type { Job } from '../types/job'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()
const saveError = ref('')

const jobId = computed(() => String(route.params.id ?? ''))
const job = computed(() => jobStore.getJobById(jobId.value))

function handleSave(updatedJob: Job) {
  saveError.value = ''

  try {
    jobStore.updateJob(updatedJob)
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
      <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">编辑岗位</h1>
      <p class="mt-2 text-sm text-ink-muted">更新岗位信息，保存后立即同步到列表和概览。</p>
    </header>

    <JobForm
      v-if="job"
      :initial-job="job"
      submit-label="保存修改"
      :error-message="saveError"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <div v-else class="surface-card border-dashed bg-surface/70 p-10 text-center">
      <p class="text-sm font-semibold text-ink">岗位不存在</p>
      <p class="mt-2 text-sm text-ink-muted">无法找到 ID 为“{{ jobId }}”的岗位。</p>
      <RouterLink
        to="/jobs"
        class="mt-5 inline-flex h-11 items-center justify-center rounded-control border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
      >
        返回我的岗位
      </RouterLink>
    </div>
  </section>
</template>