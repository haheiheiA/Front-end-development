<script setup lang="ts">
import { computed } from 'vue'
import type { Job, JobStatus } from '../../types/job'

const props = defineProps<{
  jobs: Job[]
}>()

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

  for (const job of props.jobs) {
    counts[job.status] += 1
  }

  return counts
})

const FUNNEL_APPLIED_STATUSES: JobStatus[] = ['applied', 'screening', 'assessment']
const FUNNEL_INTERVIEW_STATUSES: JobStatus[] = [
  'first-interview',
  'second-interview',
  'hr-interview',
]

const funnel = computed(() => {
  const counts = statusCounts.value
  const total = props.jobs.length
  const appliedReached = total - counts.saved
  const appliedStage = FUNNEL_APPLIED_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0,
  )
  const interviewStage = FUNNEL_INTERVIEW_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0,
  )
  const interviewReached = interviewStage + counts.offer
  const offer = counts.offer
  const percentage = (value: number, base: number) =>
    base > 0 ? Math.round((value / base) * 100) : 0

  return [
    {
      label: '岗位总数',
      value: total,
      percentage: total > 0 ? 100 : 0,
      rateLabel: '起点',
      detail: '全部求职记录',
    },
    {
      label: '已投递',
      value: appliedStage,
      percentage: percentage(appliedReached, total),
      rateLabel: `投递率 ${percentage(appliedReached, total)}%`,
      detail: '当前处于投递、筛选或笔试阶段',
    },
    {
      label: '面试',
      value: interviewStage,
      percentage: percentage(interviewReached, appliedReached),
      rateLabel: `面试率 ${percentage(interviewReached, appliedReached)}%`,
      detail: '当前处于一面、二面或 HR 面阶段',
    },
    {
      label: 'Offer',
      value: offer,
      percentage: percentage(offer, appliedReached),
      rateLabel: `Offer 率 ${percentage(offer, appliedReached)}%`,
      detail: '已获得录用',
    },
  ]
})
</script>

<template>
  <section class="surface-card p-6 lg:p-8">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-base font-semibold tracking-tight text-ink">求职进度</h2>
        <p class="mt-1 text-sm text-ink-muted">从岗位收集到获得 Offer 的阶段分布</p>
      </div>
      <span class="text-xs text-ink-subtle">
        {{ jobs.length > 0 ? '按当前状态实时计算' : '暂无岗位数据' }}
      </span>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="(stage, index) in funnel"
        :key="stage.label"
        class="rounded-card border border-line bg-surface-soft p-4 sm:p-5"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-medium tracking-[0.12em] text-ink-subtle">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span
            class="text-xs font-medium"
            :class="index === 0 ? 'text-ink-subtle' : 'text-brand'"
          >
            {{ stage.rateLabel }}
          </span>
        </div>

        <p class="mt-4 text-sm font-medium text-ink-muted">{{ stage.label }}</p>
        <div class="mt-2 flex items-end gap-2">
          <p class="text-3xl font-semibold tracking-[-0.03em] text-ink">
            {{ stage.value }}
          </p>
          <span class="pb-1 text-sm text-ink-subtle">个</span>
        </div>

        <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div
            class="h-full rounded-full bg-brand transition-[width] duration-300"
            :style="{ width: `${stage.percentage}%` }"
          />
        </div>

        <p class="mt-3 text-xs text-ink-subtle">{{ stage.detail }}</p>
      </article>
    </div>

    <p class="mt-4 text-xs leading-5 text-ink-subtle">
      阶段数量按当前状态分组；面试率包含已进入 Offer 的岗位，未通过和已撤回因无法可靠判断历史阶段不计入面试。
    </p>
  </section>
</template>
