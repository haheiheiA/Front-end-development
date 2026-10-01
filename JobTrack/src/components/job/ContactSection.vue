<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import EmptyState from '../common/EmptyState.vue'
import { useJobStore } from '../../stores/job'
import type { ContactRecord, Job } from '../../types/job'
import { formatJobDateTime } from '../../utils/job'

interface ContactFormState {
  name: string
  role: string
  email: string
  phone: string
  linkedin: string
  note: string
}

interface ContactFormErrors {
  name?: string
  email?: string
  linkedin?: string
  submit?: string
}

const props = defineProps<{
  job: Job
}>()

const jobStore = useJobStore()
const isFormOpen = ref(false)
const editingContactId = ref<string | null>(null)
const contactForm = reactive<ContactFormState>(getEmptyFormState())
const contactErrors = reactive<ContactFormErrors>({})

watch(
  () => props.job.id,
  () => closeForm(),
)

function getEmptyFormState(): ContactFormState {
  return {
    name: '',
    role: '',
    email: '',
    phone: '',
    linkedin: '',
    note: '',
  }
}

function getFormState(contact: ContactRecord): ContactFormState {
  return {
    name: contact.name,
    role: contact.role ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    linkedin: contact.linkedin ?? '',
    note: contact.note ?? '',
  }
}

function clearErrors() {
  contactErrors.name = undefined
  contactErrors.email = undefined
  contactErrors.linkedin = undefined
  contactErrors.submit = undefined
}

function openCreateForm() {
  editingContactId.value = null
  Object.assign(contactForm, getEmptyFormState())
  clearErrors()
  isFormOpen.value = true
}

function openEditForm(contact: ContactRecord) {
  editingContactId.value = contact.id
  Object.assign(contactForm, getFormState(contact))
  clearErrors()
  isFormOpen.value = true
}

function closeForm() {
  editingContactId.value = null
  Object.assign(contactForm, getEmptyFormState())
  clearErrors()
  isFormOpen.value = false
}

function isValidLinkedInUrl(value: string) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const url = new URL(candidate)

    return Boolean(url.hostname && url.hostname.includes('.'))
  } catch {
    return false
  }
}

function validateForm() {
  clearErrors()

  const email = contactForm.email.trim()
  const linkedin = contactForm.linkedin.trim()

  contactErrors.name = contactForm.name.trim() ? undefined : '请输入联系人姓名'

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    contactErrors.email = '请输入有效的邮箱地址'
  }

  if (linkedin && !isValidLinkedInUrl(linkedin)) {
    contactErrors.linkedin = '请输入有效的 LinkedIn 链接'
  }

  return !Object.values(contactErrors).some(Boolean)
}

function handleSubmit() {
  if (!validateForm()) return

  try {
    const now = new Date().toISOString()
    const existingContacts = props.job.contacts ?? []
    const existingContact = editingContactId.value
      ? existingContacts.find((contact) => contact.id === editingContactId.value)
      : undefined
    const contact: ContactRecord = {
      id: existingContact?.id ?? crypto.randomUUID(),
      name: contactForm.name.trim(),
      role: contactForm.role.trim() || undefined,
      email: contactForm.email.trim() || undefined,
      phone: contactForm.phone.trim() || undefined,
      linkedin: contactForm.linkedin.trim() || undefined,
      note: contactForm.note.trim() || undefined,
      createdAt: existingContact?.createdAt ?? now,
      updatedAt: now,
    }
    const nextContacts = existingContact
      ? existingContacts.map((item) => (item.id === existingContact.id ? contact : item))
      : [...existingContacts, contact]

    jobStore.updateJob({
      ...props.job,
      contacts: nextContacts,
      updatedAt: now,
    })
    closeForm()
  } catch {
    contactErrors.submit = '保存失败，请稍后重试。'
  }
}
</script>

<template>
  <section class="surface-card bg-surface-soft/60 p-6 lg:p-7">
    <div class="flex items-start justify-between gap-6">
      <div>
        <h2 class="text-base font-semibold tracking-tight text-ink">联系人</h2>
        <p class="mt-1 text-sm text-ink-muted">
          {{
            (job.contacts ?? []).length > 0
              ? `已记录 ${(job.contacts ?? []).length} 位联系人。`
              : '尚未记录联系人。'
          }}
        </p>
      </div>

      <button
        v-if="!isFormOpen"
        type="button"
        class="inline-flex h-10 shrink-0 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        @click="openCreateForm"
      >
        添加联系人
      </button>
    </div>

    <form
      v-if="isFormOpen"
      class="mt-6 rounded-card border border-line bg-surface-soft p-4 sm:p-5"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">
            姓名 <span class="text-status-rejected">*</span>
          </span>
          <input
            v-model="contactForm.name"
            type="text"
            autocomplete="name"
            placeholder="例如：张女士"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            :style="contactErrors.name ? { borderColor: 'var(--color-status-rejected)' } : undefined"
            :aria-invalid="Boolean(contactErrors.name)"
            @input="contactErrors.name = undefined"
          />
          <span v-if="contactErrors.name" class="mt-1.5 block text-xs text-status-rejected">
            {{ contactErrors.name }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">职位 / 身份</span>
          <input
            v-model="contactForm.role"
            type="text"
            placeholder="例如：招聘 HR"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">邮箱</span>
          <input
            v-model="contactForm.email"
            type="email"
            autocomplete="email"
            placeholder="例如：hr@example.com"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            :style="
              contactErrors.email ? { borderColor: 'var(--color-status-rejected)' } : undefined
            "
            :aria-invalid="Boolean(contactErrors.email)"
            @input="contactErrors.email = undefined"
          />
          <span v-if="contactErrors.email" class="mt-1.5 block text-xs text-status-rejected">
            {{ contactErrors.email }}
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-ink">电话</span>
          <input
            v-model="contactForm.phone"
            type="tel"
            autocomplete="tel"
            placeholder="例如：138 0000 0000"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
          />
        </label>

        <label class="block sm:col-span-2">
          <span class="mb-2 block text-sm font-medium text-ink">LinkedIn</span>
          <input
            v-model="contactForm.linkedin"
            type="url"
            placeholder="例如：https://www.linkedin.com/in/example"
            class="h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
            :style="
              contactErrors.linkedin
                ? { borderColor: 'var(--color-status-rejected)' }
                : undefined
            "
            :aria-invalid="Boolean(contactErrors.linkedin)"
            @input="contactErrors.linkedin = undefined"
          />
          <span v-if="contactErrors.linkedin" class="mt-1.5 block text-xs text-status-rejected">
            {{ contactErrors.linkedin }}
          </span>
        </label>
      </div>

      <label class="mt-4 block">
        <span class="mb-2 block text-sm font-medium text-ink">备注</span>
        <textarea
          v-model="contactForm.note"
          rows="3"
          placeholder="例如：负责该岗位的招聘沟通。"
          class="w-full resize-y rounded-control border border-line bg-surface px-3 py-2.5 text-sm leading-6 text-ink transition-colors placeholder:text-ink-subtle focus-visible:border-focus"
        />
      </label>

      <div class="mt-4 flex items-center justify-end gap-3">
        <p v-if="contactErrors.submit" class="mr-auto text-sm text-status-rejected">
          {{ contactErrors.submit }}
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
          {{ editingContactId ? '保存修改' : '保存联系人' }}
        </button>
      </div>
    </form>

    <div v-if="(job.contacts ?? []).length > 0" class="mt-6 space-y-3">
      <article
        v-for="contact in job.contacts ?? []"
        :key="contact.id"
        class="rounded-card border border-line bg-surface-soft p-4 sm:p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink">{{ contact.name }}</p>
            <p class="mt-1 text-xs text-ink-subtle">{{ contact.role || '职位 / 身份未填写' }}</p>
          </div>

          <button
            type="button"
            class="inline-flex shrink-0 items-center rounded-control px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
            @click="openEditForm(contact)"
          >
            编辑
          </button>
        </div>

        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="min-w-0">
            <dt class="text-xs font-medium text-ink-subtle">邮箱</dt>
            <dd class="mt-1.5 break-all text-sm text-ink">{{ contact.email || '未填写' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-ink-subtle">电话</dt>
            <dd class="mt-1.5 text-sm text-ink">{{ contact.phone || '未填写' }}</dd>
          </div>
          <div class="min-w-0 sm:col-span-2">
            <dt class="text-xs font-medium text-ink-subtle">LinkedIn</dt>
            <dd class="mt-1.5 break-all text-sm text-ink">{{ contact.linkedin || '未填写' }}</dd>
          </div>
        </dl>

        <p class="mt-4 whitespace-pre-line break-words text-sm leading-6 text-ink-muted">
          {{ contact.note || '无备注' }}
        </p>
        <p class="mt-3 text-xs text-ink-subtle">
          更新于 {{ formatJobDateTime(contact.updatedAt) }}
        </p>
      </article>
    </div>

    <EmptyState
      v-else-if="!isFormOpen"
      class="mt-6"
      title="暂无联系人"
      description="添加联系人，记录 HR 或招聘人员的联系方式。"
    >
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        @click="openCreateForm"
      >
        添加联系人
      </button>
    </EmptyState>
  </section>
</template>
