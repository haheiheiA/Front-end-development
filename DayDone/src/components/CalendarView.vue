<script setup>
import { computed, ref, watch } from 'vue'
import {
  countCompleted,
  formatCompactDate,
  formatFullDate,
  fromDateKey,
  getItemsForDate,
  getRecordNote,
  normalizeRecord,
  toDateKey,
} from '../lib/daydone'

const props = defineProps({
  records: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  todayKey: {
    type: String,
    required: true,
  },
})

defineEmits(['edit-note'])

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function getMonthStart(dateKey) {
  const date = fromDateKey(dateKey)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameMonth(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  )
}

const displayedMonth = ref(getMonthStart(props.todayKey))
const selectedDateKey = ref(props.todayKey)

const monthLabel = computed(
  () => `${displayedMonth.value.getFullYear()}年${displayedMonth.value.getMonth() + 1}月`,
)

const monthCells = computed(() => {
  const year = displayedMonth.value.getFullYear()
  const month = displayedMonth.value.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({ key: `leading-${index}`, isBlank: true })
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const date = new Date(year, month, dayNumber)
    const dateKey = toDateKey(date)
    const record = normalizeRecord(props.records[dateKey])
    const dayItems = getItemsForDate(record, props.items, dateKey)
    const completedCount = countCompleted(record, dayItems)

    cells.push({
      key: dateKey,
      isBlank: false,
      date,
      dateKey,
      dayNumber,
      completedCount,
      totalCount: dayItems.length,
      hasProgress: completedCount > 0,
      isToday: dateKey === props.todayKey,
      isSelected: dateKey === selectedDateKey.value,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `trailing-${cells.length}`, isBlank: true })
  }

  return cells
})

const selectedDay = computed(() => {
  const dateKey = selectedDateKey.value
  const date = fromDateKey(dateKey)
  const record = normalizeRecord(props.records[dateKey])
  const dayItems = getItemsForDate(record, props.items, dateKey).map((item) => ({
    ...item,
    note: getRecordNote(record, item.id),
  }))
  const completedCount = countCompleted(record, dayItems)

  return {
    dateKey,
    date,
    record,
    items: dayItems,
    completedCount,
    totalCount: dayItems.length,
    title: formatFullDate(date),
  }
})

function moveMonth(offset) {
  const nextMonth = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() + offset,
    1,
  )
  displayedMonth.value = nextMonth

  const selectedDate = fromDateKey(selectedDateKey.value)

  if (!isSameMonth(selectedDate, nextMonth)) {
    selectedDateKey.value = isSameMonth(fromDateKey(props.todayKey), nextMonth)
      ? props.todayKey
      : toDateKey(nextMonth)
  }
}

watch(
  () => props.todayKey,
  (nextTodayKey, previousTodayKey) => {
    const wasShowingToday = selectedDateKey.value === previousTodayKey
    const wasShowingCurrentMonth = isSameMonth(
      displayedMonth.value,
      getMonthStart(previousTodayKey),
    )

    if (wasShowingToday) {
      selectedDateKey.value = nextTodayKey
    }

    if (wasShowingCurrentMonth) {
      displayedMonth.value = getMonthStart(nextTodayKey)
    }
  },
)
</script>

<template>
  <div class="calendar-view">
    <header class="calendar-hero">
      <p class="brand">DAY DONE</p>
      <h1>打卡日历</h1>
      <p>点击日期，查看当天状态和备注</p>
    </header>

    <section class="calendar-card" aria-labelledby="calendar-month-title">
      <div class="calendar-toolbar">
        <button
          class="calendar-toolbar__button"
          type="button"
          aria-label="上一个月"
          @click="moveMonth(-1)"
        >
          ‹
        </button>
        <h2 id="calendar-month-title">{{ monthLabel }}</h2>
        <button
          class="calendar-toolbar__button"
          type="button"
          aria-label="下一个月"
          @click="moveMonth(1)"
        >
          ›
        </button>
      </div>

      <div class="calendar-weekdays" aria-hidden="true">
        <span v-for="weekday in WEEKDAY_LABELS" :key="weekday">{{ weekday }}</span>
      </div>

      <div class="calendar-grid">
        <template v-for="cell in monthCells" :key="cell.key">
          <div v-if="cell.isBlank" class="calendar-day calendar-day--blank"></div>
          <button
            v-else
            class="calendar-day"
            :class="{
              'calendar-day--today': cell.isToday,
              'calendar-day--selected': cell.isSelected,
              'calendar-day--has-progress': cell.hasProgress,
            }"
            type="button"
            :aria-label="`${formatCompactDate(cell.date)}，完成 ${cell.completedCount} 项，共 ${cell.totalCount} 项`"
            @click="selectedDateKey = cell.dateKey"
          >
            <span class="calendar-day__number">{{ cell.dayNumber }}</span>
            <span v-if="cell.hasProgress" class="calendar-day__count">
              {{ cell.completedCount }}
            </span>
          </button>
        </template>
      </div>
    </section>

    <section class="day-detail" aria-labelledby="selected-day-title">
      <div class="day-detail__heading">
        <div>
          <h2 id="selected-day-title">{{ selectedDay.title }}</h2>
          <p>{{ selectedDay.completedCount }}/{{ selectedDay.totalCount }} 项已完成</p>
        </div>
        <span
          class="day-detail__summary"
          :class="{ 'day-detail__summary--done': selectedDay.completedCount > 0 }"
        >
          {{ selectedDay.completedCount > 0 ? '有记录' : '无记录' }}
        </span>
      </div>

      <p v-if="selectedDay.completedCount === 0" class="day-detail__empty">
        当天没有已完成项目，以下项目均按未完成显示。
      </p>

      <div class="day-detail__list">
        <article
          v-for="item in selectedDay.items"
          :key="item.id"
          class="day-detail__item"
          :class="{ 'day-detail__item--done': selectedDay.record[item.id] }"
        >
          <span class="day-detail__icon" aria-hidden="true">{{ item.emoji }}</span>
          <div class="day-detail__copy">
            <strong>{{ item.name }}</strong>
            <span v-if="item.archived" class="day-detail__archived">历史项目</span>
            <button
              v-if="item.note"
              class="day-detail__note"
              type="button"
              @click="$emit('edit-note', { dateKey: selectedDay.dateKey, itemId: item.id })"
            >
              “{{ item.note }}”
            </button>
            <button
              v-if="selectedDay.record[item.id]"
              class="day-detail__note-button"
              type="button"
              @click="$emit('edit-note', { dateKey: selectedDay.dateKey, itemId: item.id })"
            >
              {{ item.note ? '编辑备注' : '添加备注' }}
            </button>
          </div>
          <span class="day-detail__status">
            {{ selectedDay.record[item.id] ? '已完成' : '未完成' }}
          </span>
        </article>
      </div>
    </section>
  </div>
</template>

