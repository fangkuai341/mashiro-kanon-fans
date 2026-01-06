<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getNewApi } from '../api';
import type { NewsItem } from '../types';
const props = defineProps<{
  news: NewsItem[];
  quotes: string[];
}>();

const emit = defineEmits(['navigate']);
const news=ref([])
const currentQuote = ref('');

onMounted(async() => {
  news.value=await getNewApi()
  //currentQuote.value = `"${props.quotes[Math.floor(Math.random() * props.quotes.length)]}"`;
});
</script>

<template>
  <div class="fade-in space-y-6">
    <div class="bg-gradient-to-r from-pink-100 to-yellow-50 rounded-2xl p-6 md:p-10 shadow-sm border border-pink-100 relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">欢迎来到花音的后花园 ✨</h2>
        <p class="text-gray-600 max-w-xl">这里是真白花音（Mashiro Kanon）的非官方应援基地。</p>
        <div class="mt-4 flex gap-3">
          <button @click="emit('navigate', 'music')" class="bg-pink-500 text-white px-6 py-2 rounded-full font-medium hover:bg-pink-600 transition shadow-md">🎵 搜歌</button>
          <button @click="emit('navigate', 'live')" class="bg-white text-pink-500 border border-pink-200 px-6 py-2 rounded-full font-medium hover:bg-gray-50 transition">📅 日程</button>
        </div>
      </div>
      <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-yellow-200 rounded-full opacity-50 blur-2xl"></div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="font-bold text-xl mb-4 border-b pb-2 flex items-center gap-2">📢 最新动态 <span class="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded">NEWS</span></h3>
        <ul class="space-y-4">
          <li v-for="(item, idx) in news" :key="idx" class="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
            <span class="text-xs font-mono text-gray-400 mt-1">{{ item.date }}</span>
            <span class="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded mt-0.5 whitespace-nowrap">{{ item.cat }}</span>
            <span class="text-sm text-gray-700">{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center bg-pink-50/30">
        <div class="text-4xl mb-4">💬</div>
        <h3 class="font-bold text-lg mb-2 text-pink-600">今日花音语录</h3>
        <p class="italic text-gray-600 text-sm">{{ currentQuote }}</p>
      </div>
    </div>
  </div>
</template>