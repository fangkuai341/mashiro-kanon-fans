<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';
import type { TimelineItem } from '../types';

defineProps<{
  timeline: TimelineItem[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        datasets: [{
          label: '粉丝数 (万人)',
          data: [0, 5, 8, 12, 15],
          borderColor: '#F472B6',
          backgroundColor: 'rgba(244, 114, 182, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
});

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>

<template>
  <div class="fade-in space-y-8">
    <!-- Bio Section omitted for brevity, use layout from original -->
     <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- ... Profile Card ... -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-fit">
            <div class="h-64 bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-lg">
              Live2D Placeholder
            </div>
            <!-- ... -->
        </div>

        <div class="md:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-lg mb-4 text-pink-500">🌸 经历时间轴</h3>
            <div class="relative border-l-2 border-pink-200 ml-3 space-y-6 pb-2">
              <div v-for="(item, idx) in timeline" :key="idx" class="ml-6 relative">
                <div class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-pink-400 border-2 border-white ring-2 ring-pink-100"></div>
                <div class="text-xs text-pink-500 font-bold">{{ item.year }}</div>
                <div class="text-gray-800 font-medium">{{ item.event }} <span class="text-gray-400 text-xs ml-2">{{ item.date }}</span></div>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-lg mb-4 text-gray-700">📈 粉丝成长里程碑</h3>
            <div class="chart-container">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>
        </div>
     </div>
  </div>
</template>