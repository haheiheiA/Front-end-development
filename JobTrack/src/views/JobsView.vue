<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EmptyState from '../components/common/EmptyState.vue'
import JobFormModal from '../components/job/JobFormModal.vue'
import { useJobStore } from '../stores/job'
import type { Job, JobStatus } from '../types/job'
import {
  formatJobDate,
  formatJobSalary,
  JOB_SOURCE_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  JOB_STATUS_ORDER,
} from '../utils/job'

type JobStatusFilter = JobStatus | 'all'
type JobSortOption = 'updated-desc' | 'updated-asc'

const jobStore = useJobStore()
const { jobs } = storeToRefs(jobStore)

const searchQuery = ref('')
const selectedStatus = ref<JobStatusFilter>('all')
const sortOrder = ref<JobSortOption>('updated-desc')

const sortOptions: { value: JobSortOption; label: string }[] = [
  { value: 'updated-desc', label: '最近更新' },
  { value: 'updated-asc', label: '最早更新' },
]
const isJobFormModalOpen = ref(false)
const editingJob = ref<Job | undefined>(undefined)
const jobFormError = ref('')

const hasActiveFilters = computed(
  () => searchQuery.value.trim().length > 0 || selectedStatus.value !== 'all',
)

const visibleJobs = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()

  const matchedJobs = jobs.value.filter((job) => {
    const matchesQuery =
      query.length === 0 ||
      job.position.toLocaleLowerCase().includes(query) ||
      job.company.toLocaleLowerCase().includes(query)
    const matchesStatus = selectedStatus.value === 'all' || job.status === selectedStatus.value

    return matchesQuery && matchesStatus
  })

  const direction = sortOrder.value === 'updated-desc' ? -1 : 1

  return [...matchedJobs].sort(
    (first, second) =>
      direction * (Date.parse(first.updatedAt) - Date.parse(second.updatedAt)),
  )
})

function openCreateJobForm() {
  editingJob.value = undefined
  jobFormError.value = ''
  isJobFormModalOpen.value = true
}

function openEditJobForm(job: Job) {
  editingJob.value = job
  jobFormError.value = ''
  isJobFormModalOpen.value = true
}

function closeJobForm() {
  isJobFormModalOpen.value = false
  editingJob.value = undefined
  jobFormError.value = ''
}

function handleJobSave(job: Job) {
  try {
    if (editingJob.value) {
      jobStore.updateJob(job)
    } else {
      jobStore.addJob(job)
    }

    closeJobForm()
  } catch {
    jobFormError.value = '保存失败，请稍后重试。'
  }
}

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = 'all'
}

function handleDelete(job: Job) {
  const confirmed = window.confirm(
    `确定删除“${job.company} · ${job.position}”吗？此操作无法撤销。`,
  )

  if (!confirmed) return

  jobStore.deleteJob(job.id)
}

function handleStatusChange(job: Job, event: Event) {
  const nextStatus = JOB_STATUS_ORDER.find(
    (status) => status === (event.target as HTMLSelectElement).value,
  )

  if (!nextStatus) return

  jobStore.updateJob({
    ...job,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  })
}
</script>

<template>
  <section class="space-y-5 sm:space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">JobTrack</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">我的岗位</h1>
        <p class="mt-2 text-sm text-ink-muted">共 {{ jobs.length }} 个岗位记录</p>
      </div>

      <button
        type="button"
        class="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-control bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand/90 sm:w-auto"
        @click="openCreateJobForm"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        添加岗位
      </button>
    </header>

    <section class="surface-card p-4 lg:p-5" aria-label="岗位搜索、筛选和排序">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <label class="block sm:col-span-2 lg:col-span-1">
          <span class="mb-2 block text-xs font-medium text-ink-muted">搜索</span>
          <span class="relative block">
            <svg
              viewBox="0 0 24 24"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="搜索岗位名称或公司"
              class="h-11 w-full rounded-control border border-line bg-surface-soft pl-10 pr-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            />
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-xs font-medium text-ink-muted">状态</span>
          <select
            v-model="selectedStatus"
            class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors focus-visible:border-focus"
          >
            <option value="all">全部状态</option>
            <option v-for="status in JOB_STATUS_ORDER" :key="status" :value="status">
              {{ JOB_STATUS_LABELS[status] }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-2 block text-xs font-medium text-ink-muted">排序</span>
          <select
            v-model="sortOrder"
            class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors focus-visible:border-focus"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
        <p class="text-xs text-ink-subtle" aria-live="polite">
          显示 {{ visibleJobs.length }} / {{ jobs.length }} 个岗位
        </p>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="rounded-control px-2.5 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
          @click="clearFilters"
        >
          清除搜索和筛选
        </button>
      </div>
    </section>

    <EmptyState
      v-if="jobs.length === 0"
      title="还没有岗位记录"
      description="添加你的第一个岗位，开始记录求职进度。"
    >
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        @click="openCreateJobForm"
      >
        添加岗位
      </button>
    </EmptyState>

    <EmptyState
      v-else-if="visibleJobs.length === 0"
      title="没有找到匹配的岗位"
      description="尝试调整搜索关键词或筛选条件。"
    >
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center rounded-control border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
        @click="clearFilters"
      >
        清除搜索和筛选
      </button>
    </EmptyState>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <article
        v-for="job in visibleJobs"
        :key="job.id"
        class="surface-card flex h-full flex-col p-4 transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-[0_4px_14px_rgb(35_39_35_/_0.06)] sm:p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="truncate text-xs font-medium text-ink-subtle">{{ job.company }}</p>
            <h2 class="mt-1.5 truncate text-base font-semibold tracking-tight text-ink">
              {{ job.position }}
            </h2>
          </div>

          <div class="relative z-20 inline-flex shrink-0 items-center">
            <span
              class="pointer-events-none absolute left-2.5 z-10 h-1.5 w-1.5 rounded-full"
              :style="{ backgroundColor: JOB_STATUS_COLORS[job.status] }"
              aria-hidden="true"
            />
            <select
              :value="job.status"
              class="h-7 cursor-pointer appearance-none rounded-full border bg-surface-soft py-0 pl-6 pr-7 text-xs font-medium transition-colors hover:bg-surface focus-visible:border-focus"
              :style="{ color: JOB_STATUS_COLORS[job.status], borderColor: JOB_STATUS_COLORS[job.status] }"
              :aria-label="`修改 ${job.company} ${job.position} 的岗位状态`"
              @change="handleStatusChange(job, $event)"
            >
              <option v-for="status in JOB_STATUS_ORDER" :key="status" :value="status">
                {{ JOB_STATUS_LABELS[status] }}
              </option>
            </select>
            <svg
              viewBox="0 0 24 24"
              class="pointer-events-none absolute right-2 h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              :style="{ color: JOB_STATUS_COLORS[job.status] }"
              aria-hidden="true"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted sm:mt-5">
          <span class="max-w-full truncate">{{ job.location ?? '地点未填写' }}</span>
          <span class="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
          <span>{{ formatJobSalary(job.salary) }}</span>
        </div>

        <div
          class="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-4 text-xs text-ink-subtle sm:mt-5"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <span>{{ formatJobDate(job.appliedAt) }}</span>
            <span class="h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
            <span class="truncate">{{ JOB_SOURCE_LABELS[job.source] }}</span>
          </div>

          <div class="ml-auto flex shrink-0 items-center gap-1">
            <RouterLink
              :to="{ name: 'job-detail', params: { id: job.id } }"
              class="inline-flex h-8 items-center gap-1 rounded-control px-2.5 font-medium text-ink-muted transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              详情
            </RouterLink>

            <button
              type="button"
              class="inline-flex h-8 items-center gap-1 rounded-control px-2.5 font-medium text-brand transition-colors hover:bg-brand-soft"
              @click="openEditJobForm(job)"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m4 20 4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" />
                <path d="m13.8 7.7 3 3" />
              </svg>
              编辑
            </button>

            <button
              type="button"
              class="inline-flex h-8 items-center gap-1 rounded-control px-2.5 font-medium text-ink-subtle transition-colors hover:bg-status-rejected/10 hover:text-status-rejected focus-visible:text-status-rejected"
              @click="handleDelete(job)"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M5 7h14M9 7V5h6v2m-8 0 1 12h8l1-12M10 11v5M14 11v5" />
              </svg>
              删除
            </button>
          </div>
        </div>
      </article>
    </div>
  <JobFormModal
    v-if="isJobFormModalOpen"
    :mode="editingJob ? 'edit' : 'create'"
    :job="editingJob"
    :error-message="jobFormError"
    @close="closeJobForm"
    @save="handleJobSave"
  />

  </section>
</template>