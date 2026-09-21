<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ContactSection from '../components/job/ContactSection.vue'
import JobFormModal from '../components/job/JobFormModal.vue'
import OfferInfoSection from '../components/job/OfferInfoSection.vue'
import { useJobStore } from '../stores/job'
import type {
  ApplicationRecord,
  InterviewMode,
  InterviewRecord,
  InterviewResult,
  InterviewType,
  Job,
  JobSource,
} from '../types/job'
import {
  formatJobDate,
  formatJobDateTime,
  formatJobSalary,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_MODE_ORDER,
  INTERVIEW_RESULT_COLORS,
  INTERVIEW_RESULT_LABELS,
  INTERVIEW_RESULT_ORDER,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_ORDER,
  JOB_SOURCE_LABELS,
  JOB_SOURCE_ORDER,
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
} from '../utils/job'

interface ApplicationRecordFormState {
  appliedAt: string
  source: JobSource
  note: string
}

interface ApplicationRecordErrors {
  appliedAt?: string
  source?: string
}

interface InterviewRecordFormState {
  scheduledAt: string
  type: InterviewType
  mode: InterviewMode
  result: InterviewResult
  note: string
}

interface InterviewRecordErrors {
  scheduledAt?: string
  type?: string
  mode?: string
  result?: string
}

const route = useRoute()
const jobStore = useJobStore()

const jobId = computed(() => String(route.params.id ?? ''))
const job = computed(() => jobStore.getJobById(jobId.value))
const applicationRecords = computed(() =>
  [...(job.value?.applicationRecords ?? [])].sort(
    (first, second) => Date.parse(second.appliedAt) - Date.parse(first.appliedAt),
  ),
)
const interviewRecords = computed(() =>
  [...(job.value?.interviewRecords ?? [])].sort(
    (first, second) => Date.parse(second.scheduledAt) - Date.parse(first.scheduledAt),
  ),
)

const isRecordFormOpen = ref(false)
const editingRecordId = ref<string | null>(null)
const recordForm = reactive<ApplicationRecordFormState>({
  appliedAt: getTodayInputValue(),
  source: 'official',
  note: '',
})
const recordErrors = reactive<ApplicationRecordErrors>({})
const isInterviewFormOpen = ref(false)
const editingInterviewId = ref<string | null>(null)
const interviewForm = reactive<InterviewRecordFormState>({
  scheduledAt: getNowInputValue(),
  type: 'first-interview',
  mode: 'video',
  result: 'pending',
  note: '',
})
const interviewErrors = reactive<InterviewRecordErrors>({})
const isEditJobFormOpen = ref(false)
const editJobError = ref('')

watch(jobId, () => {
  closeRecordForm()
  closeInterviewForm()
  closeEditJobForm()
})

function getNowInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getTodayInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toDateInputValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toDateTimeInputValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toIsoDateTime(value: string) {
  return new Date(`${value}T12:00:00`).toISOString()
}

function toIsoDateTimeFromLocal(value: string) {
  return new Date(value).toISOString()
}

function openEditJobForm() {
  if (!job.value) return

  editJobError.value = ''
  isEditJobFormOpen.value = true
}

function closeEditJobForm() {
  isEditJobFormOpen.value = false
  editJobError.value = ''
}

function handleEditJobSave(updatedJob: Job) {
  try {
    jobStore.updateJob(updatedJob)
    closeEditJobForm()
  } catch {
    editJobError.value = '保存失败，请稍后重试。'
  }
}

function clearRecordErrors() {
  recordErrors.appliedAt = undefined
  recordErrors.source = undefined
}

function openCreateRecordForm() {
  const currentJob = job.value

  if (!currentJob) return

  editingRecordId.value = null
  recordForm.appliedAt = getTodayInputValue()
  recordForm.source = currentJob.source
  recordForm.note = ''
  clearRecordErrors()
  isRecordFormOpen.value = true
}

function openEditRecordForm(record: ApplicationRecord) {
  editingRecordId.value = record.id
  recordForm.appliedAt = toDateInputValue(record.appliedAt)
  recordForm.source = record.source
  recordForm.note = record.note ?? ''
  clearRecordErrors()
  isRecordFormOpen.value = true
}

function closeRecordForm() {
  isRecordFormOpen.value = false
  editingRecordId.value = null
  recordForm.appliedAt = getTodayInputValue()
  recordForm.source = job.value?.source ?? 'official'
  recordForm.note = ''
  clearRecordErrors()
}

function validateRecordForm() {
  recordErrors.appliedAt = recordForm.appliedAt ? undefined : '请选择投递日期'
  recordErrors.source = JOB_SOURCE_ORDER.includes(recordForm.source)
    ? undefined
    : '请选择有效的招聘来源'

  return !Object.values(recordErrors).some(Boolean)
}

function handleRecordSubmit() {
  const currentJob = job.value

  if (!currentJob || !validateRecordForm()) return

  const now = new Date().toISOString()
  const existingRecords = currentJob.applicationRecords ?? []
  const existingRecord = editingRecordId.value
    ? existingRecords.find((record) => record.id === editingRecordId.value)
    : undefined
  const record: ApplicationRecord = {
    id: existingRecord?.id ?? crypto.randomUUID(),
    appliedAt: toIsoDateTime(recordForm.appliedAt),
    source: recordForm.source,
    note: recordForm.note.trim() || undefined,
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now,
  }
  const nextRecords = existingRecord
    ? existingRecords.map((item) => (item.id === existingRecord.id ? record : item))
    : [...existingRecords, record]

  jobStore.updateJob({
    ...currentJob,
    applicationRecords: nextRecords,
    updatedAt: now,
  })
  closeRecordForm()
}

function clearInterviewErrors() {
  interviewErrors.scheduledAt = undefined
  interviewErrors.type = undefined
  interviewErrors.mode = undefined
  interviewErrors.result = undefined
}

function openCreateInterviewForm() {
  if (!job.value) return

  editingInterviewId.value = null
  interviewForm.scheduledAt = getNowInputValue()
  interviewForm.type = 'first-interview'
  interviewForm.mode = 'video'
  interviewForm.result = 'pending'
  interviewForm.note = ''
  clearInterviewErrors()
  isInterviewFormOpen.value = true
}

function openEditInterviewForm(record: InterviewRecord) {
  editingInterviewId.value = record.id
  interviewForm.scheduledAt = toDateTimeInputValue(record.scheduledAt)
  interviewForm.type = record.type
  interviewForm.mode = record.mode
  interviewForm.result = record.result
  interviewForm.note = record.note ?? ''
  clearInterviewErrors()
  isInterviewFormOpen.value = true
}

function closeInterviewForm() {
  isInterviewFormOpen.value = false
  editingInterviewId.value = null
  interviewForm.scheduledAt = getNowInputValue()
  interviewForm.type = 'first-interview'
  interviewForm.mode = 'video'
  interviewForm.result = 'pending'
  interviewForm.note = ''
  clearInterviewErrors()
}

function validateInterviewForm() {
  const scheduledAt = new Date(interviewForm.scheduledAt)
  interviewErrors.scheduledAt = !interviewForm.scheduledAt
    ? '请选择面试时间'
    : Number.isNaN(scheduledAt.getTime())
      ? '请输入有效的面试时间'
      : undefined
  interviewErrors.type = INTERVIEW_TYPE_ORDER.includes(interviewForm.type)
    ? undefined
    : '请选择有效的面试轮次'
  interviewErrors.mode = INTERVIEW_MODE_ORDER.includes(interviewForm.mode)
    ? undefined
    : '请选择有效的面试方式'
  interviewErrors.result = INTERVIEW_RESULT_ORDER.includes(interviewForm.result)
    ? undefined
    : '请选择有效的面试结果'

  return !Object.values(interviewErrors).some(Boolean)
}

function handleInterviewSubmit() {
  const currentJob = job.value

  if (!currentJob || !validateInterviewForm()) return

  const now = new Date().toISOString()
  const existingRecords = currentJob.interviewRecords ?? []
  const existingRecord = editingInterviewId.value
    ? existingRecords.find((record) => record.id === editingInterviewId.value)
    : undefined
  const record: InterviewRecord = {
    id: existingRecord?.id ?? crypto.randomUUID(),
    scheduledAt: toIsoDateTimeFromLocal(interviewForm.scheduledAt),
    type: interviewForm.type,
    mode: interviewForm.mode,
    result: interviewForm.result,
    note: interviewForm.note.trim() || undefined,
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now,
  }
  const nextRecords = existingRecord
    ? existingRecords.map((item) => (item.id === existingRecord.id ? record : item))
    : [...existingRecords, record]

  jobStore.updateJob({
    ...currentJob,
    interviewRecords: nextRecords,
    updatedAt: now,
  })
  closeInterviewForm()
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex items-start justify-between gap-6">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">JobTrack</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">岗位详情</h1>
        <p v-if="job" class="mt-2 text-sm text-ink-muted">
          {{ job.company }} · {{ job.position }}
        </p>
      </div>

      <div class="flex shrink-0 flex-wrap justify-end gap-3">
        <RouterLink
          to="/jobs"
          class="inline-flex h-11 items-center justify-center rounded-control border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
        >
          返回我的岗位
        </RouterLink>

        <button
          v-if="job"
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-control bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          @click="openEditJobForm"
        >
          编辑岗位
        </button>
      </div>
    </header>

    <template v-if="job">
      <section class="surface-card p-6 lg:p-8">
        <div class="flex items-start justify-between gap-6">
          <div class="min-w-0">
            <p class="text-sm font-medium text-ink-muted">{{ job.company }}</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">
              {{ job.position }}
            </h2>
          </div>

          <span
            class="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface-soft px-3 py-1.5 text-xs font-medium"
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

        <dl class="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-xs font-medium text-ink-subtle">工作地点</dt>
            <dd class="mt-2 text-sm font-medium text-ink">{{ job.location ?? '未填写' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">薪资</dt>
            <dd class="mt-2 text-sm font-medium text-ink">{{ formatJobSalary(job.salary) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">投递日期</dt>
            <dd class="mt-2 text-sm font-medium text-ink">{{ formatJobDate(job.appliedAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">招聘来源</dt>
            <dd class="mt-2 text-sm font-medium text-ink">{{ JOB_SOURCE_LABELS[job.source] }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">创建时间</dt>
            <dd class="mt-2 text-sm font-medium text-ink">{{ formatJobDateTime(job.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">更新时间</dt>
            <dd class="mt-2 text-sm font-medium text-ink">{{ formatJobDateTime(job.updatedAt) }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="job.description || job.requirements" class="surface-card p-6 lg:p-8">
        <div v-if="job.description">
          <h2 class="text-base font-semibold tracking-tight text-ink">职位描述</h2>
          <p class="mt-3 whitespace-pre-line text-sm leading-6 text-ink-muted">
            {{ job.description }}
          </p>
        </div>

        <div
          v-if="job.requirements"
          :class="job.description ? 'mt-6 border-t border-line pt-6' : ''"
        >
          <h2 class="text-base font-semibold tracking-tight text-ink">任职要求</h2>
          <p class="mt-3 whitespace-pre-line text-sm leading-6 text-ink-muted">
            {{ job.requirements }}
          </p>
        </div>
      </section>

      <section class="surface-card p-6 lg:p-8">
        <div class="flex items-start justify-between gap-6">
          <div>
            <h2 class="text-base font-semibold tracking-tight text-ink">投递记录</h2>
            <p class="mt-1 text-sm text-ink-muted">
              {{ applicationRecords.length }} 条记录，按投递日期倒序排列。
            </p>
          </div>

          <button
            v-if="!isRecordFormOpen"
            type="button"
            class="inline-flex h-10 shrink-0 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            @click="openCreateRecordForm"
          >
            添加投递记录
          </button>
        </div>

        <form
          v-if="isRecordFormOpen"
          class="mt-6 rounded-card border border-line bg-surface-soft p-4 sm:p-5"
          novalidate
          @submit.prevent="handleRecordSubmit"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-ink">
                投递日期 <span class="text-status-rejected">*</span>
              </span>
              <input
                v-model="recordForm.appliedAt"
                type="date"
                class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus"
                :style="
                  recordErrors.appliedAt
                    ? { borderColor: 'var(--color-status-rejected)' }
                    : undefined
                "
                :aria-invalid="Boolean(recordErrors.appliedAt)"
                @input="recordErrors.appliedAt = undefined"
              />
              <span
                v-if="recordErrors.appliedAt"
                class="mt-1.5 block text-xs text-status-rejected"
              >
                {{ recordErrors.appliedAt }}
              </span>
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-medium text-ink">
                投递渠道 <span class="text-status-rejected">*</span>
              </span>
              <select
                v-model="recordForm.source"
                class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus"
                :style="
                  recordErrors.source
                    ? { borderColor: 'var(--color-status-rejected)' }
                    : undefined
                "
                :aria-invalid="Boolean(recordErrors.source)"
                @change="recordErrors.source = undefined"
              >
                <option v-for="source in JOB_SOURCE_ORDER" :key="source" :value="source">
                  {{ JOB_SOURCE_LABELS[source] }}
                </option>
              </select>
              <span v-if="recordErrors.source" class="mt-1.5 block text-xs text-status-rejected">
                {{ recordErrors.source }}
              </span>
            </label>
          </div>

          <label class="mt-4 block">
            <span class="mb-2 block text-sm font-medium text-ink">备注</span>
            <textarea
              v-model="recordForm.note"
              rows="3"
              placeholder="例如：通过内推链接投递，已同步发送作品集。"
              class="w-full resize-y rounded-control border border-line bg-surface px-3 py-2.5 text-sm leading-6 text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            />
          </label>

          <div class="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-control border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
              @click="closeRecordForm"
            >
              取消
            </button>
            <button
              type="submit"
              class="inline-flex h-10 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              {{ editingRecordId ? '保存修改' : '保存记录' }}
            </button>
          </div>
        </form>

        <div v-if="applicationRecords.length > 0" class="mt-6 space-y-3">
          <article
            v-for="record in applicationRecords"
            :key="record.id"
            class="rounded-card border border-line bg-surface-soft p-4 sm:p-5"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-ink">
                  {{ formatJobDate(record.appliedAt) }}
                </p>
                <p class="mt-1 text-xs text-ink-subtle">
                  {{ JOB_SOURCE_LABELS[record.source] }}
                </p>
              </div>

              <button
                type="button"
                class="inline-flex shrink-0 items-center rounded-control px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
                @click="openEditRecordForm(record)"
              >
                编辑
              </button>
            </div>

            <p class="mt-4 whitespace-pre-line text-sm leading-6 text-ink-muted">
              {{ record.note || '无备注' }}
            </p>
            <p class="mt-3 text-xs text-ink-subtle">
              更新于 {{ formatJobDateTime(record.updatedAt) }}
            </p>
          </article>
        </div>

        <div
          v-else-if="!isRecordFormOpen"
          class="mt-6 rounded-card border border-dashed border-line bg-surface-soft p-8 text-center"
        >
          <p class="text-sm font-semibold text-ink">暂无投递记录</p>
          <p class="mt-2 text-sm text-ink-muted">添加一条记录，用于跟踪该岗位的投递情况。</p>
        </div>
      </section>

      <section class="surface-card p-6 lg:p-8">
        <div class="flex items-start justify-between gap-6">
          <div>
            <h2 class="text-base font-semibold tracking-tight text-ink">面试记录</h2>
            <p class="mt-1 text-sm text-ink-muted">
              {{ interviewRecords.length }} 条记录，按面试时间倒序排列。
            </p>
          </div>

          <button
            v-if="!isInterviewFormOpen"
            type="button"
            class="inline-flex h-10 shrink-0 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            @click="openCreateInterviewForm"
          >
            添加面试记录
          </button>
        </div>

        <form
          v-if="isInterviewFormOpen"
          class="mt-6 rounded-card border border-line bg-surface-soft p-4 sm:p-5"
          novalidate
          @submit.prevent="handleInterviewSubmit"
        >
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-ink">
                面试时间 <span class="text-status-rejected">*</span>
              </span>
              <input
                v-model="interviewForm.scheduledAt"
                type="datetime-local"
                class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus"
                :style="
                  interviewErrors.scheduledAt
                    ? { borderColor: 'var(--color-status-rejected)' }
                    : undefined
                "
                :aria-invalid="Boolean(interviewErrors.scheduledAt)"
                @input="interviewErrors.scheduledAt = undefined"
              />
              <span
                v-if="interviewErrors.scheduledAt"
                class="mt-1.5 block text-xs text-status-rejected"
              >
                {{ interviewErrors.scheduledAt }}
              </span>
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-medium text-ink">
                面试轮次 <span class="text-status-rejected">*</span>
              </span>
              <select
                v-model="interviewForm.type"
                class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus"
                :style="
                  interviewErrors.type
                    ? { borderColor: 'var(--color-status-rejected)' }
                    : undefined
                "
                :aria-invalid="Boolean(interviewErrors.type)"
                @change="interviewErrors.type = undefined"
              >
                <option v-for="type in INTERVIEW_TYPE_ORDER" :key="type" :value="type">
                  {{ INTERVIEW_TYPE_LABELS[type] }}
                </option>
              </select>
              <span v-if="interviewErrors.type" class="mt-1.5 block text-xs text-status-rejected">
                {{ interviewErrors.type }}
              </span>
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-medium text-ink">
                面试方式 <span class="text-status-rejected">*</span>
              </span>
              <select
                v-model="interviewForm.mode"
                class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus"
                :style="
                  interviewErrors.mode
                    ? { borderColor: 'var(--color-status-rejected)' }
                    : undefined
                "
                :aria-invalid="Boolean(interviewErrors.mode)"
                @change="interviewErrors.mode = undefined"
              >
                <option v-for="mode in INTERVIEW_MODE_ORDER" :key="mode" :value="mode">
                  {{ INTERVIEW_MODE_LABELS[mode] }}
                </option>
              </select>
              <span v-if="interviewErrors.mode" class="mt-1.5 block text-xs text-status-rejected">
                {{ interviewErrors.mode }}
              </span>
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-medium text-ink">
                面试结果 <span class="text-status-rejected">*</span>
              </span>
              <select
                v-model="interviewForm.result"
                class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus"
                :style="
                  interviewErrors.result
                    ? { borderColor: 'var(--color-status-rejected)' }
                    : undefined
                "
                :aria-invalid="Boolean(interviewErrors.result)"
                @change="interviewErrors.result = undefined"
              >
                <option v-for="result in INTERVIEW_RESULT_ORDER" :key="result" :value="result">
                  {{ INTERVIEW_RESULT_LABELS[result] }}
                </option>
              </select>
              <span
                v-if="interviewErrors.result"
                class="mt-1.5 block text-xs text-status-rejected"
              >
                {{ interviewErrors.result }}
              </span>
            </label>
          </div>

          <label class="mt-4 block">
            <span class="mb-2 block text-sm font-medium text-ink">备注</span>
            <textarea
              v-model="interviewForm.note"
              rows="3"
              placeholder="例如：准备项目介绍和性能优化相关案例。"
              class="w-full resize-y rounded-control border border-line bg-surface px-3 py-2.5 text-sm leading-6 text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            />
          </label>

          <div class="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-control border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
              @click="closeInterviewForm"
            >
              取消
            </button>
            <button
              type="submit"
              class="inline-flex h-10 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              {{ editingInterviewId ? '保存修改' : '保存记录' }}
            </button>
          </div>
        </form>

        <div v-if="interviewRecords.length > 0" class="mt-6 space-y-3">
          <article
            v-for="record in interviewRecords"
            :key="record.id"
            class="rounded-card border border-line bg-surface-soft p-4 sm:p-5"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-ink">
                  {{ formatJobDateTime(record.scheduledAt) }}
                </p>
                <p class="mt-1 text-xs text-ink-subtle">
                  {{ INTERVIEW_TYPE_LABELS[record.type] }} · {{ INTERVIEW_MODE_LABELS[record.mode] }}
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium"
                  :style="{ color: INTERVIEW_RESULT_COLORS[record.result] }"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :style="{ backgroundColor: INTERVIEW_RESULT_COLORS[record.result] }"
                    aria-hidden="true"
                  />
                  {{ INTERVIEW_RESULT_LABELS[record.result] }}
                </span>
                <button
                  type="button"
                  class="inline-flex items-center rounded-control px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
                  @click="openEditInterviewForm(record)"
                >
                  编辑
                </button>
              </div>
            </div>

            <p class="mt-4 whitespace-pre-line text-sm leading-6 text-ink-muted">
              {{ record.note || '无备注' }}
            </p>
            <p class="mt-3 text-xs text-ink-subtle">
              更新于 {{ formatJobDateTime(record.updatedAt) }}
            </p>
          </article>
        </div>

        <div
          v-else-if="!isInterviewFormOpen"
          class="mt-6 rounded-card border border-dashed border-line bg-surface-soft p-8 text-center"
        >
          <p class="text-sm font-semibold text-ink">暂无面试记录</p>
          <p class="mt-2 text-sm text-ink-muted">添加一条记录，用于安排和跟踪面试进度。</p>
        </div>
      </section>

      <OfferInfoSection :job="job" />
      <ContactSection :job="job" />

      <JobFormModal
        v-if="isEditJobFormOpen"
        mode="edit"
        :job="job"
        :error-message="editJobError"
        @close="closeEditJobForm"
        @save="handleEditJobSave"
      />
    </template>

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
