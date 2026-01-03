<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: 'switch', tab: string): void;
}>();

const isMobileMenuOpen = ref(false);
const tabs = {
  dashboard: '首页概览',
  profile: '花音档案',
  music: '音乐数据库',
  live: '直播中心',
  community: '后花园',
  shop: '商店'
};

const handleSwitch = (tab: string) => {
  emit('switch', tab);
  isMobileMenuOpen.value = false;
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
          <button v-for="(label, key) in tabs"
                  :key="key"
                  @click="handleSwitch(key as string)"
                  :class="['nav-btn py-2 transition-colors hover:text-pink-400', activeTab === key ? 'text-pink-600 border-b-2 border-pink-600 font-bold' : '']">
            {{ label }}
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden text-2xl" @click="isMobileMenuOpen = !isMobileMenuOpen">☰</button>
      </div>
    </div>
    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden bg-pink-50 border-t border-pink-100">
      <button v-for="(label, key) in tabs"
              :key="key"
              @click="handleSwitch(key as string)"
              class="block w-full text-left px-4 py-3 hover:bg-pink-100">
        {{ label }}
      </button>
    </div>
  </nav>
</template>