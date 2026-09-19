import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockJobs } from '../mock/jobs'
import type { Job } from '../types/job'

export const useJobStore = defineStore('job', () => {
  const jobs = ref<Job[]>([...mockJobs])

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