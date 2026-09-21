import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { mockJobs } from '../mock/jobs'
import type { Job } from '../types/job'

const JOBS_STORAGE_KEY = 'jobtrack:jobs'

function loadJobs(): Job[] {
  if (typeof window === 'undefined') return [...mockJobs]

  try {
    const storedJobs = window.localStorage.getItem(JOBS_STORAGE_KEY)

    if (!storedJobs) return [...mockJobs]

    const parsedJobs: unknown = JSON.parse(storedJobs)

    return Array.isArray(parsedJobs) ? (parsedJobs as Job[]) : [...mockJobs]
  } catch {
    return [...mockJobs]
  }
}

function saveJobs(jobs: Job[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs))
  } catch {
    // Keep the in-memory state usable if browser storage is unavailable.
  }
}

export const useJobStore = defineStore('job', () => {
  const jobs = ref<Job[]>(loadJobs())

  watch(jobs, saveJobs, { deep: true })

  function getJobById(id: string): Job | undefined {
    return jobs.value.find((job) => job.id === id)
  }

  function addJob(job: Job) {
    jobs.value.push(job)
  }

  function updateJob(updatedJob: Job) {
    const index = jobs.value.findIndex((job) => job.id === updatedJob.id)

    if (index === -1) return

    jobs.value[index] = updatedJob
  }

  function deleteJob(id: string) {
    jobs.value = jobs.value.filter((job) => job.id !== id)
  }

  return {
    jobs,
    getJobById,
    addJob,
    updateJob,
    deleteJob,
  }
})