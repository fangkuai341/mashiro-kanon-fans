<script setup lang="ts">
import Chart from 'chart.js/auto';
import { onMounted, onUnmounted, ref } from 'vue';
import type { ScheduleItem } from '../types';

defineProps<{
  schedule: ScheduleItem[];
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['歌回 (Singing)', '游戏 (Game)', '杂谈 (Chat)'],
        datasets: [{
          data: [45, 30, 25], // Mock data
          backgroundColor: ['#F472B6', '#60A5FA', '#FBBF24'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
});

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>

<template>
    <!-- ... Live View Template ... -->
    <div class="fade-in space-y-8">
        <!-- Calendar logic here, iterating props.schedule -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 text-center">直播内容分布</h3>
            <div class="chart-container flex-grow">
                <canvas ref="chartCanvas"></canvas>
            </div>
        </div>
    </div>
</template>