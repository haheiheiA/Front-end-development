<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CalendarView from './components/CalendarView.vue'
import HomeView from './components/HomeView.vue'
import ItemManager from './components/ItemManager.vue'
import {
  countCompleted,
  createCustomItem,
  getItemsForDate,
  normalizeRecord,
  readItems,
  readRecords,
  toDateKey,
  writeItems,
  writeRecords,
} from './lib/daydone'

const HISTORY_DAYS = 7

const records = ref(readRecords())
const items = ref(readItems())
const currentDate = ref(new Date())
const activeView = ref('home')
const isItemManagerOpen = ref(false)

const todayKey = computed(() => toDateKey(currentDate.value))
const activeItems = computed(() => items.value.filter((item) => !item.archived))
const todayRecord = computed(() => records.value[todayKey.value] ?? {})
const completedCount = computed(() => countCompleted(todayRecord.value, activeItems.value))

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
    const dayItems = getItemsForDate(record, items.value, dateKey)

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

  const record = records.value[todayKey.value]
  record[itemId] = record[itemId] !== true
  writeRecords(records.value)
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

function refreshDateIfNeeded() {
  const now = new Date()

  if (toDateKey(now) !== todayKey.value) {
    currentDate.value = now
    ensureTodayRecord()
  }
}

ensureTodayRecord()

onMounted(() => {
  document.addEventListener('visibilitychange', refreshDateIfNeeded)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', refreshDateIfNeeded)
})
</script>

<template>
  <div class="page">
    <main class="app-shell">
      <nav class="view-tabs" aria-label="页面切换">
        <button
          class="view-tabs__button"
          :class="{ 'view-tabs__button--active': activeView === 'home' }"
          type="button"
          :aria-current="activeView === 'home' ? 'page' : undefined"
          @click="activeView = 'home'"
        >
          首页
        </button>
        <button
          class="view-tabs__button"
          :class="{ 'view-tabs__button--active': activeView === 'calendar' }"
          type="button"
          :aria-current="activeView === 'calendar' ? 'page' : undefined"
          @click="activeView = 'calendar'"
        >
          日历
        </button>
      </nav>

      <HomeView
        v-if="activeView === 'home'"
        :current-date="currentDate"
        :active-items="activeItems"
        :current-record="todayRecord"
        :completed-count="completedCount"
        :progress-message="progressMessage"
        :progress-percent="progressPercent"
        :recent-days="recentDays"
        @toggle-item="toggleItem"
        @open-item-manager="isItemManagerOpen = true"
      />

      <CalendarView
        v-else
        :records="records"
        :items="items"
        :today-key="todayKey"
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
  </div>
</template>


