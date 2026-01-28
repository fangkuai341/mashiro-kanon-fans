import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import NewsManage from '../views/NewsManage.vue'
import QuotesManage from '../views/QuotesManage.vue'
import TimelineManage from '../views/TimelineManage.vue'
import SongsManage from '../views/SongsManage.vue'
import FanartManage from '../views/FanartManage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
  },
  {
    path: '/news',
    name: 'news',
    component: NewsManage,
  },
  {
    path: '/quotes',
    name: 'quotes',
    component: QuotesManage,
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: TimelineManage,
  },
  {
    path: '/songs',
    name: 'songs',
    component: SongsManage,
  },
  {
    path: '/fanarts',
    name: 'fanarts',
    component: FanartManage,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

