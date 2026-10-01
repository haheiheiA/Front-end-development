<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import EmptyState from '../common/EmptyState.vue'
import { useJobStore } from '../../stores/job'
import type { Job, JobSalary, OfferInfo } from '../../types/job'
import { formatJobDate, formatJobDateTime, formatJobSalary } from '../../utils/job'

interface OfferFormState {
  received: boolean
  offerDate: string
  position: string
  salaryMin: number | ''
  salaryMax: number | ''
  salaryUnit: 'month' | 'year'
  startDate: string
  note: string
}

interface OfferErrors {
  offerDate?: string
  position?: string
  salaryMin?: string
  salaryMax?: string
  submit?: string
}

const props = defineProps<{
  job: Job
}>()

const jobStore = useJobStore()
const isFormOpen = ref(false)
const offerForm = reactive<OfferFormState>(getInitialFormState(props.job.offer))
const offerErrors = reactive<OfferErrors>({})

watch(
  () => props.job.id,
  () => closeForm(),
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

function toIsoDateTime(value: string) {
  return new Date(`${value}T12:00:00`).toISOString()
}

function getInitialFormState(offer?: OfferInfo): OfferFormState {
  return {
    received: offer?.received ?? true,
    offerDate: offer?.offerDate ? toDateInputValue(offer.offerDate) : getTodayInputValue(),
    position: offer?.position ?? '',
    salaryMin: offer?.salary?.min ?? '',
    salaryMax: offer?.salary?.max ?? '',
    salaryUnit: offer?.salary?.unit ?? 'year',
    startDate: offer?.startDate ? toDateInputValue(offer.startDate) : '',
    note: offer?.note ?? '',
  }
}

function clearErrors() {
  offerErrors.offerDate = undefined
  offerErrors.position = undefined
  offerErrors.salaryMin = undefined
  offerErrors.salaryMax = undefined
  offerErrors.submit = undefined
}

function openCreateForm() {
  Object.assign(offerForm, getInitialFormState())
  clearErrors()
  isFormOpen.value = true
}

function openEditForm() {
  Object.assign(offerForm, getInitialFormState(props.job.offer))
  clearErrors()
  isFormOpen.value = true
}

function closeForm() {
  Object.assign(offerForm, getInitialFormState(props.job.offer))
  clearErrors()
  isFormOpen.value = false
}

function handleReceivedChange() {
  clearErrors()

  if (offerForm.received && !offerForm.offerDate) {
    offerForm.offerDate = getTodayInputValue()
  }
}

function parseSalary(): JobSalary | undefined {
  if (offerForm.salaryMin === '') return undefined

  return {
    min: offerForm.salaryMin,
    max: offerForm.salaryMax === '' ? undefined : offerForm.salaryMax,
    unit: offerForm.salaryUnit,
  }
}

function validateForm() {
  clearErrors()

  if (!offerForm.received) return true

  offerErrors.offerDate = offerForm.offerDate ? undefined : '请选择 Offer 日期'
  offerErrors.position = offerForm.position.trim() ? undefined : '请输入 Offer 职位名称'

  const minimum = offerForm.salaryMin === '' ? undefined : offerForm.salaryMin
  const maximum = offerForm.salaryMax === '' ? undefined : offerForm.salaryMax

  if (minimum !== undefined && (!Number.isFinite(minimum) || minimum <= 0)) {
    offerErrors.salaryMin = '请输入有效的最低薪资'
  } else if (maximum !== undefined && minimum === undefined) {
    offerErrors.salaryMin = '请先填写最低薪资'
  }

  if (maximum !== undefined && (!Number.isFinite(maximum) || maximum <= 0)) {
    offerErrors.salaryMax = '请输入有效的最高薪资'
  } else if (minimum !== undefined && maximum !== undefined && maximum < minimum) {
    offerErrors.salaryMax = '最高薪资不能低于最低薪资'
  }

  return !Object.values(offerErrors).some(Boolean)
}

function handleSubmit() {
  if (!validateForm()) return

  try {
    const now = new Date().toISOString()
    const existingOffer = props.job.offer
    const offer: OfferInfo = {
      id: existingOffer?.id ?? crypto.randomUUID(),
      received: offerForm.received,
      offerDate:
        offerForm.received && offerForm.offerDate
          ? toIsoDateTime(offerForm.offerDate)
          : existingOffer?.offerDate,
      position: offerForm.received ? offerForm.position.trim() || undefined : existingOffer?.position,
      salary: offerForm.received ? parseSalary() : existingOffer?.salary,
      startDate:
        offerForm.received && offerForm.startDate
          ? toIsoDateTime(offerForm.startDate)
          : existingOffer?.startDate,
      note: offerForm.note.trim() || undefined,
      createdAt: existingOffer?.createdAt ?? now,
      updatedAt: now,
    }

    jobStore.updateJob({
      ...props.job,
      offer,
      updatedAt: now,
    })
    closeForm()
  } catch {
    offerErrors.submit = '保存失败，请稍后重试。'
  }
}
</script>

<template>
  <section class="surface-card bg-surface-soft/60 p-6 lg:p-7">
    <div class="flex items-start justify-between gap-6">
      <div>
        <h2 class="text-base font-semibold tracking-tight text-ink">Offer 信息</h2>
        <p class="mt-1 text-sm text-ink-muted">
          {{ job.offer ? '已记录 Offer 信息。' : '尚未记录 Offer 信息。' }}
        </p>
      </div>

      <button
        v-if="!isFormOpen"
        type="button"
        class="inline-flex h-10 shrink-0 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        @click="job.offer ? openEditForm() : openCreateForm()"
      >
        {{ job.offer ? '编辑 Offer' : '添加 Offer' }}
      </button>
    </div>

    <form
      v-if="isFormOpen"
      class="mt-6 rounded-card border border-line bg-surface-soft p-4 sm:p-5"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">是否收到 Offer</span>
          <select
            v-model="offerForm.received"
            class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus"
            @change="handleReceivedChange"
          >
            <option :value="true">已收到</option>
            <option :value="false">未收到</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            Offer 日期 <span v-if="offerForm.received" class="text-status-rejected">*</span>
          </span>
          <input
            v-model="offerForm.offerDate"
            type="date"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!offerForm.received"
            :style="
              offerErrors.offerDate ? { borderColor: 'var(--color-status-rejected)' } : undefined
            "
            :aria-invalid="Boolean(offerErrors.offerDate)"
            @input="offerErrors.offerDate = undefined"
          />
          <span v-if="offerErrors.offerDate" class="mt-1.5 block text-xs text-status-rejected">
            {{ offerErrors.offerDate }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            Offer 职位名称 <span v-if="offerForm.received" class="text-status-rejected">*</span>
          </span>
          <input
            v-model="offerForm.position"
            type="text"
            placeholder="例如：高级前端开发工程师"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!offerForm.received"
            :style="
              offerErrors.position ? { borderColor: 'var(--color-status-rejected)' } : undefined
            "
            :aria-invalid="Boolean(offerErrors.position)"
            @input="offerErrors.position = undefined"
          />
          <span v-if="offerErrors.position" class="mt-1.5 block text-xs text-status-rejected">
            {{ offerErrors.position }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">最低薪资</span>
          <input
            v-model="offerForm.salaryMin"
            type="number"
            min="0"
            placeholder="例如：300000"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!offerForm.received"
            :style="
              offerErrors.salaryMin ? { borderColor: 'var(--color-status-rejected)' } : undefined
            "
            :aria-invalid="Boolean(offerErrors.salaryMin)"
            @input="offerErrors.salaryMin = undefined"
          />
          <span v-if="offerErrors.salaryMin" class="mt-1.5 block text-xs text-status-rejected">
            {{ offerErrors.salaryMin }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">最高薪资</span>
          <input
            v-model="offerForm.salaryMax"
            type="number"
            min="0"
            placeholder="例如：500000"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!offerForm.received"
            :style="
              offerErrors.salaryMax ? { borderColor: 'var(--color-status-rejected)' } : undefined
            "
            :aria-invalid="Boolean(offerErrors.salaryMax)"
            @input="offerErrors.salaryMax = undefined"
          />
          <span v-if="offerErrors.salaryMax" class="mt-1.5 block text-xs text-status-rejected">
            {{ offerErrors.salaryMax }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">薪资单位</span>
          <select
            v-model="offerForm.salaryUnit"
            class="h-11 w-full cursor-pointer rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!offerForm.received"
          >
            <option value="year">年薪</option>
            <option value="month">月薪</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">入职日期</span>
          <input
            v-model="offerForm.startDate"
            type="date"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!offerForm.received"
          />
        </label>
      </div>

      <label class="mt-4 block">
        <span class="mb-2 block text-sm font-medium text-ink">备注</span>
        <textarea
          v-model="offerForm.note"
          rows="3"
          placeholder="例如：已确认薪资结构和入职时间。"
          class="w-full resize-y rounded-control border border-line bg-surface px-3 py-2.5 text-sm leading-6 text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
        />
      </label>

      <div class="mt-4 flex items-center justify-end gap-3">
        <p v-if="offerErrors.submit" class="mr-auto text-sm text-status-rejected">
          {{ offerErrors.submit }}
        </p>
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-control border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
          @click="closeForm"
        >
          取消
        </button>
        <button
          type="submit"
          class="inline-flex h-10 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          保存 Offer
        </button>
      </div>
    </form>

    <div v-else-if="job.offer" class="mt-6 rounded-card border border-line bg-surface-soft p-4 sm:p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium"
            :style="{
              color: job.offer.received
                ? 'var(--color-status-offer)'
                : 'var(--color-status-withdrawn)',
            }"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :style="{
                backgroundColor: job.offer.received
                  ? 'var(--color-status-offer)'
                  : 'var(--color-status-withdrawn)',
              }"
              aria-hidden="true"
            />
            {{ job.offer.received ? '已收到 Offer' : '未收到 Offer' }}
          </span>
        </div>

        <button
          type="button"
          class="inline-flex shrink-0 items-center rounded-control px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
          @click="openEditForm"
        >
          编辑
        </button>
      </div>

      <template v-if="job.offer.received">
        <p class="mt-4 text-base font-semibold text-ink">
          {{ job.offer.position || '职位名称未填写' }}
        </p>

        <dl class="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt class="text-xs font-medium text-ink-subtle">Offer 日期</dt>
            <dd class="mt-2 text-sm text-ink">{{ formatJobDate(job.offer.offerDate) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">薪资</dt>
            <dd class="mt-2 text-sm text-ink">{{ formatJobSalary(job.offer.salary) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">入职日期</dt>
            <dd class="mt-2 text-sm text-ink">{{ job.offer.startDate ? formatJobDate(job.offer.startDate) : '未填写' }}</dd>
          </div>
        </dl>
      </template>

      <p class="mt-4 whitespace-pre-line break-words text-sm leading-6 text-ink-muted">
        {{ job.offer.note || '无备注' }}
      </p>
      <p class="mt-3 text-xs text-ink-subtle">
        更新于 {{ formatJobDateTime(job.offer.updatedAt) }}
      </p>
    </div>

    <EmptyState
      v-else
      class="mt-6"
      title="暂无 Offer 信息"
      description="记录 Offer 状态、薪资和入职时间，方便后续比较。"
    >
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        @click="openCreateForm"
      >
        添加 Offer
      </button>
    </EmptyState>
  </section>
</template>
