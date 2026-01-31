<script setup lang="ts">
import dayjs from 'dayjs';
import { onMounted, ref, nextTick } from 'vue';
import { gsap } from 'gsap';
import { Icon } from '@iconify/vue';
import { getNewApi, getQuotesApi } from '../api';
import type { NewsItem, QuotesItem } from '../type';
import { useRouter } from 'vue-router';

const emit = defineEmits(['navigate']);
const news = ref<NewsItem[]>([]);
const quotes = ref<QuotesItem[]>([]);
const heroRef = ref<HTMLElement | null>(null);
const newsRef = ref<HTMLElement | null>(null);
const quoteRef = ref<HTMLElement | null>(null);

const router = useRouter();
onMounted(async () => {
  news.value = await getNewApi();
  quotes.value = await getQuotesApi();
  
  // 等待DOM渲染完成后再执行动画
  await nextTick();
  
  // GSAP 动画
  if (heroRef.value) {
    gsap.from(heroRef.value, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.8,
      ease: 'power3.out'
    });
  }
  
  if (newsRef.value && newsRef.value.children.length > 0) {
    gsap.from(newsRef.value.children, {
      opacity: 0,
      x: -20,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.3,
      ease: 'power2.out'
    });
  }
  
  // 确保quoteRef存在且可见
  if (quoteRef.value) {
    // 使用to方法而不是from，确保从当前状态动画到目标状态
    gsap.fromTo(quoteRef.value, 
      {
        opacity: 0,
        x: 20,
        scale: 0.9
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.7,
        delay: 0.5,
        ease: 'back.out(1.7)',
        onComplete: () => {
          // 动画完成后确保元素完全可见
          if (quoteRef.value) {
            gsap.set(quoteRef.value, { clearProps: 'all' });
          }
        }
      }
    );
  }
});
</script>

<template>
  <div class="fade-in space-y-6">
    <!-- Hero Section -->
    <div 
      ref="heroRef"
      class="hero-card relative rounded-3xl p-6 md:p-10 shadow-xl border border-pink-100/50 overflow-hidden card-hover"
    >
      <!-- 背景渐变 -->
      <div class="absolute inset-0 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-50"></div>
      
      <!-- 光束效果 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-pink-200/40 to-transparent transform -skew-x-12 animate-pulse"></div>
        <div class="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-pink-300/40 to-transparent transform skew-x-12 animate-pulse" style="animation-delay: 1s;"></div>
      </div>
      
      <!-- 装饰性光点 -->
      <div class="absolute top-10 right-20 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl pulse-glow"></div>
      <div class="absolute bottom-10 left-20 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl pulse-glow" style="animation-delay: 1s;"></div>
      
      <div class="relative z-10">
        <h2 class="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
          <span class="gradient-text">欢迎来到花音的后花园</span>
          <Icon icon="noto:sparkles" class="text-3xl animate-bounce" style="animation-duration: 2s;" />
        </h2>
        <p class="text-gray-700 max-w-xl text-lg mb-6">这里是真白花音（Mashiro Kanon）的非官方应援基地。</p>
        <div class="mt-6 flex flex-wrap gap-4">
          <button 
            @click="router.push('/music')" 
            class="btn-primary group relative overflow-hidden"
          >
            <span class="relative z-10 flex items-center gap-2">
              <Icon icon="noto:musical-note" class="text-xl transition-transform group-hover:rotate-12" />
              搜歌
            </span>
            <span class="absolute inset-0 btn-primary-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
          <button 
            @click="router.push('/live')" 
            class="btn-secondary group"
          >
            <Icon icon="noto:spiral-calendar" class="text-xl transition-transform group-hover:scale-110" />
            日程
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 最新动态 -->
      <div 
        ref="newsRef"
        class="md:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100/50 card-hover"
      >
        <h3 class="font-bold text-xl mb-4 border-b border-pink-100 pb-3 flex items-center gap-2">
          <Icon icon="noto:mega" class="text-xl text-pink-400" />
          <span class="gradient-text">最新动态</span>
          <span class="text-xs font-normal text-gray-400 bg-gradient-to-r from-pink-100 to-pink-200 px-3 py-1 rounded-full border border-pink-200">NEWS</span>
        </h3>
        <ul class="space-y-4">
          <li 
            v-for="(item, idx) in news.slice(0,5)" 
            :key="item.id" 
            class="news-item flex items-start gap-3 pb-4 border-b border-pink-50 last:border-0 group"
            :style="{ animationDelay: `${idx * 0.1}s` }"
          >
            <span class="text-xs font-mono text-gray-500 mt-1 min-w-[50px]">{{ dayjs(item.date).format('MM/DD')}}</span>
            <span class="text-xs font-bold text-pink-500 bg-gradient-to-r from-pink-50 to-pink-100 px-3 py-1 rounded-full border border-pink-200 mt-0.5 whitespace-nowrap shadow-sm">
              {{ item.cat }}
            </span>
            <span class="text-sm text-gray-700 group-hover:text-pink-500 transition-colors flex-1">{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <!-- 今日语录 -->
      <div 
        ref="quoteRef"
        class="quote-card p-6 rounded-2xl shadow-lg border border-pink-200/50 flex flex-col justify-center items-center text-center bg-white/90 backdrop-blur-sm card-hover relative overflow-hidden"
      >
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-pink-200/20 rounded-full blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-pink-100/15 rounded-full blur-2xl"></div>
        
        <div class="relative z-10 w-full">
          <div class="text-5xl mb-4 flex justify-center transform transition-transform hover:scale-110">
            <Icon icon="noto:speech-balloon" class="text-6xl filter drop-shadow-lg text-pink-400" />
          </div>
          <h3 class="font-bold text-lg mb-3 gradient-text">今日花音语录</h3>
          <p class="italic text-gray-800 text-base leading-relaxed px-2 font-medium min-h-[3rem]">{{ quotes?.[0]?.text || '暂无语录' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-card {
  background: linear-gradient(135deg, rgba(255, 240, 245, 0.95) 0%, rgba(255, 228, 225, 0.95) 50%, rgba(255, 229, 229, 0.95) 100%);
}

.btn-primary {
  background: linear-gradient(to right, #FFB6C1, #FFC0CB);
  color: #8B4A6B;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 500;
  box-shadow: 0 10px 15px -3px rgba(255, 182, 193, 0.3), 0 4px 6px -2px rgba(255, 192, 203, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 182, 193, 0.5);
  background: linear-gradient(to right, #FFC0CB, #FFB3BA);
}

.btn-primary-hover {
  background: linear-gradient(to right, #FFB6C1, #FFC0CB);
}

.btn-secondary {
  background: white;
  color: #D81B60;
  border: 2px solid #FFB6C1;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(255, 182, 193, 0.2), 0 2px 4px -1px rgba(255, 192, 203, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #FFF0F5;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 182, 193, 0.4);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 152, 0, 0.3);
}

.news-item {
  transition: all 0.3s ease;
}

.news-item:hover {
  transform: translateX(5px);
  background: linear-gradient(90deg, rgba(255, 240, 245, 0.5) 0%, transparent 100%);
  padding-left: 8px;
  border-radius: 8px;
}

.quote-card {
  position: relative;
  /* 初始状态确保可见 */
  opacity: 1;
  transform: translate(0, 0) scale(1);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>