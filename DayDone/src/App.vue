<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const STORAGE_KEY = 'daydone.records.v1'
const HISTORY_DAYS = 7

const CHECK_ITEMS = [
  { key: 'toilet', label: '上大号', emoji: '💩', hint: '身体轻松一点' },
  { key: 'shower', label: '洗澡', emoji: '🚿', hint: '洗去一天的疲惫' },
  { key: 'laundry', label: '洗衣服', emoji: '🧺', hint: '换一身清爽' },
]

const emptyRecord = () => ({
  toilet: false,
  shower: false,
  laundry: false,
})

const padNumber = (value) => String(value).padStart(2, '0')

function toDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}


function normalizeRecord(record) {
  return {
    toilet: record?.toilet === true,
    shower: record?.shower === true,
    laundry: record?.laundry === true,
  }
}

function readRecords() {
  try {
    const rawRecords = window.localStorage.getItem(STORAGE_KEY)

    if (!rawRecords) {
      return {}
    }

    const parsedRecords = JSON.parse(rawRecords)

    if (!parsedRecords || typeof parsedRecords !== 'object' || Array.isArray(parsedRecords)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsedRecords)
        .filter(([dateKey]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey))
        .map(([dateKey, record]) => [dateKey, normalizeRecord(record)]),
    )
  } catch (error) {
    console.warn('无法读取本地打卡数据，将使用空记录。', error)
    return {}
  }
}

function writeRecords(records) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.warn('无法保存本地打卡数据。', error)
  }
}

const records = ref(readRecords())
const currentDate = ref(new Date())

const currentDateKey = computed(() => toDateKey(currentDate.value))
const currentRecord = computed(() => records.value[currentDateKey.value] ?? emptyRecord())

const completedCount = computed(
  () => CHECK_ITEMS.filter((item) => currentRecord.value[item.key]).length,
)

const progressPercent = computed(() => `${(completedCount.value / CHECK_ITEMS.length) * 100}%`)

const progressMessage = computed(() => {
  if (completedCount.value === 0) {
    return '从任意一件开始吧'
  }

  if (completedCount.value === CHECK_ITEMS.length) {
    return '今天全部完成，太棒了'
  }

  return `还差 ${CHECK_ITEMS.length - completedCount.value} 件`
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

    return {
      dateKey,
      isToday: dateKey === currentDateKey.value,
      weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date),
      dateLabel: new Intl.DateTimeFormat('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      }).format(date),
      record,
      completedCount: CHECK_ITEMS.filter((item) => record[item.key]).length,
    }
  }),
)

function ensureCurrentRecord() {
  const dateKey = currentDateKey.value

  if (!records.value[dateKey]) {
    records.value[dateKey] = emptyRecord()
    writeRecords(records.value)
  }
}

function toggleItem(itemKey) {
  ensureCurrentRecord()

  const record = records.value[currentDateKey.value]
  record[itemKey] = !record[itemKey]
  writeRecords(records.value)
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

function refreshDateIfNeeded() {
  const now = new Date()

  if (toDateKey(now) !== currentDateKey.value) {
    currentDate.value = now
    ensureCurrentRecord()
  }
}

ensureCurrentRecord()

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
      <header class="hero">
        <div class="hero__topline">
          <p class="brand">DAY DONE</p>
          <span class="today-badge">今天</span>
        </div>

        <h1>三件小事，完成了就很棒</h1>
        <p class="hero__date">{{ formatFullDate(currentDate) }}</p>

        <div class="progress-card" aria-live="polite">
          <div class="progress-card__number">
            <strong>{{ completedCount }}</strong>
            <span>/ {{ CHECK_ITEMS.length }}</span>
          </div>

          <div class="progress-card__content">
            <div class="progress-card__label">
              <strong>今日进度</strong>
              <span>{{ progressMessage }}</span>
            </div>
            <div class="progress-track" aria-hidden="true">
              <span :style="{ width: progressPercent }"></span>
            </div>
          </div>
        </div>
      </header>

      <section class="habit-section" aria-labelledby="habit-title">
        <div class="section-heading">
          <h2 id="habit-title">今天打卡</h2>
          <span>{{ completedCount }}/{{ CHECK_ITEMS.length }} 完成</span>
        </div>

        <div class="habit-list">
          <article
            v-for="item in CHECK_ITEMS"
            :key="item.key"
            class="habit-card"
            :class="{ 'habit-card--done': currentRecord[item.key] }"
          >
            <div class="habit-card__icon" aria-hidden="true">
              <span>{{ item.emoji }}</span>
              <span class="habit-card__check">✓</span>
            </div>

            <div class="habit-card__copy">
              <h3>{{ item.label }}</h3>
              <p>{{ currentRecord[item.key] ? '今天已完成' : item.hint }}</p>
            </div>

            <button
              class="habit-card__button"
              type="button"
              :aria-pressed="currentRecord[item.key]"
              :aria-label="`${currentRecord[item.key] ? '取消' : '完成'}${item.label}打卡`"
              @click="toggleItem(item.key)"
            >
              {{ currentRecord[item.key] ? '取消打卡' : '完成打卡' }}
            </button>
          </article>
        </div>
      </section>

      <section class="history-section" aria-labelledby="history-title">
        <div class="section-heading">
          <h2 id="history-title">最近 7 天</h2>
          <span>只读记录</span>
        </div>

        <div class="history-list">
          <article
            v-for="day in recentDays"
            :key="day.dateKey"
            class="history-row"
            :class="{ 'history-row--today': day.isToday }"
          >
            <div class="history-date">
              <strong>{{ day.isToday ? '今天' : day.weekday }}</strong>
              <span>{{ day.dateLabel }}</span>
            </div>

            <div
              class="history-items"
              :aria-label="`${day.dateLabel}完成 ${day.completedCount} 项，共 3 项`"
            >
              <span
                v-for="item in CHECK_ITEMS"
                :key="item.key"
                class="history-item"
                :class="{ 'history-item--done': day.record[item.key] }"
                role="img"
                :aria-label="`${item.label}${day.record[item.key] ? '已完成' : '未完成'}`"
              >
                {{ item.emoji }}
              </span>
            </div>

            <strong class="history-score">{{ day.completedCount }}/3</strong>
          </article>
        </div>
      </section>

      <footer class="app-footer">数据只保存在当前浏览器的本地存储中</footer>
    </main>
  </div>
</template>

