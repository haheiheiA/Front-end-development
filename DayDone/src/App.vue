<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CalendarView from './components/CalendarView.vue'
import HomeView from './components/HomeView.vue'
import ItemManager from './components/ItemManager.vue'
import NoteEditor from './components/NoteEditor.vue'
import SettingsView from './components/SettingsView.vue'
import StatsView from './components/StatsView.vue'
import {
  DEFAULT_ITEMS,
  ITEMS_STORAGE_KEY,
  RECORDS_STORAGE_KEY,
  countCompleted,
  createCustomItem,
  getItemsForDate,
  getLastCompletion,
  getRecordNote,
  normalizeRecord,
  readItems,
  readRecords,
  removeRecordMeta,
  toDateKey,
  updateRecordMeta,
  writeItems,
  writeRecords,
} from './lib/daydone'

const HISTORY_DAYS = 7
const NAVIGATION_ITEMS = [
  { id: 'home', label: '首页' },
  { id: 'calendar', label: '日历' },
  { id: 'stats', label: '统计' },
  { id: 'settings', label: '设置' },
]

const records = ref(readRecords())
const items = ref(readItems())
const currentDate = ref(new Date())
const activeView = ref('home')
const isItemManagerOpen = ref(false)
const noteEditor = ref(null)

const todayKey = computed(() => toDateKey(currentDate.value))
const activeItems = computed(() => items.value.filter((item) => !item.archived))
const todayRecord = computed(() => normalizeRecord(records.value[todayKey.value]))
const completedCount = computed(() => countCompleted(todayRecord.value, activeItems.value))

const homeItems = computed(() =>
  activeItems.value.map((item) => ({
    ...item,
    lastCompleted: getLastCompletion(records.value, item.id, currentDate.value),
    note: getRecordNote(todayRecord.value, item.id),
  })),
)

const progressPercent = computed(() => {
  if (activeItems.value.length === 0) {
    return '0%'
  }

  return `${(completedCount.value / activeItems.value.length) * 100}%`
})

const progressMessage = computed(() => {
  if (completedCount.value === 0) {
    return '从任意一件开始吧'
  }

  if (completedCount.value === activeItems.value.length) {
    return '今天全部完成，太棒了'
  }

  return `还差 ${activeItems.value.length - completedCount.value} 件`
})

const recentDays = computed(() =>
  Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const date = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      currentDate.value.getDate() - index,
    )
    const dateKey = toDateKey(date)
    const record = normalizeRecord(records.value[dateKey])
    const dayItems = getItemsForDate(record, items.value, dateKey).map((item) => ({
      ...item,
      note: getRecordNote(record, item.id),
    }))

    return {
      dateKey,
      isToday: dateKey === todayKey.value,
      weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date),
      dateLabel: new Intl.DateTimeFormat('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      }).format(date),
      record,
      items: dayItems,
      completedCount: countCompleted(record, dayItems),
    }
  }),
)

const noteEditorItem = computed(() =>
  noteEditor.value ? items.value.find((item) => item.id === noteEditor.value.itemId) : null,
)

const noteEditorNote = computed(() => {
  if (!noteEditor.value) {
    return ''
  }

  return getRecordNote(normalizeRecord(records.value[noteEditor.value.dateKey]), noteEditor.value.itemId)
})

function ensureTodayRecord() {
  const dateKey = todayKey.value
  const record = normalizeRecord(records.value[dateKey])
  const recordWasMissing = !records.value[dateKey]
  let recordChanged = recordWasMissing

  activeItems.value.forEach((item) => {
    if (!Object.prototype.hasOwnProperty.call(record, item.id)) {
      record[item.id] = false
      recordChanged = true
    }
  })

  if (recordChanged) {
    records.value[dateKey] = record
    writeRecords(records.value)
  }
}

function toggleItem(itemId) {
  ensureTodayRecord()

  const dateKey = todayKey.value
  const record = normalizeRecord(records.value[dateKey])
  const wasCompleted = record[itemId] === true
  let nextRecord

  if (wasCompleted) {
    const existingNote = getRecordNote(record, itemId)

    if (
      existingNote &&
      !window.confirm('取消这项打卡会同时删除当天备注，确定继续吗？')
    ) {
      return
    }

    record[itemId] = false
    nextRecord = removeRecordMeta(record, itemId)
  } else {
    record[itemId] = true
    nextRecord = updateRecordMeta(record, itemId, {
      completedAt: new Date().toISOString(),
      note: '',
    })
    noteEditor.value = { dateKey, itemId }
  }

  records.value[dateKey] = nextRecord
  writeRecords(records.value)
}

function openNoteEditor({ dateKey, itemId }) {
  const record = normalizeRecord(records.value[dateKey])

  if (record[itemId] !== true) {
    return
  }

  noteEditor.value = { dateKey, itemId }
}

function closeNoteEditor() {
  noteEditor.value = null
}

function saveNote({ dateKey, itemId, note }) {
  const record = normalizeRecord(records.value[dateKey])

  if (record[itemId] !== true) {
    closeNoteEditor()
    return
  }

  records.value[dateKey] = updateRecordMeta(record, itemId, { note })
  writeRecords(records.value)
  closeNoteEditor()
}

function deleteNote({ dateKey, itemId }) {
  const record = normalizeRecord(records.value[dateKey])

  if (record[itemId] !== true) {
    closeNoteEditor()
    return
  }

  records.value[dateKey] = updateRecordMeta(record, itemId, { note: '' })
  writeRecords(records.value)
  closeNoteEditor()
}

function addItem(payload) {
  items.value = [...items.value, createCustomItem(payload, todayKey.value)]
  writeItems(items.value)
  ensureTodayRecord()
}

function updateItem(payload) {
  items.value = items.value.map((item) => {
    if (item.id !== payload.id || item.isDefault) {
      return item
    }

    return {
      ...item,
      name: payload.name.trim(),
      emoji: payload.emoji.trim(),
    }
  })
  writeItems(items.value)
}

function archiveItem(itemId) {
  items.value = items.value.map((item) => {
    if (item.id !== itemId || item.isDefault) {
      return item
    }

    return {
      ...item,
      archived: true,
      archivedOn: todayKey.value,
    }
  })
  writeItems(items.value)
}

function replaceData(payload) {
  items.value = payload.items
  records.value = payload.records
  writeItems(items.value)
  writeRecords(records.value)
  ensureTodayRecord()
}

function clearAllData() {
  window.localStorage.removeItem(RECORDS_STORAGE_KEY)
  window.localStorage.removeItem(ITEMS_STORAGE_KEY)
  records.value = {}
  items.value = [...DEFAULT_ITEMS]
  noteEditor.value = null
  isItemManagerOpen.value = false
  ensureTodayRecord()
}

function refreshTimeIfNeeded() {
  const now = new Date()
  const previousDateKey = todayKey.value
  currentDate.value = now

  if (toDateKey(now) !== previousDateKey) {
    ensureTodayRecord()
  }
}

let timeRefreshTimer

onMounted(() => {
  document.addEventListener('visibilitychange', refreshTimeIfNeeded)
  timeRefreshTimer = window.setInterval(refreshTimeIfNeeded, 60 * 1000)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', refreshTimeIfNeeded)
  window.clearInterval(timeRefreshTimer)
})

ensureTodayRecord()
</script>

<template>
  <div class="page">
    <main class="app-shell">
      <nav class="view-tabs" aria-label="页面切换">
        <button
          v-for="navigationItem in NAVIGATION_ITEMS"
          :key="navigationItem.id"
          class="view-tabs__button"
          :class="{ 'view-tabs__button--active': activeView === navigationItem.id }"
          type="button"
          :aria-current="activeView === navigationItem.id ? 'page' : undefined"
          @click="activeView = navigationItem.id"
        >
          {{ navigationItem.label }}
        </button>
      </nav>

      <HomeView
        v-if="activeView === 'home'"
        :current-date="currentDate"
        :today-key="todayKey"
        :active-items="homeItems"
        :current-record="todayRecord"
        :completed-count="completedCount"
        :progress-message="progressMessage"
        :progress-percent="progressPercent"
        :recent-days="recentDays"
        @toggle-item="toggleItem"
        @edit-note="openNoteEditor"
        @open-item-manager="isItemManagerOpen = true"
      />

      <CalendarView
        v-else-if="activeView === 'calendar'"
        :records="records"
        :items="items"
        :today-key="todayKey"
        @edit-note="openNoteEditor"
      />

      <StatsView
        v-else-if="activeView === 'stats'"
        :records="records"
        :items="items"
        :current-date="currentDate"
      />

      <SettingsView
        v-else
        :items="items"
        :records="records"
        @open-item-manager="isItemManagerOpen = true"
        @replace-data="replaceData"
        @clear-data="clearAllData"
      />

      <footer class="app-footer">数据只保存在当前浏览器的本地存储中</footer>
    </main>

    <ItemManager
      v-if="isItemManagerOpen"
      :items="items"
      @close="isItemManagerOpen = false"
      @save-item="(payload) => (payload.id ? updateItem(payload) : addItem(payload))"
      @delete-item="archiveItem"
    />

    <NoteEditor
      v-if="noteEditor && noteEditorItem"
      :date-key="noteEditor.dateKey"
      :item="noteEditorItem"
      :note="noteEditorNote"
      @close="closeNoteEditor"
      @save="saveNote"
      @delete="deleteNote"
    />
  </div>
</template>


