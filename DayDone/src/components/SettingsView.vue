<script setup>
import { ref } from 'vue'
import { createBackupPayload, parseBackupText, toDateKey } from '../lib/daydone'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  records: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open-item-manager', 'replace-data', 'clear-data'])

const fileInput = ref(null)
const status = ref(null)
const isConfirmingClear = ref(false)

function setStatus(type, message) {
  status.value = { type, message }
}

function exportData() {
  const payload = createBackupPayload(props.items, props.records)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `daydone-backup-${toDateKey(new Date())}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  setStatus('success', '备份文件已生成，请保存到手机或电脑。')
}

function selectImportFile() {
  fileInput.value?.click()
}

async function importData(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  try {
    const parsedData = parseBackupText(await file.text())
    const confirmed = window.confirm(
      '导入会覆盖当前所有打卡记录和自定义项目配置，确定继续吗？',
    )

    if (!confirmed) {
      setStatus('info', '已取消导入，当前数据没有变化。')
      return
    }

    emit('replace-data', parsedData)
    setStatus('success', '数据导入成功，已恢复备份中的项目和记录。')
  } catch (error) {
    setStatus('error', error instanceof Error ? error.message : '导入失败，请检查文件。')
  } finally {
    event.target.value = ''
  }
}

function requestClearData() {
  isConfirmingClear.value = true
  setStatus(null)
}

function cancelClearData() {
  isConfirmingClear.value = false
}

function confirmClearData() {
  emit('clear-data')
  isConfirmingClear.value = false
  setStatus('success', '所有打卡记录和自定义项目已清空。')
}
</script>

<template>
  <div class="settings-view">
    <header class="settings-hero">
      <p class="brand">DAY DONE</p>
      <h1>设置</h1>
      <p>管理打卡项目与本地数据</p>
    </header>

    <section class="settings-card" aria-labelledby="project-settings-title">
      <div class="settings-card__heading">
        <div>
          <h2 id="project-settings-title">打卡项目</h2>
          <p>新增、编辑或删除自定义项目</p>
        </div>
      </div>
      <button class="settings-button settings-button--primary" type="button" @click="$emit('open-item-manager')">
        管理打卡项目
      </button>
    </section>

    <section class="settings-card" aria-labelledby="data-settings-title">
      <div class="settings-card__heading">
        <div>
          <h2 id="data-settings-title">数据管理</h2>
          <p>备份、恢复或清空当前浏览器中的数据</p>
        </div>
      </div>

      <div class="settings-actions">
        <button class="settings-button" type="button" @click="exportData">导出数据</button>
        <button class="settings-button" type="button" @click="selectImportFile">导入数据</button>
        <input
          ref="fileInput"
          class="sr-only"
          type="file"
          accept=".json,application/json"
          @change="importData"
        />
        <button class="settings-button settings-button--danger" type="button" @click="requestClearData">
          清空所有数据
        </button>
      </div>
    </section>

    <section v-if="isConfirmingClear" class="clear-confirmation" role="alert">
      <strong>确认清空所有数据？</strong>
      <p>这会删除全部打卡记录、备注、自定义项目和归档信息，且无法撤销。</p>
      <div class="clear-confirmation__actions">
        <button class="secondary-button" type="button" @click="cancelClearData">取消</button>
        <button class="danger-button" type="button" @click="confirmClearData">确认清空</button>
      </div>
    </section>

    <p v-if="status" class="settings-status" :class="`settings-status--${status.type}`">
      {{ status.message }}
    </p>

    <p class="settings-note">
      数据只保存在当前浏览器中。更换设备或清理浏览器数据前，请先导出备份。
    </p>
  </div>
</template>

