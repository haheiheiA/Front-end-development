import type {
  InterviewMode,
  InterviewResult,
  InterviewType,
  IsoDateTime,
  JobSalary,
  JobSource,
  JobStatus,
} from '../types/job'

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  saved: '待投递',
  applied: '已投递',
  screening: '简历筛选',
  assessment: '笔试',
  'first-interview': '一面',
  'second-interview': '二面',
  'hr-interview': 'HR 面',
  offer: 'Offer',
  rejected: '未通过',
  withdrawn: '已撤回',
}

export const JOB_STATUS_ORDER: JobStatus[] = [
  'saved',
  'applied',
  'screening',
  'assessment',
  'first-interview',
  'second-interview',
  'hr-interview',
  'offer',
  'rejected',
  'withdrawn',
]

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  saved: 'var(--color-status-draft)',
  applied: 'var(--color-status-applied)',
  screening: 'var(--color-status-applied)',
  assessment: 'var(--color-status-assessment)',
  'first-interview': 'var(--color-status-interview)',
  'second-interview': 'var(--color-status-interview)',
  'hr-interview': 'var(--color-status-interview)',
  offer: 'var(--color-status-offer)',
  rejected: 'var(--color-status-rejected)',
  withdrawn: 'var(--color-status-withdrawn)',
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  'first-interview': '一面',
  'second-interview': '二面',
  'hr-interview': 'HR 面',
  technical: '技术面',
  other: '其他',
}

export const INTERVIEW_TYPE_ORDER: InterviewType[] = [
  'first-interview',
  'second-interview',
  'hr-interview',
  'technical',
  'other',
]

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  onsite: '现场',
  video: '视频',
  phone: '电话',
  other: '其他',
}

export const INTERVIEW_MODE_ORDER: InterviewMode[] = ['onsite', 'video', 'phone', 'other']

export const INTERVIEW_RESULT_LABELS: Record<InterviewResult, string> = {
  pending: '待进行',
  passed: '通过',
  failed: '未通过',
  cancelled: '取消',
}

export const INTERVIEW_RESULT_ORDER: InterviewResult[] = ['pending', 'passed', 'failed', 'cancelled']

export const INTERVIEW_RESULT_COLORS: Record<InterviewResult, string> = {
  pending: 'var(--color-status-draft)',
  passed: 'var(--color-status-offer)',
  failed: 'var(--color-status-rejected)',
  cancelled: 'var(--color-status-withdrawn)',
}

export const JOB_SOURCE_LABELS: Record<JobSource, string> = {
  official: '官网',
  boss: 'BOSS 直聘',
  liepin: '猎聘',
  lagou: '拉勾',
  referral: '内推',
  other: '其他',
}

export const JOB_SOURCE_ORDER: JobSource[] = [
  'official',
  'boss',
  'liepin',
  'lagou',
  'referral',
  'other',
]

export function formatJobDate(value?: IsoDateTime): string {
  if (!value) return '尚未投递'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '日期未知'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatJobDateTime(value?: IsoDateTime): string {
  if (!value) return '未记录'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '日期未知'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatJobSalary(salary?: JobSalary): string {
  if (!salary) return '薪资面议'

  const divisor = salary.unit === 'year' ? 10000 : 1000
  const unitLabel = salary.unit === 'year' ? '万/年' : '千/月'
  const formatAmount = (amount: number) => {
    const value = amount / divisor
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  }

  const minimum = formatAmount(salary.min)

  if (salary.max) {
    return `${minimum}–${formatAmount(salary.max)} ${unitLabel}`
  }

  return `${minimum}+ ${unitLabel}`
}