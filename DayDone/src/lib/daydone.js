export const RECORDS_STORAGE_KEY = 'daydone.records.v1'
export const ITEMS_STORAGE_KEY = 'daydone.items.v1'

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

export function normalizeRecord(record) {
  if (!isPlainObject(record)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(record).filter(
      ([key, value]) => typeof key === 'string' && typeof value === 'boolean',
    ),
  )
}

export function readRecords() {
  try {
    const rawRecords = window.localStorage.getItem(RECORDS_STORAGE_KEY)

    if (!rawRecords) {
      return {}
    }

    const parsedRecords = JSON.parse(rawRecords)

    if (!isPlainObject(parsedRecords)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsedRecords)
        .filter(([dateKey]) => isValidDateKey(dateKey))
        .map(([dateKey, record]) => [dateKey, normalizeRecord(record)]),
    )
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

export function readItems() {
  try {
    const rawItems = window.localStorage.getItem(ITEMS_STORAGE_KEY)

    if (!rawItems) {
      return [...DEFAULT_ITEMS]
    }

    const parsedItems = JSON.parse(rawItems)

    if (!Array.isArray(parsedItems)) {
      return [...DEFAULT_ITEMS]
    }

    const seenIds = new Set(DEFAULT_ITEM_IDS)
    const customItems = []

    parsedItems.forEach((item) => {
      const normalizedItem = normalizeCustomItem(item)

      if (!normalizedItem || seenIds.has(normalizedItem.id)) {
        return
      }

      seenIds.add(normalizedItem.id)
      customItems.push(normalizedItem)
    })

    return [...DEFAULT_ITEMS, ...customItems]
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

