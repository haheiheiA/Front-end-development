<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['close', 'save-item', 'delete-item'])

const isFormOpen = ref(false)
const editingId = ref('')
const formError = ref('')
const form = reactive({
  name: '',
  emoji: '',
})

const defaultItems = computed(() => props.items.filter((item) => item.isDefault))
const customItems = computed(() => props.items.filter((item) => !item.isDefault && !item.archived))
const editingItem = computed(() =>
  customItems.value.find((item) => item.id === editingId.value),
)

function resetForm() {
  isFormOpen.value = false
  editingId.value = ''
  formError.value = ''
  form.name = ''
  form.emoji = ''
}

function openAddForm() {
  resetForm()
  isFormOpen.value = true
}

function openEditForm(item) {
  editingId.value = item.id
  form.name = item.name
  form.emoji = item.emoji
  formError.value = ''
  isFormOpen.value = true
}

function submitForm() {
  const name = form.name.trim()
  const emoji = form.emoji.trim()

  if (!name) {
    formError.value = '请输入项目名称。'
    return
  }

  if (!emoji) {
    formError.value = '请输入一个 Emoji 图标。'
    return
  }

  emit('save-item', {
    id: editingId.value,
    name,
    emoji,
  })
  resetForm()
}

function deleteItem(item) {
  const confirmed = window.confirm(
    `确定删除“${item.name}”吗？首页将不再显示它，但过去已经产生的打卡记录会保留。`,
  )

  if (confirmed) {
    emit('delete-item', item.id)
  }
}

function closeManager() {
  emit('close')
}

function handleKeydown(event) {
  if (event.key !== 'Escape') {
    return
  }

  if (isFormOpen.value) {
    resetForm()
  } else {
    closeManager()
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
    <div class="item-manager-backdrop" @click.self="closeManager">
      <section
        class="item-manager"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-manager-title"
      >
        <header class="item-manager__header">
          <div>
            <p class="brand">DAY DONE</p>
            <h2 id="item-manager-title">{{ isFormOpen ? (editingItem ? '编辑项目' : '新增项目') : '管理打卡项目' }}</h2>
          </div>
          <button
            class="icon-button"
            type="button"
            aria-label="关闭项目管理"
            @click="closeManager"
          >
            ×
          </button>
        </header>

        <template v-if="!isFormOpen">
          <div class="item-manager__section-heading">
            <h3>默认项目</h3>
            <span>固定保留</span>
          </div>

          <div class="manager-list">
            <article v-for="item in defaultItems" :key="item.id" class="manager-item">
              <span class="manager-item__icon" aria-hidden="true">{{ item.emoji }}</span>
              <div class="manager-item__copy">
                <strong>{{ item.name }}</strong>
                <span>默认打卡项目</span>
              </div>
              <span class="manager-item__locked">固定</span>
            </article>
          </div>

          <div class="item-manager__section-heading item-manager__section-heading--custom">
            <div>
              <h3>自定义项目</h3>
              <span>{{ customItems.length }} 项</span>
            </div>
            <button class="small-primary-button" type="button" @click="openAddForm">
              新增项目
            </button>
          </div>

          <div v-if="customItems.length" class="manager-list">
            <article v-for="item in customItems" :key="item.id" class="manager-item">
              <span class="manager-item__icon" aria-hidden="true">{{ item.emoji }}</span>
              <div class="manager-item__copy">
                <strong>{{ item.name }}</strong>
                <span>自定义打卡项目</span>
              </div>
              <div class="manager-item__actions">
                <button type="button" @click="openEditForm(item)">编辑</button>
                <button class="manager-item__delete" type="button" @click="deleteItem(item)">
                  删除
                </button>
              </div>
            </article>
          </div>

          <p v-else class="manager-empty">还没有自定义项目，可以按自己的习惯新增。</p>
        </template>

        <form v-else class="manager-form" @submit.prevent="submitForm">
          <label class="manager-form__field">
            <span>项目名称</span>
            <input
              v-model="form.name"
              type="text"
              maxlength="16"
              autocomplete="off"
              placeholder="例如：喝够八杯水"
              autofocus
            />
          </label>

          <label class="manager-form__field">
            <span>Emoji 图标</span>
            <input
              v-model="form.emoji"
              type="text"
              maxlength="8"
              autocomplete="off"
              placeholder="例如：💧"
            />
          </label>
          <p class="manager-form__tip">Emoji 用于首页卡片和日历记录。</p>

          <p v-if="formError" class="manager-form__error" role="alert">{{ formError }}</p>

          <div class="manager-form__actions">
            <button class="secondary-button" type="button" @click="resetForm">取消</button>
            <button class="primary-button" type="submit">
              {{ editingItem ? '保存修改' : '添加项目' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
