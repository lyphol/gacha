import { createRouter, createWebHashHistory } from 'vue-router'
import PageGacha from '@/views/page-gacha.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'gacha',
      component: PageGacha
    },
    {
      path: '/chart',
      name: 'chart',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/page-chart.vue')
    }
  ]
})

export default router
