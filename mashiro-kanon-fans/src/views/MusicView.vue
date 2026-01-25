<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import type { Song } from '../type';
import { getArtistPreferencesApi, getSongsApi } from '../api';
import type { SongApiItem } from '../type';

const searchTerm = ref('');
const chartCanvas = ref<HTMLElement | null>(null);
const songs = ref<Song[]>([]);
const loading = ref(false);
let chartInstance: echarts.ECharts | null = null;

// 保存 resize 处理函数引用，用于清理
const handleResize = () => {
  chartInstance?.resize();
};

// 格式化日期为 YYYY-MM-DD
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthStr = month < 10 ? '0' + month : String(month);
  const dayStr = day < 10 ? '0' + day : String(day);
  return `${year}-${monthStr}-${dayStr}`;
};

// 将 API 返回的数据转换为前端使用的格式
const transformSongData = (apiSong: SongApiItem): Song => {
  return {
    id: apiSong.id,
    title: apiSong.title,
    artist: apiSong.artist,
    lastSung: formatDate(apiSong.last_song),
    link: apiSong.link || '#',
    chineseName: apiSong.chinese_name
  };
};

// 获取歌曲数据
const fetchSongs = async (query?: string) => {
  try {
    loading.value = true;
    const data = await getSongsApi(query);
    songs.value = data.map(transformSongData);
  } catch (error) {
    console.error('获取歌曲数据失败:', error);
    songs.value = [];
  } finally {
    loading.value = false;
  }
};

// 直接使用从 API 获取的歌曲列表（后端已处理搜索）
const filteredSongs = computed(() => songs.value);

const calculateDaysSince = (dateString: string) => {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 防抖函数
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// 监听搜索词变化，实时搜索（带防抖）
watch(searchTerm, (newVal) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    if (newVal.trim()) {
      fetchSongs(newVal);
    } else {
      fetchSongs();
    }
  }, 300);
});

// 获取常驻歌手偏好数据并渲染图表
const fetchAndRenderChart = async () => {
  try {
    const data = await getArtistPreferencesApi();
    if (!chartCanvas.value || data.length === 0) return;
    
    // 如果图表已存在，先销毁
    if (chartInstance) {
      chartInstance.dispose();
    }
    
    if (!chartCanvas.value) return;
    
    chartInstance = echarts.init(chartCanvas.value);
    
    const labels = data.map(item => item.artist);
    const counts = data.map(item => item.count);
    
    chartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>演唱次数: ${param.value}`;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: labels.some(l => l.length > 6) ? 45 : 0,
          interval: 0,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: '演唱次数',
        minInterval: 1
      },
      series: [{
        name: '演唱次数',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FBCFE8' },
            { offset: 1, color: '#F472B6' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 11
        }
      }]
    });
    
    // 确保图表填满容器高度
    chartInstance.resize();
    
    // 响应式调整
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('获取歌手偏好数据失败:', error);
  }
};

onMounted(async () => {
  // 初始加载歌曲数据
  fetchSongs();
  // 等待 DOM 渲染完成后再初始化图表
  await nextTick();
  fetchAndRenderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});
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
      <div class="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div class="overflow-x-auto flex-1" style="max-height: calc(100vh - 300px);">
          <div v-if="loading" class="p-8 text-center text-gray-500">
            加载中...
          </div>
          <table v-else class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-pink-50 z-10">
              <tr class="text-gray-600 text-sm">
                <th class="p-4 font-semibold">歌名</th>
                <th class="p-4 font-semibold">中文名</th>
                <th class="p-4 font-semibold">原唱</th>
                <th class="p-4 font-semibold">最近演唱</th>
                <th class="p-4 font-semibold text-center">天数</th>
                <th class="p-4 font-semibold text-center whitespace-nowrap" style="min-width: 80px;">链接</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-for="song in filteredSongs" :key="song.id" class="border-b border-gray-50 hover:bg-pink-50/50 transition-colors">
                <td class="p-4 font-medium text-gray-800">{{ song.title }}</td>
                <td class="p-4 text-gray-500">{{ song.chineseName || '-' }}</td>
                <td class="p-4 text-gray-500">{{ song.artist }}</td>
                <td class="p-4 text-gray-600 whitespace-nowrap">{{ song.lastSung }}</td>
                <td class="p-4 text-center font-mono text-gray-600">{{ calculateDaysSince(song.lastSung) }}天</td>
                <td class="p-4 text-center whitespace-nowrap" style="min-width: 80px;">
                  <a :href="song.link" target="_blank" class="text-pink-400 hover:text-pink-600 text-lg inline-block">▶</a>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!loading && filteredSongs.length === 0" class="p-8 text-center text-gray-500">
            没有找到相关歌曲... 🎤
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-700 mb-4 text-center">常驻歌手偏好</h3>
          <div class="chart-container" style="height: 250px; overflow-x: auto; overflow-y: hidden;">
            <div ref="chartCanvas" style="width: 100%; height: 100%; min-width: 100%;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  min-height: 250px;
}

.chart-container > div {
  width: 100%;
  height: 100%;
}

.chart-container canvas {
  display: block;
  max-height: 100%;
  height: 100%;
}
</style>