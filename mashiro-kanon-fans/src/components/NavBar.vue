<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';
import { RouterName, TabName } from '../type/router.data';

const emit = defineEmits<{
  (e: 'switch', tab: string): void;
}>();

const route = useRoute();
const router = useRouter();
const navRef = ref<HTMLElement | null>(null);

const tabs: { id: string; name: string; routerName: string; tab: string }[] = [
  {
    id: 'dashboard',
    name: '首页概览',
    routerName: RouterName.Dashboard,
    tab: TabName.Dashboard
  }, {
    id: 'profile',
    name: '花音档案',
    routerName: RouterName.Profile,
    tab: TabName.Profile
  }, {
    id: 'music',
    name: '音乐数据库',
    routerName: RouterName.Music,
    tab: TabName.Music
  }, {
    id: 'live',
    name: '直播中心',
    routerName: RouterName.Live,
    tab: TabName.Live
  }, {
    id: 'community',
    name: '后花园',
    routerName: RouterName.Community,
    tab: TabName.Community
  },   {
    id: 'shop',
    name: '商店',
    routerName: RouterName.Shop,
    tab: TabName.Shop
  },
  {
    id: 'feedback',
    name: '意见反馈',
    routerName: RouterName.Feedback,
    tab: TabName.Feedback
  }
];

let activeTab = computed(() => route.meta?.tab);

const handleSwitch = (routerName: string) => {
  router.push({name: routerName});
};

onMounted(() => {
  if (navRef.value) {
    gsap.from(navRef.value.children, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }
});
</script>

<template>
  <nav ref="navRef" class="navbar sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-pink-100/50 shadow-lg">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div 
          class="flex items-center gap-2 cursor-pointer group logo-container"
          @click="handleSwitch('dashboard')"
        >
          <div class="logo-icon-wrapper">
            <Icon icon="noto:cherry-blossom" class="text-2xl transition-transform group-hover:rotate-12 group-hover:scale-110" />
          </div>
          <h1 class="font-bold text-xl gradient-text tracking-wide">Kanon's Garden</h1>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex space-x-2">
          <button 
            v-for="label in tabs" 
            :key="label.id" 
            @click="handleSwitch(label.routerName as string)"
            :class="[
              'nav-btn relative px-4 py-2 rounded-lg transition-all duration-300 font-medium',
              activeTab === label.tab 
                ? 'text-pink-500 bg-gradient-to-r from-pink-50 to-pink-100 shadow-md' 
                : 'text-gray-600 hover:text-pink-400 hover:bg-pink-50/50'
            ]"
          >
            <span class="relative z-10">{{ label.name }}</span>
            <span 
              v-if="activeTab === label.tab"
              class="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-pink-300/30 rounded-lg animate-pulse"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.9) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.logo-container {
  position: relative;
}

.logo-icon-wrapper {
  position: relative;
}

.logo-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, rgba(255, 192, 203, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

.logo-container:hover .logo-icon-wrapper::before {
  opacity: 1;
}

.nav-btn {
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 182, 193, 0.2) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.nav-btn:hover::before {
  width: 200px;
  height: 200px;
}
</style>