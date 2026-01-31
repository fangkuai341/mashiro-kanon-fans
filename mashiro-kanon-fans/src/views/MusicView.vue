<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { gsap } from 'gsap';
import { Icon } from '@iconify/vue';
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
            { offset: 0, color: '#FFC0CB' },
            { offset: 1, color: '#FFB6C1' }
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
  
  // 再次等待确保所有元素都已渲染
  await nextTick();
  
  // GSAP 动画
  const musicHeader = document.querySelector('.music-header');
  if (musicHeader) {
    gsap.fromTo(musicHeader,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }
  
  const songTable = document.querySelector('.song-table');
  if (songTable) {
    gsap.fromTo(songTable,
      { opacity: 0, x: -30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.7, 
        delay: 0.2, 
        ease: 'power2.out',
        onComplete: () => {
          if (songTable) gsap.set(songTable, { clearProps: 'all' });
        }
      }
    );
  }
  
  const chartCard = document.querySelector('.chart-card');
  if (chartCard) {
    gsap.fromTo(chartCard,
      { opacity: 0, x: 30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.7, 
        delay: 0.4, 
        ease: 'power2.out',
        onComplete: () => {
          if (chartCard) gsap.set(chartCard, { clearProps: 'all' });
        }
      }
    );
  }
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
    <div class="music-header flex flex-col md:flex-row justify-between items-end gap-4 border-b border-pink-100 pb-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2 gradient-text flex items-center gap-2">
          音乐数据库
          <Icon icon="noto:headphone" class="text-2xl animate-pulse" style="animation-duration: 2s;" />
        </h2>
        <p class="text-sm text-gray-600">查询歌单、回放链接及最近演唱时间。</p>
      </div>
      <div class="w-full md:w-1/3 relative ">
       
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="搜索歌名、原唱..."
          class="w-full pl-10 pr-4 py-3 border-2 border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white/80 backdrop-blur-sm shadow-sm"
        >
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="song-table md:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100/50 overflow-hidden flex flex-col card-hover">
        <div class="overflow-x-auto flex-1" style="max-height: calc(100vh - 300px);">
          <div v-if="loading" class="p-8 text-center text-gray-500">
            <div class="inline-flex items-center gap-2">
              <div class="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
              加载中...
            </div>
          </div>
          <table v-else class="w-full text-left border-collapse">
            <thead class="sticky top-0 z-10 bg-gradient-to-r from-pink-50 to-pink-100 backdrop-blur-sm">
              <tr class="text-gray-700 text-sm">
                <th class="p-4 font-semibold">歌名</th>
                <th class="p-4 font-semibold">中文名</th>
                <th class="p-4 font-semibold">原唱</th>
                <th class="p-4 font-semibold">最近演唱</th>
                <th class="p-4 font-semibold text-center">天数</th>
                <th class="p-4 font-semibold text-center whitespace-nowrap" style="min-width: 80px;">链接</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr 
                v-for="(song, idx) in filteredSongs" 
                :key="song.id" 
                class="border-b border-pink-50/50 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-pink-100/50 transition-all duration-300 group"
                :style="{ animationDelay: `${idx * 0.02}s` }"
              >
                <td class="p-4 font-medium text-gray-800 group-hover:text-pink-500 transition-colors">{{ song.title }}</td>
                <td class="p-4 text-gray-600">{{ song.chineseName || '-' }}</td>
                <td class="p-4 text-gray-600">{{ song.artist }}</td>
                <td class="p-4 text-gray-700 whitespace-nowrap">{{ song.lastSung }}</td>
                <td class="p-4 text-center font-mono text-pink-500 font-semibold">{{ calculateDaysSince(song.lastSung) }}天</td>
                <td class="p-4 text-center whitespace-nowrap" style="min-width: 80px;">
                  <a 
                    :href="song.link" 
                    target="_blank" 
                    class="text-pink-400 hover:text-pink-600 text-lg inline-block transition-transform hover:scale-125"
                  >
                    ▶
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!loading && filteredSongs.length === 0" class="p-8 text-center text-gray-500">
            <div class="flex items-center justify-center gap-2">
              没有找到相关歌曲...
              <Icon icon="noto:studio-microphone" class="text-lg" />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="chart-card bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100/50 card-hover">
          <h3 class="font-bold text-gray-700 mb-4 text-center gradient-text">常驻歌手偏好</h3>
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

.song-table,
.chart-card {
  opacity: 1;
  transform: translate(0, 0);
}
</style>