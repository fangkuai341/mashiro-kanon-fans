<script setup lang="ts">
import dayjs from 'dayjs';
import { onMounted, ref, nextTick, watch } from 'vue';
import { getTimelineApi } from '../api';
import { TimelineItem } from '../type';
import Chart from './Chart.vue';



const timeline=ref<TimelineItem[]>([])
const isTimelineExpanded = ref(false)
const showExpandButton = ref(false)
const timelineContentRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const handlePause = () => {
  if (videoRef.value) {
    videoRef.value.play()
  }
}

const checkIfScrollable = () => {
  nextTick(() => {
    // 检查内部时间轴内容的实际高度
    if (timelineContentRef.value) {
      const contentHeight = timelineContentRef.value.scrollHeight
      const maxDisplayHeight = 300
      
      if (isTimelineExpanded.value) {
        // 展开状态：如果内容超过300px，显示收起按钮
        showExpandButton.value = contentHeight > maxDisplayHeight
      } else {
        // 收起状态：只有内容超过300px时才显示展开按钮
        showExpandButton.value = contentHeight > maxDisplayHeight
      }
    }
  })
}

watch([timeline], () => {
  checkIfScrollable()
})

watch(isTimelineExpanded, () => {
  checkIfScrollable()
})

onMounted(async () => {
  //获取timeline
  const res=await getTimelineApi()
  timeline.value=res
  checkIfScrollable()
});
</script>

<template>
  <div class="fade-in space-y-8">

    <!-- Bio Section omitted for brevity, use layout from original -->
     <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-fit" style="padding: 20px 0;    background: #f3f3f3;">
            <video 
              ref="videoRef"
              class="h-64 w-full object-cover"
              src="../../public/video/video.mp4"
              autoplay
              muted
              loop
              playsinline
              @pause="handlePause"
            ></video>
            <!-- ... -->
        </div>

        <div class="md:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-lg mb-4 text-pink-500">🌸 经历时间轴</h3>
            <div>
              <!-- 内容区域 wrapper - 用于控制高度 -->
              <div 
                class="relative transition-all duration-300 ease-in-out"
                :style="{ maxHeight: isTimelineExpanded ? 'none' : '300px' }"
              >
                <!-- 实际内容 -->
                <div 
                  :style="{ maxHeight: isTimelineExpanded ? 'none' : '300px', overflow: 'auto' }"
                >
                  <div ref="timelineContentRef" class="relative border-l-2 border-pink-200 ml-3 space-y-6 pb-2">
                    <div v-for="(item, idx) in timeline" :key="idx" class="ml-6 relative">
                      <div class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-pink-400 border-2 border-white ring-2 ring-pink-100"></div>
                      <div class="text-xs text-pink-500 font-bold">{{ item.year }}</div>
                      <div class="text-gray-800 font-medium">{{ item.text }} <span class="text-gray-400 text-xs ml-2">{{dayjs(item.date).format('MM/DD')  }}</span></div>
                    </div>
                  </div>
                </div>
                <!-- 渐变遮罩 - 覆盖在内容区域底部 -->
                <div 
                  v-if="!isTimelineExpanded &&showExpandButton"
                  class="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                  style="background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.7), white);"
                ></div>
              </div>
              <!-- 展开按钮 - 在内容区域下方，只有当内容超过300px时才显示 -->
              <div v-if="showExpandButton" class="flex justify-center pt-4">
                <button 
                  @click="isTimelineExpanded = !isTimelineExpanded"
                  class="text-pink-500 hover:text-pink-600 text-sm font-medium  gap-1 transition-colors"
                >
                <div class="flex items-center">
                   <div class="flex-none">{{ isTimelineExpanded ? '收起' : '展开' }}</div>
                 
                </div>
                 
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-lg mb-4 text-gray-700">📈 粉丝成长里程碑</h3>
            <div class="chart-container">
              <Chart />
            </div>
          </div>
        </div>
     </div>
  </div>
</template>