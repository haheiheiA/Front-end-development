<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import EmptyState from '../components/common/EmptyState.vue'
import JobFunnelSection from '../components/job/JobFunnelSection.vue'
import { useJobStore } from '../stores/job'
import {
  formatJobDate,
  formatJobDateTime,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_TYPE_LABELS,
  JOB_SOURCE_LABELS,
} from '../utils/job'

interface RecentActivity {
  id: string
  type: 'application' | 'interview'
  jobId: string
  company: string
  position: string
  timeLabel: string
  metaLabel: string
  sortTime: number
}

const jobStore = useJobStore()
const { jobs } = storeToRefs(jobStore)

const RECENT_ACTIVITY_LIMIT = 5

function getValidDateTime(...values: Array<string | undefined>) {
  return values.find((value) => value && !Number.isNaN(Date.parse(value)))
}

function getSortTime(value?: string) {
  if (!value) return 0

  const timestamp = Date.parse(value)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function formatActivityTime(value: string | undefined, includeTime: boolean) {
  if (!value || Number.isNaN(Date.parse(value))) return '时间未知'

  return includeTime ? formatJobDateTime(value) : formatJobDate(value)
}

const recentActivities = computed<RecentActivity[]>(() => {
  const activities: RecentActivity[] = []

  for (const job of jobs.value) {
    for (const record of job.applicationRecords ?? []) {
      const activityAt = getValidDateTime(record.appliedAt, record.createdAt, job.updatedAt)

      activities.push({
        id: `application:${job.id}:${record.id}`,
        type: 'application',
        jobId: job.id,
        company: job.company,
        position: job.position,
        timeLabel: formatActivityTime(activityAt, false),
        metaLabel: JOB_SOURCE_LABELS[record.source] ?? '来源未知',
        sortTime: getSortTime(activityAt),
      })
    }

    for (const record of job.interviewRecords ?? []) {
      const activityAt = getValidDateTime(record.scheduledAt, record.createdAt, job.updatedAt)

      activities.push({
        id: `interview:${job.id}:${record.id}`,
        type: 'interview',
        jobId: job.id,
        company: job.company,
        position: job.position,
        timeLabel: formatActivityTime(activityAt, true),
        metaLabel: `${INTERVIEW_TYPE_LABELS[record.type] ?? '面试'} · ${INTERVIEW_MODE_LABELS[record.mode] ?? '方式未知'}`,
        sortTime: getSortTime(activityAt),
      })
    }
  }

  return activities
    .sort((first, second) => {
      if (first.sortTime === second.sortTime) return 0

      return second.sortTime - first.sortTime
    })
    .slice(0, RECENT_ACTIVITY_LIMIT)
})

interface RecentTrendDay {
  date: string
  label: string
  applications: number
  interviews: number
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseLocalDate(value?: string) {
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function getRecordDateKey(value?: string) {
  const date = parseLocalDate(value)

  return date ? formatLocalDateKey(date) : null
}

const recentSevenDayTrend = computed<RecentTrendDay[]>(() => {
  const now = new Date()
  const days: RecentTrendDay[] = []
  const counts = new Map<string, Pick<RecentTrendDay, 'applications' | 'interviews'>>()

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)
    const dateKey = formatLocalDateKey(date)

    days.push({
      date: dateKey,
      label: dateKey.slice(5),
      applications: 0,
      interviews: 0,
    })
    counts.set(dateKey, { applications: 0, interviews: 0 })
  }

  for (const job of jobs.value) {
    for (const record of job.applicationRecords ?? []) {
      const dateKey = getRecordDateKey(record.appliedAt)
      const count = dateKey ? counts.get(dateKey) : undefined

      if (count) {
        count.applications += 1
      }
    }

    for (const record of job.interviewRecords ?? []) {
      const dateKey = getRecordDateKey(record.scheduledAt)
      const count = dateKey ? counts.get(dateKey) : undefined

      if (count) {
        count.interviews += 1
      }
    }
  }

  return days.map((day) => ({
    ...day,
    ...(counts.get(day.date) ?? { applications: 0, interviews: 0 }),
  }))
})

const recentSevenDayStats = computed(() =>
  recentSevenDayTrend.value.reduce(
    (sum, day) => ({
      applicationCount: sum.applicationCount + day.applications,
      interviewCount: sum.interviewCount + day.interviews,
    }),
    { applicationCount: 0, interviewCount: 0 },
  ),
)

const recentSevenDayMax = computed(() =>
  Math.max(
    1,
    ...recentSevenDayTrend.value.flatMap((day) => [day.applications, day.interviews]),
  ),
)

function getBarHeight(value: number) {
  if (value <= 0) return '0%'

  return `${Math.max(8, Math.round((value / recentSevenDayMax.value) * 100))}%`
}</script>

<template>
  <section class="space-y-5 sm:space-y-6">
    <header>
      <p class="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">JobTrack</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">求职进度</h1>
      <p class="mt-2 text-sm text-ink-muted">查看当前求职阶段与近期活动。</p>
    </header>

    <JobFunnelSection :jobs="jobs" />

    <section class="surface-card p-5 sm:p-6 lg:p-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-ink">近期求职数据</h2>
          <p class="mt-1 text-sm text-ink-muted">统计最近 7 个自然日的投递与面试活动。</p>
        </div>
        <span class="text-xs text-ink-subtle">最近 7 天</span>
      </div>

      <div class="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
        <article class="rounded-card border border-line bg-surface-soft p-4 sm:p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="text-sm font-medium text-ink-muted">最近 7 天投递</p>
            <span class="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
          </div>
          <div class="mt-3 flex items-end gap-2">
            <p class="text-3xl font-semibold tracking-[-0.03em] text-ink">
              {{ recentSevenDayStats.applicationCount }}
            </p>
            <span class="pb-1 text-sm text-ink-subtle">条记录</span>
          </div>
        </article>

        <article class="rounded-card border border-line bg-surface-soft p-5">
          <div class="flex items-center justify-between gap-4">
            <p class="text-sm font-medium text-ink-muted">最近 7 天面试</p>
            <span class="h-2 w-2 rounded-full bg-status-interview" aria-hidden="true" />
          </div>
          <div class="mt-3 flex items-end gap-2">
            <p class="text-3xl font-semibold tracking-[-0.03em] text-ink">
              {{ recentSevenDayStats.interviewCount }}
            </p>
            <span class="pb-1 text-sm text-ink-subtle">条记录</span>
          </div>
        </article>
      </div>
    </section>
    <section class="surface-card p-5 sm:p-6 lg:p-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-ink">最近 7 天活动趋势</h2>
          <p class="mt-1 text-sm text-ink-muted">按自然日查看投递与面试数量。</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-ink-muted">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            投递
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-status-interview" aria-hidden="true" />
            面试
          </span>
        </div>
      </div>

      <p class="mt-4 text-xs text-ink-subtle">
        最近 7 天：{{ recentSevenDayStats.applicationCount }} 次投递 ·
        {{ recentSevenDayStats.interviewCount }} 次面试
      </p>

      <div class="mt-4 sm:mt-5">
        <div class="grid grid-cols-7 gap-1 sm:gap-2">
          <div
            v-for="day in recentSevenDayTrend"
            :key="day.date"
            class="flex min-w-0 flex-col items-center"
            :title="`${day.label} 投递 ${day.applications} 面试 ${day.interviews}`"
          >
            <div class="flex h-24 w-full items-end justify-center gap-1 border-b border-line sm:h-36 sm:gap-1.5">
              <span
                class="w-1.5 rounded-t bg-brand sm:w-3"
                :style="{ height: getBarHeight(day.applications) }"
                aria-hidden="true"
              />
              <span
                class="w-1.5 rounded-t bg-status-interview sm:w-3"
                :style="{ height: getBarHeight(day.interviews) }"
                aria-hidden="true"
              />
            </div>
            <span class="mt-1.5 text-[10px] font-medium text-ink-subtle sm:mt-2 sm:text-xs">{{ day.label }}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="surface-card p-5 sm:p-6 lg:p-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-ink">最近动态</h2>
          <p class="mt-1 text-sm text-ink-muted">汇总全部岗位的投递与面试记录。</p>
        </div>
        <span class="text-xs text-ink-subtle">
          {{ recentActivities.length > 0 ? `显示最近 ${recentActivities.length} 条` : '暂无记录' }}
        </span>
      </div>

      <div v-if="recentActivities.length > 0" class="mt-6 divide-y divide-line">
        <RouterLink
          v-for="activity in recentActivities"
          :key="activity.id"
          :to="{ name: 'job-detail', params: { id: activity.jobId } }"
          class="group flex flex-col gap-3 rounded-control py-4 no-underline transition-colors first:pt-0 last:pb-0 hover:bg-surface-soft sm:flex-row sm:gap-4"
        >
          <span
            class="mt-0.5 inline-flex h-7 self-start shrink-0 items-center rounded-full px-2.5 text-xs font-medium"
            :class="
              activity.type === 'application'
                ? 'bg-brand-soft text-brand'
                : 'bg-status-interview/10 text-status-interview'
            "
          >
            {{ activity.type === 'application' ? '投递' : '面试' }}
          </span>

          <div class="min-w-0 w-full flex-1">
            <div class="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <p class="line-clamp-2 break-words text-sm font-semibold text-ink">{{ activity.position }}</p>
              <time class="shrink-0 text-xs text-ink-subtle">{{ activity.timeLabel }}</time>
            </div>
            <p class="mt-1 line-clamp-2 break-words text-sm text-ink-muted">
              {{ activity.company }} · {{ activity.metaLabel }}
            </p>
          </div>

          <svg
            viewBox="0 0 24 24"
            class="mt-1 hidden h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 sm:block"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </RouterLink>
      </div>

      <EmptyState
        v-else
        class="mt-6"
        title="暂无最近动态"
        description="开始添加岗位和投递记录后，这里会显示最近活动。"
      />
    </section>
  </section>
</template>
