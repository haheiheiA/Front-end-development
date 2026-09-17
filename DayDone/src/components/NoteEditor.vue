<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { formatCompactDate, fromDateKey } from '../lib/daydone'

const props = defineProps({
  dateKey: {
    type: String,
    required: true,
  },
  item: {
    type: Object,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'save', 'delete'])

const draft = ref(props.note)

function closeEditor() {
  emit('close')
}

function saveNote() {
  emit('save', {
    dateKey: props.dateKey,
    itemId: props.item.id,
    note: draft.value.trim(),
  })
}

function deleteNote() {
  emit('delete', {
    dateKey: props.dateKey,
    itemId: props.item.id,
  })
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeEditor()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="note-editor-backdrop" @click.self="closeEditor">
      <section
        class="note-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-title"
      >
        <header class="note-editor__header">
          <div class="note-editor__title">
            <span class="note-editor__icon" aria-hidden="true">{{ item.emoji }}</span>
            <div>
              <h2 id="note-editor-title">{{ note ? '编辑备注' : '添加备注' }}</h2>
              <p>{{ item.name }} · {{ formatCompactDate(fromDateKey(dateKey)) }}</p>
            </div>
          </div>
          <button class="icon-button" type="button" aria-label="关闭备注编辑" @click="closeEditor">
            ×
          </button>
        </header>

        <p class="note-editor__tip">备注是可选的，不填写也可以正常打卡。</p>

        <label class="note-editor__field">
          <span class="sr-only">打卡备注</span>
          <textarea
            v-model="draft"
            maxlength="300"
            rows="5"
            placeholder="记录今天发生的事，例如：今天用了新买的沐浴露"
            autofocus
          ></textarea>
        </label>
        <div class="note-editor__counter">{{ draft.length }}/300</div>

        <div class="note-editor__actions">
          <button
            v-if="note"
            class="danger-text-button"
            type="button"
            @click="deleteNote"
          >
            删除备注
          </button>
          <button class="secondary-button" type="button" @click="closeEditor">
            {{ note ? '取消' : '暂不填写' }}
          </button>
          <button class="primary-button" type="button" @click="saveNote">保存备注</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
