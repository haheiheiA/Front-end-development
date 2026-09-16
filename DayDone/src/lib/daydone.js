export const RECORDS_STORAGE_KEY = 'daydone.records.v1'
export const ITEMS_STORAGE_KEY = 'daydone.items.v1'
export const RECORD_META_KEY = '_meta'
export const BACKUP_FORMAT = 'daydone-backup'
export const BACKUP_VERSION = 3

export const DEFAULT_ITEMS = Object.freeze([
  Object.freeze({
    id: 'toilet',
    name: '上大号',
    emoji: '💩',
    hint: '身体轻松一点',
    isDefault: true,
    archived: false,
    createdOn: null,
    archivedOn: null,
  }),
  Object.freeze({
    id: 'shower',
    name: '洗澡',
    emoji: '🚿',
    hint: '洗去一天的疲惫',
    isDefault: true,
    archived: false,
    createdOn: null,
    archivedOn: null,
  }),
  Object.freeze({
    id: 'laundry',
    name: '洗衣服',
    emoji: '🧺',
    hint: '换一身清爽',
    isDefault: true,
    archived: false,
    createdOn: null,
    archivedOn: null,
  }),
])

const DEFAULT_ITEM_IDS = new Set(DEFAULT_ITEMS.map((item) => item.id))
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const padNumber = (value) => String(value).padStart(2, '0')

export function toDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`
}

export function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isValidDateKey(value) {
  return typeof value === 'string' && DATE_KEY_PATTERN.test(value)
}

function normalizeMetaEntry(entry) {
  if (!isPlainObject(entry)) {
    return null
  }

  const completedAt =
    typeof entry.completedAt === 'string' && !Number.isNaN(Date.parse(entry.completedAt))
      ? entry.completedAt
      : null
  const note = typeof entry.note === 'string' ? entry.note.trim().slice(0, 300) : ''

  if (!completedAt && !note) {
    return null
  }

  return {
    ...(completedAt ? { completedAt } : {}),
    ...(note ? { note } : {}),
  }
}

function normalizeRecordMeta(meta) {
  if (!isPlainObject(meta)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(meta)
      .map(([itemId, entry]) => [itemId, normalizeMetaEntry(entry)])
      .filter(([, entry]) => entry !== null),
  )
}

export function normalizeRecord(record) {
  if (!isPlainObject(record)) {
    return {}
  }

  const normalizedRecord = Object.fromEntries(
    Object.entries(record).filter(
      ([key, value]) =>
        key !== RECORD_META_KEY && typeof key === 'string' && typeof value === 'boolean',
    ),
  )
  const meta = normalizeRecordMeta(record[RECORD_META_KEY])

  if (Object.keys(meta).length > 0) {
    normalizedRecord[RECORD_META_KEY] = meta
  }

  return normalizedRecord
}

export function normalizeRecords(records) {
  if (!isPlainObject(records)) {
    return null
  }

  return Object.fromEntries(
    Object.entries(records)
      .filter(([dateKey]) => isValidDateKey(dateKey))
      .map(([dateKey, record]) => [dateKey, normalizeRecord(record)]),
  )
}

export function readRecords() {
  try {
    const rawRecords = window.localStorage.getItem(RECORDS_STORAGE_KEY)

    if (!rawRecords) {
      return {}
    }

    return normalizeRecords(JSON.parse(rawRecords)) ?? {}
  } catch (error) {
    console.warn('无法读取本地打卡数据，将使用空记录。', error)
    return {}
  }
}

export function writeRecords(records) {
  try {
    window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.warn('无法保存本地打卡数据。', error)
  }
}

function normalizeCustomItem(item) {
  if (!isPlainObject(item)) {
    return null
  }

  const id = typeof item.id === 'string' ? item.id.trim() : ''
  const name = typeof item.name === 'string' ? item.name.trim() : ''
  const emoji = typeof item.emoji === 'string' ? item.emoji.trim() : ''

  if (!id || DEFAULT_ITEM_IDS.has(id) || !name || !emoji) {
    return null
  }

  return {
    id,
    name,
    emoji,
    hint: typeof item.hint === 'string' ? item.hint.trim() : '',
    isDefault: false,
    archived: item.archived === true,
    createdOn: isValidDateKey(item.createdOn) ? item.createdOn : null,
    archivedOn: isValidDateKey(item.archivedOn) ? item.archivedOn : null,
  }
}

export function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return null
  }

  const seenIds = new Set(DEFAULT_ITEM_IDS)
  const customItems = []

  items.forEach((item) => {
    const normalizedItem = normalizeCustomItem(item)

    if (!normalizedItem || seenIds.has(normalizedItem.id)) {
      return
    }

    seenIds.add(normalizedItem.id)
    customItems.push(normalizedItem)
  })

  return [...DEFAULT_ITEMS, ...customItems]
}

export function readItems() {
  try {
    const rawItems = window.localStorage.getItem(ITEMS_STORAGE_KEY)

    if (!rawItems) {
      return [...DEFAULT_ITEMS]
    }

    return normalizeItems(JSON.parse(rawItems)) ?? [...DEFAULT_ITEMS]
  } catch (error) {
    console.warn('无法读取本地项目配置，将使用默认项目。', error)
    return [...DEFAULT_ITEMS]
  }
}

export function writeItems(items) {
  try {
    window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('无法保存本地项目配置。', error)
  }
}

export function createCustomItem({ name, emoji }, dateKey) {
  const randomPart = Math.random().toString(36).slice(2, 8)

  return {
    id: `custom-${Date.now()}-${randomPart}`,
    name: name.trim(),
    emoji: emoji.trim(),
    hint: '自定义打卡项目',
    isDefault: false,
    archived: false,
    createdOn: dateKey,
    archivedOn: null,
  }
}

export function itemAppliesToDate(item, dateKey) {
  if (item.isDefault) {
    return true
  }

  if (item.createdOn && dateKey < item.createdOn) {
    return false
  }

  if (item.archived && item.archivedOn && dateKey > item.archivedOn) {
    return false
  }

  return true
}

export function getItemsForDate(record, items, dateKey) {
  return items.filter(
    (item) =>
      itemAppliesToDate(item, dateKey) ||
      Object.prototype.hasOwnProperty.call(record, item.id),
  )
}

export function countCompleted(record, items) {
  return items.filter((item) => record[item.id] === true).length
}

export function getRecordMeta(record, itemId) {
  return normalizeRecordMeta(record?.[RECORD_META_KEY])[itemId] ?? null
}

export function getRecordNote(record, itemId) {
  return getRecordMeta(record, itemId)?.note ?? ''
}

export function updateRecordMeta(record, itemId, changes) {
  const normalizedRecord = normalizeRecord(record)
  const meta = normalizeRecordMeta(record?.[RECORD_META_KEY])
  const nextEntry = normalizeMetaEntry({
    ...(meta[itemId] ?? {}),
    ...changes,
  })

  if (nextEntry) {
    meta[itemId] = nextEntry
  } else {
    delete meta[itemId]
  }

  if (Object.keys(meta).length > 0) {
    normalizedRecord[RECORD_META_KEY] = meta
  } else {
    delete normalizedRecord[RECORD_META_KEY]
  }

  return normalizedRecord
}

export function removeRecordMeta(record, itemId) {
  const normalizedRecord = normalizeRecord(record)
  const meta = normalizeRecordMeta(record?.[RECORD_META_KEY])
  delete meta[itemId]

  if (Object.keys(meta).length > 0) {
    normalizedRecord[RECORD_META_KEY] = meta
  } else {
    delete normalizedRecord[RECORD_META_KEY]
  }

  return normalizedRecord
}

function getCalendarDayDifference(dateKey, now) {
  const completedDate = fromDateKey(dateKey)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((today.getTime() - completedDate.getTime()) / DAY))
}

function formatDateDistance(dateKey, now) {
  const days = getCalendarDayDifference(dateKey, now)

  if (days === 0) {
    return '今天'
  }

  if (days === 1) {
    return '昨天'
  }

  if (days < 30) {
    return `${days}天前`
  }

  const months = Math.floor(days / 30)

  if (months < 12) {
    return `${months}个月前`
  }

  return `${Math.floor(months / 12)}年前`
}

function formatClockTime(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function getLastCompletion(records, itemId, now = new Date()) {
  const completedEntry = Object.entries(records)
    .filter(([dateKey, record]) => dateKey <= toDateKey(now) && record[itemId] === true)
    .sort(([firstDateKey], [secondDateKey]) => secondDateKey.localeCompare(firstDateKey))[0]

  if (!completedEntry) {
    return null
  }

  const [dateKey, record] = completedEntry
  const completedAt = getRecordMeta(record, itemId)?.completedAt
  const completedDate = completedAt ? new Date(completedAt) : null

  if (!completedDate || Number.isNaN(completedDate.getTime())) {
    const label = formatDateDistance(dateKey, now)
    return {
      dateKey,
      completedAt: null,
      lastLabel: label,
      distanceLabel: label,
    }
  }

  const elapsed = Math.max(0, now.getTime() - completedDate.getTime())
  const dayDifference = getCalendarDayDifference(dateKey, now)
  let distanceLabel

  if (elapsed < MINUTE) {
    distanceLabel = '刚刚'
  } else if (elapsed < HOUR) {
    distanceLabel = `${Math.floor(elapsed / MINUTE)}分钟前`
  } else if (elapsed < DAY) {
    distanceLabel = `${Math.floor(elapsed / HOUR)}小时前`
  } else if (dayDifference === 1) {
    distanceLabel = '昨天'
  } else if (dayDifference < 30) {
    distanceLabel = `${dayDifference}天前`
  } else {
    distanceLabel = formatDateDistance(dateKey, now)
  }

  let lastLabel
  const clockTime = formatClockTime(completedDate)

  if (dayDifference === 0) {
    lastLabel = `今天 ${clockTime}`
  } else if (dayDifference === 1) {
    lastLabel = `昨天 ${clockTime}`
  } else if (dayDifference <= 7) {
    lastLabel = `${dayDifference}天前`
  } else {
    lastLabel = formatDateDistance(dateKey, now)
  }

  return {
    dateKey,
    completedAt,
    lastLabel,
    distanceLabel,
  }
}

export function getMonthStats(records, items, date) {
  const monthPrefix = `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`
  const monthEntries = Object.entries(records).filter(([dateKey]) =>
    dateKey.startsWith(monthPrefix),
  )

  const itemStats = items
    .map((item) => {
      const completedDates = monthEntries
        .filter(([, record]) => record[item.id] === true)
        .map(([dateKey]) => dateKey)
        .sort()

      return {
        ...item,
        count: completedDates.length,
        completedDates,
      }
    })
    .filter((item) => !item.archived || item.count > 0)

  return {
    monthLabel: `${date.getFullYear()}年${date.getMonth() + 1}月`,
    total: itemStats.reduce((total, item) => total + item.count, 0),
    items: itemStats,
  }
}

export function createBackupPayload(items, records) {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    items,
    records,
  }
}

export function parseBackupText(text) {
  let payload

  try {
    payload = JSON.parse(text)
  } catch {
    throw new Error('文件不是有效的 JSON 格式。')
  }

  if (!isPlainObject(payload) || payload.format !== BACKUP_FORMAT) {
    throw new Error('这不是 DayDone 导出的备份文件。')
  }

  const normalizedItems = normalizeItems(payload.items)
  const normalizedRecords = normalizeRecords(payload.records)

  if (!normalizedItems || !normalizedRecords) {
    throw new Error('备份文件缺少有效的项目或打卡记录。')
  }

  return {
    items: normalizedItems,
    records: normalizedRecords,
  }
}

export function formatFullDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

export function formatCompactDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}
