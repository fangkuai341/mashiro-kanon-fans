import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
// 确保这些组件已经在 src/views/ 下创建好
import { RouterName, TabName } from '../type/router.data';
import CommunityView from '../views/CommunityView.vue';
import DashboardView from '../views/DashboardView.vue';
import LiveView from '../views/LiveView.vue';
import MusicView from '../views/MusicView.vue';
import ProfileView from '../views/ProfileView.vue';
import ShopView from '../views/ShopView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: RouterName.Dashboard,
    component: DashboardView,
    meta:{
      tab:TabName.Dashboard
    }

  },
  {
    path: '/profile',
    name: RouterName.Profile,
    component: ProfileView,
    meta:{
      tab:TabName.Profile
    }
  },
  {
    path: '/music',
    name: RouterName.Music,
    component: MusicView,
    meta:{
      tab:TabName.Music
    }
  },
  {
    path: '/live',
    name: RouterName.Live,
    component: LiveView,
    meta:{
      tab:TabName.Live,
    }
  },
  {
    path: '/community',
    name: RouterName.Community,
    component: CommunityView,
    meta:{
      tab:TabName.Community,
    }
  },
  {
    path: '/shop',
    name: RouterName.Shop,
    component: ShopView,
    meta:{
      tab:TabName.Shop
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;