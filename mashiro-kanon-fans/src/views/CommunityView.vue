<script setup lang="ts">
import MiniGame from '../components/MiniGame.vue';
</script>

<template>
  <div class="fade-in space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2 text-pink-500">花音的后花园 🎠</h2>
      <p class="text-sm text-gray-500">同人创作展示与休闲小游戏。</p>
    </div>

    <div class="bg-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
       <div class="flex-1 text-center md:text-left z-10">
          <h3 class="text-3xl font-bold text-yellow-300 mb-2">🎵 音符捕手</h3>
          <p class="mb-4 text-indigo-200">控制Q版花音接住从天而降的音符！</p>
       </div>
       <MiniGame />
    </div>

    <!-- Art Grid -->
    <div>
        <h3 class="text-xl font-bold mb-4 text-gray-700 border-l-4 border-pink-400 pl-3">精选同人绘</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(icon, idx) in ['🎨', '✨', '🍰', '👗']" :key="idx"
                 class="bg-white rounded-lg shadow-sm p-2 pb-4 aspect-[3/4] flex flex-col items-center justify-center bg-gray-50 border border-gray-200 transition hover:-translate-y-1">
                <span class="text-4xl">{{ icon }}</span>
                <span class="text-xs mt-2 text-gray-400">By @FanArtist</span>
            </div>
        </div>
    </div>
  </div>
</template>