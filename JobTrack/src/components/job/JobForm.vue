<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Job, JobSource, JobStatus } from '../../types/job'
import {
  JOB_SOURCE_LABELS,
  JOB_SOURCE_ORDER,
  JOB_STATUS_LABELS,
  JOB_STATUS_ORDER,
} from '../../utils/job'

interface JobFormState {
  company: string
  position: string
  location: string
  status: JobStatus
  appliedAt: string
  source: JobSource
}

interface FormErrors {
  company?: string
  position?: string
  status?: string
  appliedAt?: string
  source?: string
}

interface Props {
  initialJob?: Job
  submitLabel?: string
  errorMessage?: string
  embedded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: '保存岗位',
  errorMessage: '',
  embedded: false,
})

const emit = defineEmits<{
  save: [job: Job]
  cancel: []
}>()

const form = reactive<JobFormState>(getInitialFormState())
const errors = reactive<FormErrors>({})
const isSubmitting = ref(false)

watch(
  () => props.initialJob?.id,
  () => {
    Object.assign(form, getInitialFormState())
    clearErrors()
  },
  { immediate: true },
)

function getTodayInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toDateInputValue(value?: string) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getInitialFormState(): JobFormState {
  const job = props.initialJob
  const status = job?.status ?? 'applied'

  return {
    company: job?.company ?? '',
    position: job?.position ?? '',
    location: job?.location ?? '',
    status,
    appliedAt: status === 'saved' ? '' : (toDateInputValue(job?.appliedAt) || getTodayInputValue()),
    source: job?.source ?? 'official',
  }
}

function toIsoDateTime(value: string) {
  return new Date(`${value}T12:00:00`).toISOString()
}

function clearErrors() {
  errors.company = undefined
  errors.position = undefined
  errors.status = undefined
  errors.appliedAt = undefined
  errors.source = undefined
}

function validateForm() {
  errors.company = form.company.trim() ? undefined : '请输入公司名称'
  errors.position = form.position.trim() ? undefined : '请输入岗位名称'
  errors.status = JOB_STATUS_ORDER.includes(form.status) ? undefined : '请选择有效的岗位状态'
  errors.appliedAt =
    form.status === 'saved' || form.appliedAt ? undefined : '请选择投递日期'
  errors.source = JOB_SOURCE_ORDER.includes(form.source) ? undefined : '请选择有效的招聘来源'

  return !Object.values(errors).some(Boolean)
}

function handleStatusChange() {
  errors.status = undefined
  errors.appliedAt = undefined

  if (form.status === 'saved') {
    form.appliedAt = ''
  } else if (!form.appliedAt) {
    form.appliedAt = getTodayInputValue()
  }
}

function handleSubmit() {
  if (isSubmitting.value || !validateForm()) return

  isSubmitting.value = true

  try {
    const now = new Date().toISOString()
    const job: Job = {
      ...props.initialJob,
      id: props.initialJob?.id ?? crypto.randomUUID(),
      company: form.company.trim(),
      position: form.position.trim(),
      location: form.location.trim() || undefined,
      status: form.status,
      appliedAt: form.status === 'saved' ? undefined : toIsoDateTime(form.appliedAt),
      source: form.source,
      createdAt: props.initialJob?.createdAt ?? now,
      updatedAt: now,
    }

    emit('save', job)
  } finally {
    queueMicrotask(() => {
      isSubmitting.value = false
    })
  }
}
</script>

<template>
  <form
    class="surface-card overflow-hidden"
    :class="embedded ? 'rounded-none border-0 bg-transparent shadow-none' : ''"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <div class="border-b border-line p-6 lg:p-8">
      <div>
        <h2 class="text-base font-semibold tracking-tight text-ink">岗位信息</h2>
        <p class="mt-1 text-sm text-ink-muted">填写核心信息，带 * 的字段为必填项。</p>
      </div>

      <div class="mt-6 grid gap-5 sm:grid-cols-2">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            公司名称 <span class="text-status-rejected">*</span>
          </span>
          <input
            v-model="form.company"
            type="text"
            autocomplete="organization"
            placeholder="例如：腾讯"
            class="h-11 w-full rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            :style="errors.company ? { borderColor: 'var(--color-status-rejected)' } : undefined"
            :aria-invalid="Boolean(errors.company)"
            @input="errors.company = undefined"
          />
          <span v-if="errors.company" class="mt-1.5 block text-xs text-status-rejected">
            {{ errors.company }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            岗位名称 <span class="text-status-rejected">*</span>
          </span>
          <input
            v-model="form.position"
            type="text"
            autocomplete="organization-title"
            placeholder="例如：Web 前端开发工程师"
            class="h-11 w-full rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            :style="errors.position ? { borderColor: 'var(--color-status-rejected)' } : undefined"
            :aria-invalid="Boolean(errors.position)"
            @input="errors.position = undefined"
          />
          <span v-if="errors.position" class="mt-1.5 block text-xs text-status-rejected">
            {{ errors.position }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">工作地点</span>
          <input
            v-model="form.location"
            type="text"
            autocomplete="address-level2"
            placeholder="例如：上海 / 远程"
            class="h-11 w-full rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            岗位状态 <span class="text-status-rejected">*</span>
          </span>
          <select
            v-model="form.status"
            class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors focus-visible:border-focus"
            :style="errors.status ? { borderColor: 'var(--color-status-rejected)' } : undefined"
            :aria-invalid="Boolean(errors.status)"
            @change="handleStatusChange"
          >
            <option v-for="status in JOB_STATUS_ORDER" :key="status" :value="status">
              {{ JOB_STATUS_LABELS[status] }}
            </option>
          </select>
          <span v-if="errors.status" class="mt-1.5 block text-xs text-status-rejected">
            {{ errors.status }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            投递日期 <span v-if="form.status !== 'saved'" class="text-status-rejected">*</span>
          </span>
          <input
            v-model="form.appliedAt"
            type="date"
            class="h-11 w-full rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="form.status === 'saved'"
            :style="errors.appliedAt ? { borderColor: 'var(--color-status-rejected)' } : undefined"
            :aria-invalid="Boolean(errors.appliedAt)"
            @input="errors.appliedAt = undefined"
          />
          <span v-if="errors.appliedAt" class="mt-1.5 block text-xs text-status-rejected">
            {{ errors.appliedAt }}
          </span>
          <span
            v-else-if="form.status === 'saved'"
            class="mt-1.5 block text-xs text-ink-subtle"
          >
            待投递岗位不需要填写日期。
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            招聘来源 <span class="text-status-rejected">*</span>
          </span>
          <select
            v-model="form.source"
            class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface-soft px-3 text-sm text-ink transition-colors focus-visible:border-focus"
            :style="errors.source ? { borderColor: 'var(--color-status-rejected)' } : undefined"
            :aria-invalid="Boolean(errors.source)"
            @change="errors.source = undefined"
          >
            <option v-for="source in JOB_SOURCE_ORDER" :key="source" :value="source">
              {{ JOB_SOURCE_LABELS[source] }}
            </option>
          </select>
          <span v-if="errors.source" class="mt-1.5 block text-xs text-status-rejected">
            {{ errors.source }}
          </span>
        </label>
      </div>
    </div>

    <div
      :class="embedded ? 'sticky bottom-0 z-10 bg-surface-soft/95' : ''"
      class="flex flex-col-reverse items-stretch gap-3 bg-surface-soft px-6 py-4 sm:flex-row sm:items-center sm:justify-end lg:px-8"
    >
      <p v-if="errorMessage" class="text-sm text-status-rejected sm:mr-auto">
        {{ errorMessage }}
      </p>
      <button
        type="button"
        class="inline-flex h-11 items-center justify-center rounded-control border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
        @click="emit('cancel')"
      >
        取消
      </button>
      <button
        type="submit"
        class="inline-flex h-11 items-center justify-center rounded-control bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSubmitting"
      >
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>