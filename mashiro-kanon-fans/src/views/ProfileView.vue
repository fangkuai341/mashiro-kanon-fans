<script setup lang="ts">
import dayjs from "dayjs";
import { onMounted, ref, nextTick, watch } from "vue";
import { gsap } from "gsap";
import { Icon } from "@iconify/vue";
import { getTimelineApi } from "../api";
import { TimelineItem } from "../type";
import Chart from "./Chart.vue";

const timeline = ref<TimelineItem[]>([]);
const isTimelineExpanded = ref(false);
const showExpandButton = ref(false);
const timelineContentRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);

const handlePause = () => {
  if (videoRef.value) {
    videoRef.value.play();
  }
};

const checkIfScrollable = () => {
  nextTick(() => {
    // 检查内部时间轴内容的实际高度
    if (timelineContentRef.value) {
      const contentHeight = timelineContentRef.value.scrollHeight;
      const maxDisplayHeight = 300;

      if (isTimelineExpanded.value) {
        // 展开状态：如果内容超过300px，显示收起按钮
        showExpandButton.value = contentHeight > maxDisplayHeight;
      } else {
        // 收起状态：只有内容超过300px时才显示展开按钮
        showExpandButton.value = contentHeight > maxDisplayHeight;
      }
    }
  });
};

watch([timeline], () => {
  checkIfScrollable();
});

watch(isTimelineExpanded, () => {
  checkIfScrollable();
});

onMounted(async () => {
  //获取timeline
  const res = await getTimelineApi();
  timeline.value = res;
  checkIfScrollable();
  
  // 等待DOM渲染完成
  await nextTick();
  
  // GSAP 动画
  const profileHeader = document.querySelector('.profile-header');
  if (profileHeader) {
    gsap.fromTo(profileHeader, 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }
  
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) {
    gsap.fromTo(profileCard,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.7, delay: 0.2, ease: 'back.out(1.7)' }
    );
  }
  
  const timelineCard = document.querySelector('.timeline-card');
  if (timelineCard) {
    gsap.fromTo(timelineCard,
      { opacity: 0, x: -30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.7, 
        delay: 0.4, 
        ease: 'power2.out',
        onComplete: () => {
          if (timelineCard) gsap.set(timelineCard, { clearProps: 'all' });
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
        delay: 0.6, 
        ease: 'power2.out',
        onComplete: () => {
          if (chartCard) gsap.set(chartCard, { clearProps: 'all' });
        }
      }
    );
  }
});
</script>

<template>
  <div class="fade-in space-y-8">
    <!-- Bio Section omitted for brevity, use layout from original -->
    <div class="profile-header flex items-center justify-between">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold gradient-text flex items-center gap-2">
          关于真白花音
          <Icon icon="noto:alarm-clock" class="text-xl animate-pulse" style="animation-duration: 2s;" />
        </h2>
        <p class="text-sm text-gray-600 mt-1">
          了解清楚系(?)主播的成长之路。
        </p>
      </div>
      
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        class="profile-card bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-orange-100/50 h-fit card-hover"
      >
        <div style="padding: 20px 0; background: #f3f3f3">
          <video
            ref="videoRef"
            class="h-64 w-full object-contain"
            src="../../public/video/video.mp4"
            autoplay
            muted
            loop
            playsinline
            @pause="handlePause"
          ></video>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-gray-500">姓名</span>
            <span class="font-bold gradient-text">真白花音</span>
          </div>
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-gray-500">生日</span>
            <span class="flex items-center gap-1">
              12月24日
              <Icon icon="noto:christmas-tree" class="text-base" />
            </span>
          </div>
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-gray-500">身高</span>
            <span>158cm</span>
          </div>
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-gray-500">粉丝名</span>
            <span class="bg-pink-100 text-pink-700 px-2 rounded text-sm"
              >Mashiromates</span
            >
          </div>
          <div class="pt-2">
            <span class="text-gray-500 block mb-1">简介</span>
            <p class="text-sm text-gray-600 leading-relaxed">
              以治愈系歌声为主的VTuber。梦想是在大大的舞台上为大家歌唱。喜欢甜食，特别是草莓大福。
            </p>
          </div>
        </div>
      </div>

      <div class="md:col-span-2 space-y-6">
        <div class="timeline-card bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100/50 card-hover">
          <h3 class="font-bold text-lg mb-4 gradient-text flex items-center gap-2">
            <Icon icon="noto:scroll" class="text-lg" />
            经历时间轴
          </h3>
          <div>
            <!-- 内容区域 wrapper - 用于控制高度 -->
            <div
              class="relative transition-all duration-300 ease-in-out"
              :style="{ maxHeight: isTimelineExpanded ? 'none' : '300px' }"
            >
              <!-- 实际内容 -->
              <div
                :style="{
                  maxHeight: isTimelineExpanded ? 'none' : '300px',
                  overflow: 'auto',
                }"
              >
                <div
                  ref="timelineContentRef"
                  class="relative border-l-2 border-pink-300 ml-3 space-y-6 pb-2"
                >
                  <div
                    v-for="(item, idx) in timeline"
                    :key="idx"
                    class="ml-6 relative group"
                  >
                    <div
                      class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 border-2 border-white ring-2 ring-pink-200 transition-transform group-hover:scale-125"
                    ></div>
                    <div class="text-xs text-pink-500 font-bold">
                      {{ item.year }}
                    </div>
                    <div class="text-gray-800 font-medium">
                      {{ item.text }}
                      <span class="text-gray-400 text-xs ml-2">{{
                        dayjs(item.date).format("MM/DD")
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 渐变遮罩 - 覆盖在内容区域底部 -->
              <div
                v-if="!isTimelineExpanded && showExpandButton"
                class="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                style="
                  background: linear-gradient(
                    to bottom,
                    transparent,
                    rgba(255, 255, 255, 0.7),
                    white
                  );
                "
              ></div>
            </div>
            <!-- 展开按钮 - 在内容区域下方，只有当内容超过300px时才显示 -->
            <div v-if="showExpandButton" class="flex justify-center pt-4">
              <button
                @click="isTimelineExpanded = !isTimelineExpanded"
                class="text-pink-500 hover:text-pink-600 text-sm font-medium gap-1 transition-colors"
              >
                <div class="flex items-center">
                  <div class="flex-none">
                    {{ isTimelineExpanded ? "收起" : "展开" }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="chart-card bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100/50 card-hover">
          <h3 class="font-bold text-lg mb-4 gradient-text flex items-center gap-2">
            <Icon icon="noto:chart-increasing" class="text-lg" />
            粉丝成长里程碑
          </h3>
          <div class="chart-container">
            <Chart />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-card,
.chart-card {
  opacity: 1;
  transform: translate(0, 0);
}
</style>
