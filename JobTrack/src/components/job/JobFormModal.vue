<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import JobForm from './JobForm.vue'
import type { Job } from '../../types/job'

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'edit'
    job?: Job
    errorMessage?: string
  }>(),
  {
    errorMessage: '',
  },
)

const emit = defineEmits<{
  close: []
  save: [job: Job]
}>()

const title = computed(() => (props.mode === 'create' ? '添加岗位' : '编辑岗位'))
const submitLabel = computed(() => (props.mode === 'create' ? '保存岗位' : '保存修改'))
const dialogRoot = ref<HTMLElement | null>(null)
let previousOverflow = ''
let previousActiveElement: HTMLElement | null = null

function getFocusableElements() {
  if (!dialogRoot.value) return []

  return Array.from(
    dialogRoot.value.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab') return

  const focusable = getFocusableElements()
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previousOverflow = document.body.style.overflow
  previousActiveElement = document.activeElement as HTMLElement | null
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKeydown)
  nextTick(() => {
    const firstField = dialogRoot.value?.querySelector<HTMLElement>(
      'input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
    )
    firstField?.focus()
  })
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  window.removeEventListener('keydown', handleKeydown)
  previousActiveElement?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-4 sm:p-6">
      <section
        ref="dialogRoot"
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-form-modal-title"
        class="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card sm:max-h-[calc(100vh-3rem)]"
      >
        <header class="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="job-form-modal-title" class="text-base font-semibold tracking-tight text-ink">
              {{ title }}
            </h2>
            <p class="mt-1 text-xs text-ink-subtle">
              {{ mode === 'create' ? '填写岗位核心信息。' : '更新岗位信息并保存。' }}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-lg leading-none text-ink-muted transition-colors hover:border-line-strong hover:bg-surface-soft hover:text-ink"
            aria-label="关闭岗位表单"
            @click="emit('close')"
          >
            ×
          </button>
        </header>

        <div class="min-h-0 overflow-y-auto">
          <JobForm
            :key="job?.id ?? 'create'"
            embedded
            :initial-job="job"
            :submit-label="submitLabel"
            :error-message="errorMessage"
            @save="emit('save', $event)"
            @cancel="emit('close')"
          />
        </div>
      </section>
    </div>
  </Teleport>
</template>
