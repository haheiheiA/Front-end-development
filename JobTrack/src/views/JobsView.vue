<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
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
  <section class="space-y-6">
    <header class="flex items-start justify-between gap-6">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">JobTrack</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">我的岗位</h1>
        <p class="mt-2 text-sm text-ink-muted">共 {{ jobs.length }} 个岗位记录</p>
      </div>

      <button
        type="button"
        class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
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
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <label class="block">
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

    <div
      v-if="jobs.length === 0"
      class="surface-card border-dashed bg-surface/70 p-10 text-center"
    >
      <p class="text-sm font-semibold text-ink">暂无岗位</p>
      <p class="mt-2 text-sm text-ink-muted">当前还没有岗位记录，后续添加的岗位会显示在这里。</p>
    </div>

    <div
      v-else-if="visibleJobs.length === 0"
      class="surface-card border-dashed bg-surface/70 p-10 text-center"
    >
      <p class="text-sm font-semibold text-ink">没有找到匹配的岗位</p>
      <p class="mt-2 text-sm text-ink-muted">尝试清空搜索关键词，或将状态筛选调整为“全部”。</p>
      <button
        type="button"
        class="mt-5 rounded-control border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
        @click="clearFilters"
      >
        清除搜索和筛选
      </button>
    </div>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <article
        v-for="job in visibleJobs"
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

          <div class="relative inline-flex shrink-0 items-center">
            <span
              class="pointer-events-none absolute left-2.5 z-10 h-1.5 w-1.5 rounded-full"
              :style="{ backgroundColor: JOB_STATUS_COLORS[job.status] }"
              aria-hidden="true"
            />
            <select
              :value="job.status"
              class="h-7 cursor-pointer appearance-none rounded-full border border-line bg-surface-soft py-0 pl-6 pr-7 text-xs font-medium transition-colors focus-visible:border-focus"
              :style="{ color: JOB_STATUS_COLORS[job.status] }"
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

        <div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
          <span>{{ job.location ?? '地点未填写' }}</span>
          <span class="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
          <span>{{ formatJobSalary(job.salary) }}</span>
        </div>

        <div
          class="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4 text-xs text-ink-subtle"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <span>{{ formatJobDate(job.appliedAt) }}</span>
            <span class="h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
            <span class="truncate">{{ JOB_SOURCE_LABELS[job.source] }}</span>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <RouterLink
              :to="{ name: 'job-detail', params: { id: job.id } }"
              class="inline-flex items-center gap-1 rounded-control px-2 py-1 font-medium text-ink-muted transition-colors hover:bg-surface-soft hover:text-ink"
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
              class="inline-flex items-center gap-1 rounded-control px-2 py-1 font-medium text-brand transition-colors hover:bg-brand-soft"
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
              class="inline-flex items-center gap-1 rounded-control px-2 py-1 font-medium text-status-rejected transition-colors hover:bg-status-rejected/10"
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