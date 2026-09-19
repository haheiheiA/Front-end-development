import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import JobCreateView from '../views/JobCreateView.vue'
import JobDetailView from '../views/JobDetailView.vue'
import JobEditView from '../views/JobEditView.vue'
import JobsView from '../views/JobsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        title: '概览',
      },
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: JobsView,
      meta: {
        title: '我的岗位',
      },
    },
    {
      path: '/jobs/new',
      name: 'job-create',
      component: JobCreateView,
      meta: {
        title: '添加岗位',
      },
    },
    {
      path: '/jobs/:id',
      name: 'job-detail',
      component: JobDetailView,
      meta: {
        title: '岗位详情',
      },
    },
    {
      path: '/jobs/:id/edit',
      name: 'job-edit',
      component: JobEditView,
      meta: {
        title: '编辑岗位',
      },
    },
  ],
})

export default router