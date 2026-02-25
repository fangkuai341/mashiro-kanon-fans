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

// 音乐播放相关状态
const audioRef = ref<HTMLAudioElement | null>(null);
const currentPlayingId = ref<number | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const currentSong = ref<Song | null>(null);
const bufferedPercent = ref(0);
const isBuffering = ref(false);
const isAutoPlayPending = ref(false);

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

// 格式化时间（秒转为 MM:SS）
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const minsStr = mins < 10 ? '0' + mins : String(mins);
  const secsStr = secs < 10 ? '0' + secs : String(secs);
  return `${minsStr}:${secsStr}`;
};

// 播放/暂停音乐
const togglePlay = (song?: Song) => {
  if (!audioRef.value) return;
  
  // 如果传入了歌曲，则播放该歌曲
  if (song) {
    // 如果点击的是当前正在播放的歌曲，则暂停/继续
    if (currentPlayingId.value === song.id) {
      if (isPlaying.value) {
        audioRef.value.pause();
        isPlaying.value = false;
      } else {
        audioRef.value.play();
        isPlaying.value = true;
      }
    } else {
      // 播放新歌曲
      currentPlayingId.value = song.id;
      currentSong.value = song;
      if (audioRef.value.src !== 'http://124.222.238.165:3000' + song.link) {
        audioRef.value.src = 'http://124.222.238.165:3000' + song.link;
      }
      // 新歌曲先缓冲，缓冲完成后自动播放
      isAutoPlayPending.value = true;
      isBuffering.value = true;
      audioRef.value.load();
      isPlaying.value = false;
    }
  } else {
    // 没有传入歌曲，则切换当前播放状态
    if (isPlaying.value) {
      audioRef.value.pause();
      isPlaying.value = false;
    } else {
      audioRef.value.play();
      isPlaying.value = true;
    }
  }
};

// 更新播放进度
const updateProgress = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
    duration.value = audioRef.value.duration || 0;
  }
};

// 更新缓冲进度
const updateBuffered = () => {
  if (!audioRef.value || !duration.value) return;
  const buffered = audioRef.value.buffered;
  if (buffered.length > 0) {
    const end = buffered.end(buffered.length - 1);
    bufferedPercent.value = Math.min(100, (end / duration.value) * 100);
  }
};

// 拖动进度条
const seekTo = (event: Event) => {
  if (!audioRef.value) return;
  const target = event.target as HTMLInputElement;
  const seekTime = (parseFloat(target.value) / 100) * duration.value;
  audioRef.value.currentTime = seekTime;
  currentTime.value = seekTime;
};

// 计算进度百分比
const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// 监听音频播放结束
const handleAudioEnded = () => {
  isPlaying.value = false;
  currentPlayingId.value = null;
  currentTime.value = 0;
  currentSong.value = null;
};

// 监听音频播放错误
const handleAudioError = () => {
  console.error('音频播放失败');
  isPlaying.value = false;
  currentPlayingId.value = null;
  currentTime.value = 0;
  currentSong.value = null;
};

// 监听音频加载元数据
const handleLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || 0;
    bufferedPercent.value = 0;
  }
};

// 缓冲完成，准备可以播放
const handleCanPlay = () => {
  isBuffering.value = false;
  if (isAutoPlayPending.value && audioRef.value) {
    audioRef.value.play();
    isPlaying.value = true;
    isAutoPlayPending.value = false;
  }
};

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
  // 清理音频资源
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.src = '';
  }
});
</script>

<template>
  <div class="fade-in space-y-6">
    <!-- 隐藏的音频播放器 -->
    <audio 
      ref="audioRef"
      @ended="handleAudioEnded"
      @error="handleAudioError"
      @timeupdate="updateProgress"
      @loadedmetadata="handleLoadedMetadata"
      @progress="updateBuffered"
      @waiting="isBuffering = true"
      @canplay="handleCanPlay"
      @canplaythrough="handleCanPlay"
      @playing="isBuffering = false"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      preload="none"
    ></audio>
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
                <th class="p-4 font-semibold text-center whitespace-nowrap" style="min-width: 80px;">播放</th>
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
                  <button 
                    @click="togglePlay(song)"
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-pink-100 transition-all"
                    :class="currentPlayingId === song.id && isPlaying ? 'bg-pink-100' : ''"
                  >
                    <Icon 
                      :icon="currentPlayingId === song.id && isPlaying ? 'mdi:pause' : 'mdi:play'" 
                      class="text-pink-500 hover:text-pink-600 transition-colors"
                      style="font-size: 20px;"
                    />
                  </button>
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
        <!-- 音乐控制器 -->
        <div 
          v-if="currentSong" 
          class="music-controller bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-pink-100/50 card-hover"
        >
          <div class="mb-3">
            <h4 class="font-semibold text-gray-800 text-sm truncate">{{ currentSong.title }}</h4>
            <p class="text-xs text-gray-500 truncate">{{ currentSong.artist }}</p>
          </div>
          
          <!-- 进度条 -->
          <div class="mb-2">
            <div class="relative h-4 flex items-center">
              <!-- 缓冲条背景 -->
              <div class="absolute inset-x-0 h-2 rounded-lg bg-pink-100 overflow-hidden">
                <div
                  class="h-full bg-pink-200 transition-all duration-200"
                  :style="{ width: bufferedPercent + '%' }"
                ></div>
              </div>
              <!-- 可拖动进度条 -->
              <input
                type="range"
                :value="progressPercent"
                @input="seekTo"
                min="0"
                max="100"
                step="0.1"
                class="relative w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
          
          <!-- 时间、缓冲状态和控制按钮 -->
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-600 font-mono">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </span>
              <div v-if="isBuffering" class="flex items-center gap-1 text-[10px] text-pink-500">
                <span class="w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></span>
                <span>缓冲中...</span>
              </div>
            </div>
            <button
              @click="togglePlay()"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-md hover:shadow-lg"
            >
              <Icon 
                :icon="isPlaying ? 'mdi:pause' : 'mdi:play'" 
                style="font-size: 20px;"
              />
            </button>
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

/* 进度条样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ec4899;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #db2777;
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ec4899;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.slider::-moz-range-thumb:hover {
  background: #db2777;
  transform: scale(1.1);
}

.music-controller {
  min-height: 120px;
}
</style>