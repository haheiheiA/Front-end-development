<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useJobStore } from '../stores/job'
import {
  formatJobDate,
  formatJobSalary,
  JOB_SOURCE_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
} from '../utils/job'

const jobStore = useJobStore()
const { jobs } = storeToRefs(jobStore)
</script>

<template>
  <section class="space-y-6">
    <header>
      <p class="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">JobTrack</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">我的岗位</h1>
      <p class="mt-2 text-sm text-ink-muted">共 {{ jobs.length }} 个岗位记录</p>
    </header>

    <div class="grid gap-4 xl:grid-cols-2">
      <article
        v-for="job in jobs"
        :key="job.id"
        class="surface-card flex flex-col p-5 transition-colors duration-150 hover:border-line-strong"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-xs font-medium text-ink-subtle">{{ job.company }}</p>
            <h2 class="mt-1 truncate text-base font-semibold tracking-tight text-ink">
              {{ job.position }}
            </h2>
          </div>

          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium"
            :style="{ color: JOB_STATUS_COLORS[job.status] }"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :style="{ backgroundColor: JOB_STATUS_COLORS[job.status] }"
              aria-hidden="true"
            />
            {{ JOB_STATUS_LABELS[job.status] }}
          </span>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
          <span>{{ job.location ?? '地点未填写' }}</span>
          <span class="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
          <span>{{ formatJobSalary(job.salary) }}</span>
        </div>

        <div
          class="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-subtle"
        >
          <span>{{ formatJobDate(job.appliedAt) }}</span>
          <span>{{ JOB_SOURCE_LABELS[job.source] }}</span>
        </div>
      </article>
    </div>
  </section>
</template>