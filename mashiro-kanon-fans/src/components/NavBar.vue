<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouterName, TabName } from '../type/router.data';
const emit = defineEmits<{
  (e: 'switch', tab: string): void;
}>();
const route = useRoute()
const router = useRouter()
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
    name: '直播中心',
    routerName: RouterName.Community,
    tab: TabName.Community
  }, {
    id: 'shop',
    name: '商店',
    routerName: RouterName.Shop,
    tab: TabName.Shop
  }
]
let activeTab = computed(() => route.meta?.tab)
const handleSwitch = (routerName: string) => {
  router.push({name:routerName})
};
</script>

<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center gap-2 cursor-pointer" @click="handleSwitch('dashboard')">
          <span class="text-2xl">🌸</span>
          <h1 class="font-bold text-xl text-pink-500 tracking-wide">Kanon's Garden</h1>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex space-x-8">

          <button v-for="label in tabs" :key="label.id" @click="handleSwitch(label.routerName as string)"
            :class="['nav-btn py-2 transition-colors hover:text-pink-400', activeTab === label.tab ? 'text-pink-600 border-b-2 border-pink-600 font-bold' : '']">
            {{ label.name }}
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <!-- <button class="md:hidden text-2xl" @click="isMobileMenuOpen = !isMobileMenuOpen">☰</button> -->
      </div>
    </div>
    <!-- Mobile Menu -->
    <!-- <div v-if="isMobileMenuOpen" class="md:hidden bg-pink-50 border-t border-pink-100">
      <button v-for="(label, key) in tabs"
              :key="key"
              @click="handleSwitch(key as string)"
              class="block w-full text-left px-4 py-3 hover:bg-pink-100">
        {{ label }}
      </button>
    </div> -->
  </nav>
</template>