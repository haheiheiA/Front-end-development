/**
 * ISO 8601 date-time string.
 * Example: "2026-09-19T08:30:00.000Z"
 */
export type IsoDateTime = string

export interface JobSalary {
  /** Inclusive minimum amount in CNY. */
  min: number
  /** Inclusive maximum amount in CNY. */
  max?: number
  unit: 'month' | 'year'
}

export type JobStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'assessment'
  | 'first-interview'
  | 'second-interview'
  | 'hr-interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export type JobSource =
  | 'official'
  | 'boss'
  | 'liepin'
  | 'lagou'
  | 'referral'
  | 'other'

export interface Job {
  id: string
  company: string
  position: string
  location?: string
  salary?: JobSalary
  status: JobStatus
  appliedAt?: IsoDateTime
  source: JobSource
  description?: string
  requirements?: string
  notes?: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}