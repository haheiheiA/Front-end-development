<script setup>
import { formatFullDate } from '../lib/daydone'

defineProps({
  currentDate: {
    type: Date,
    required: true,
  },
  todayKey: {
    type: String,
    required: true,
  },
  activeItems: {
    type: Array,
    required: true,
  },
  currentRecord: {
    type: Object,
    required: true,
  },
  completedCount: {
    type: Number,
    required: true,
  },
  progressMessage: {
    type: String,
    required: true,
  },
  progressPercent: {
    type: String,
    required: true,
  },
  recentDays: {
    type: Array,
    required: true,
  },
})

defineEmits(['toggle-item', 'edit-note', 'open-item-manager'])
</script>

<template>
  <div class="home-view">
    <header class="hero">
      <div class="hero__topline">
        <p class="brand">DAY DONE</p>
        <span class="today-badge">今天</span>
      </div>

      <h1>完成今天的小事</h1>
      <p class="hero__date">{{ formatFullDate(currentDate) }}</p>

      <div class="progress-card" aria-live="polite">
        <div class="progress-card__number">
          <strong>{{ completedCount }}</strong>
          <span>/ {{ activeItems.length }}</span>
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
        <div class="section-heading__actions">
          <span>{{ completedCount }}/{{ activeItems.length }} 完成</span>
          <button class="section-heading__button" type="button" @click="$emit('open-item-manager')">
            管理项目
          </button>
        </div>
      </div>

      <div class="habit-list">
        <article
          v-for="item in activeItems"
          :key="item.id"
          class="habit-card"
          :class="{ 'habit-card--done': currentRecord[item.id] }"
        >
          <div class="habit-card__icon" aria-hidden="true">
            <span>{{ item.emoji }}</span>
            <span class="habit-card__check">✓</span>
          </div>

          <div class="habit-card__copy">
            <h3>{{ item.name }}</h3>
            <div class="habit-card__last">
              <template v-if="item.lastCompleted">
                <span>上次：{{ item.lastCompleted.lastLabel }}</span>
                <span>距今：{{ item.lastCompleted.distanceLabel }}</span>
              </template>
              <span v-else>暂无记录</span>
            </div>
            <button
              v-if="item.note"
              class="habit-card__note-preview"
              type="button"
              @click="$emit('edit-note', { dateKey: todayKey, itemId: item.id })"
            >
              “{{ item.note }}”
            </button>
            <button
              v-if="currentRecord[item.id]"
              class="habit-card__note-button"
              type="button"
              @click="$emit('edit-note', { dateKey: todayKey, itemId: item.id })"
            >
              {{ item.note ? '编辑备注' : '添加备注' }}
            </button>
          </div>

          <button
            class="habit-card__button"
            type="button"
            :aria-pressed="currentRecord[item.id] === true"
            :aria-label="`${currentRecord[item.id] ? '取消' : '完成'}${item.name}打卡`"
            @click="$emit('toggle-item', item.id)"
          >
            {{ currentRecord[item.id] ? '取消打卡' : '完成打卡' }}
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
            :aria-label="`${day.dateLabel}完成 ${day.completedCount} 项，共 ${day.items.length} 项`"
          >
            <span
              v-for="item in day.items"
              :key="item.id"
              class="history-item"
              :class="{ 'history-item--done': day.record[item.id] }"
              role="img"
              :aria-label="`${item.name}${day.record[item.id] ? '已完成' : '未完成'}${item.note ? `，备注：${item.note}` : ''}`"
            >
              {{ item.emoji }}
              <span v-if="item.note" class="history-item__note" aria-hidden="true"></span>
            </span>
          </div>

          <strong class="history-score">{{ day.completedCount }}/{{ day.items.length }}</strong>
        </article>
      </div>
    </section>
  </div>
</template>

