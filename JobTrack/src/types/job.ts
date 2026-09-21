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

export type InterviewType =
  | 'first-interview'
  | 'second-interview'
  | 'hr-interview'
  | 'technical'
  | 'other'

export type InterviewMode = 'onsite' | 'video' | 'phone' | 'other'

export type InterviewResult = 'pending' | 'passed' | 'failed' | 'cancelled'

export interface InterviewRecord {
  id: string
  scheduledAt: IsoDateTime
  type: InterviewType
  mode: InterviewMode
  result: InterviewResult
  note?: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface OfferInfo {
  id: string
  received: boolean
  offerDate?: IsoDateTime
  position?: string
  salary?: JobSalary
  startDate?: IsoDateTime
  note?: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface ApplicationRecord {
  id: string
  appliedAt: IsoDateTime
  source: JobSource
  note?: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface ContactRecord {
  id: string
  name: string
  role?: string
  email?: string
  phone?: string
  linkedin?: string
  note?: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

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
  applicationRecords?: ApplicationRecord[]
  interviewRecords?: InterviewRecord[]
  offer?: OfferInfo
  contacts?: ContactRecord[]
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}