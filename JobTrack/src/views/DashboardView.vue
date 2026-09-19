<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useJobStore } from '../stores/job'
import type { JobStatus } from '../types/job'
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, JOB_STATUS_ORDER } from '../utils/job'

const jobStore = useJobStore()
const { jobs } = storeToRefs(jobStore)

const statusCounts = computed<Record<JobStatus, number>>(() => {
  const counts: Record<JobStatus, number> = {
    saved: 0,
    applied: 0,
    screening: 0,
    assessment: 0,
    'first-interview': 0,
    'second-interview': 0,
    'hr-interview': 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  }

  for (const job of jobs.value) {
    counts[job.status] += 1
  }

  return counts
})

const metrics = computed(() => {
  const counts = statusCounts.value
  const total = jobs.value.length
  const pending = counts.saved

  return [
    {
      label: '岗位总数',
      value: total,
      detail: '全部求职记录',
    },
    {
      label: '待投递',
      value: pending,
      detail: '尚未提交申请',
    },
    {
      label: '已投递',
      value: total - pending,
      detail: '已进入招聘流程',
    },
    {
      label: '面试中',
      value:
        counts['first-interview'] + counts['second-interview'] + counts['hr-interview'],
      detail: '一面 / 二面 / HR 面',
    },
    {
      label: 'Offer',
      value: counts.offer,
      detail: '已获得录用',
    },
    {
      label: '已结束',
      value: counts.rejected + counts.withdrawn,
      detail: '未通过或主动撤回',
    },
  ]
})
</script>

<template>
  <section class="space-y-6">
    <header>
      <p class="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">JobTrack</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">概览</h1>
      <p class="mt-2 text-sm text-ink-muted">
        当前共有 {{ jobs.length }} 个岗位记录，快速查看求职进度。
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="metric in metrics" :key="metric.label" class="surface-card p-5">
        <p class="text-sm font-medium text-ink-muted">{{ metric.label }}</p>
        <div class="mt-3 flex items-end gap-2">
          <p class="text-3xl font-semibold tracking-[-0.03em] text-ink">{{ metric.value }}</p>
          <span class="pb-1 text-sm text-ink-subtle">个</span>
        </div>
        <p class="mt-3 text-xs text-ink-subtle">{{ metric.detail }}</p>
      </article>
    </div>

    <section class="surface-card p-6 lg:p-8">
      <div class="flex items-start justify-between gap-6">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-ink">招聘进度</h2>
          <p class="mt-1 text-sm text-ink-muted">按当前状态统计岗位数量</p>
        </div>
        <span class="text-xs text-ink-subtle">{{ jobs.length }} 个岗位</span>
      </div>

      <div class="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div
          v-for="status in JOB_STATUS_ORDER"
          :key="status"
          class="flex items-center justify-between border-b border-line pb-3"
        >
          <span class="flex items-center gap-2.5 text-sm text-ink-muted">
            <span
              class="h-2 w-2 rounded-full"
              :style="{ backgroundColor: JOB_STATUS_COLORS[status] }"
              aria-hidden="true"
            />
            {{ JOB_STATUS_LABELS[status] }}
          </span>
          <span class="text-sm font-semibold tabular-nums text-ink">
            {{ statusCounts[status] }}
          </span>
        </div>
      </div>
    </section>
  </section>
</template>