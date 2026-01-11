<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
//import Chart from 'chart.js/auto';
import type { Song } from '../types';

const props = defineProps<{
  songs: Song[];
}>();

const searchTerm = ref('');
const chartCanvas = ref<HTMLCanvasElement | null>(null);
//let chartInstance: Chart | null = null;

const filteredSongs = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return props.songs.filter(s =>
    s.title.toLowerCase().includes(term) ||
    s.artist.toLowerCase().includes(term)
  );
});

const calculateDaysSince = (dateString: string) => {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

onMounted(() => {
  // if (chartCanvas.value) {
  //   const artistCounts: Record<string, number> = {};
  //   props.songs.forEach(s => {
  //     artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1;
  //   });

  //   chartInstance = new Chart(chartCanvas.value, {
  //     type: 'bar',
  //     data: {
  //       labels: Object.keys(artistCounts),
  //       datasets: [{
  //         label: '翻唱次数',
  //         data: Object.values(artistCounts),
  //         backgroundColor: '#FBCFE8',
  //         borderColor: '#F472B6',
  //         borderWidth: 1
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       plugins: { legend: { display: false } },
  //       scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  //     }
  //   });
  // }
});

// onUnmounted(() => {
//   if (chartInstance) chartInstance.destroy();
// });
</script>

<template>
  <div class="fade-in space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold mb-2 text-pink-600">音乐数据库 🎧</h2>
        <p class="text-sm text-gray-500">查询歌单、回放链接及最近演唱时间。</p>
      </div>
      <div class="w-full md:w-1/3 relative">
        <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
        <input v-model="searchTerm" type="text" placeholder="搜索歌名、原唱..."
               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 transition-shadow">
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-pink-50 text-gray-600 text-sm">
                <th class="p-4 font-semibold">歌名</th>
                <th class="p-4 font-semibold">原唱</th>
                <th class="p-4 font-semibold">最近演唱</th>
                <th class="p-4 font-semibold text-center">天数</th>
                <th class="p-4 font-semibold">链接</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-for="song in filteredSongs" :key="song.id" class="border-b border-gray-50 hover:bg-pink-50/50 transition-colors">
                <td class="p-4 font-medium text-gray-800">{{ song.title }}</td>
                <td class="p-4 text-gray-500">{{ song.artist }}</td>
                <td class="p-4 text-gray-600">{{ song.lastSung }}</td>
                <td class="p-4 text-center font-mono">{{ calculateDaysSince(song.lastSung) }}天</td>
                <td class="p-4"><a :href="song.link" class="text-pink-400 hover:text-pink-600">▶ Play</a></td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredSongs.length === 0" class="p-8 text-center text-gray-500">
            没有找到相关歌曲... 🎤
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-700 mb-4 text-center">常驻歌手偏好</h3>
          <div class="chart-container" style="height: 250px;">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>