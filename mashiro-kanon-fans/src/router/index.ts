import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
// 确保这些组件已经在 src/views/ 下创建好
import CommunityView from '../views/CommunityView.vue';
import DashboardView from '../views/DashboardView.vue';
import LiveView from '../views/LiveView.vue';
import MusicView from '../views/MusicView.vue';
import ProfileView from '../views/ProfileView.vue';
import ShopView from '../views/ShopView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  },
  {
    path: '/music',
    name: 'Music',
    component: MusicView
  },
  {
    path: '/live',
    name: 'Live',
    component: LiveView
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityView
  },
  {
    path: '/shop',
    name: 'Shop',
    component: ShopView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;