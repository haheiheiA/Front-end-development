<script setup>
import { computed } from 'vue'
import { fromDateKey, getMonthStats } from '../lib/daydone'

const props = defineProps({
  records: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  currentDate: {
    type: Date,
    required: true,
  },
})

const stats = computed(() => getMonthStats(props.records, props.items, props.currentDate))

function formatCompletionDate(dateKey) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  }).format(fromDateKey(dateKey))
}
</script>

<template>
  <div class="stats-view">
    <header class="stats-hero">
      <p class="brand">DAY DONE</p>
      <h1>本月统计</h1>
      <p>{{ stats.monthLabel }}的实际打卡记录</p>
    </header>

    <section class="stats-summary" aria-labelledby="monthly-total-title">
      <span id="monthly-total-title">本月总打卡</span>
      <strong>{{ stats.total }}</strong>
      <small>次</small>
    </section>

    <section class="stats-section" aria-labelledby="item-stats-title">
      <div class="section-heading">
        <h2 id="item-stats-title">项目明细</h2>
        <span>{{ stats.items.length }} 个项目</span>
      </div>

      <div class="stats-list">
        <article v-for="item in stats.items" :key="item.id" class="stats-item">
          <div class="stats-item__topline">
            <span class="stats-item__icon" aria-hidden="true">{{ item.emoji }}</span>
            <div class="stats-item__name">
              <strong>{{ item.name }}</strong>
              <span v-if="item.archived">历史项目</span>
            </div>
            <div class="stats-item__count">
              <strong>{{ item.count }}</strong>
              <span>次</span>
            </div>
          </div>

          <div v-if="item.completedDates.length" class="stats-item__dates">
            <span
              v-for="dateKey in item.completedDates"
              :key="dateKey"
              class="stats-date"
            >
              {{ formatCompletionDate(dateKey) }}
            </span>
          </div>
          <p v-else class="stats-item__empty">本月暂无完成</p>
        </article>
      </div>
    </section>
  </div>
</template>
