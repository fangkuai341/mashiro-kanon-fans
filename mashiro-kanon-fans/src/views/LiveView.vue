<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import type { ScheduleItem } from '../type';

// -----------------------
// Mock Data（可后续接后端）
// -----------------------

type LiveType = 'song' | 'game' | 'chat' | 'collab';

interface LiveScheduleItem extends ScheduleItem {
  title: string;
  time: string;
  desc: string;
}

interface ReplayItem {
  id: number;
  title: string;
  type: LiveType;
  date: string;
  link: string;
}

const liveTypeMeta: Record<LiveType, { label: string; color: string }> = {
  song: { label: '歌回 (Singing)', color: '#F472B6' },
  game: { label: '游戏 (Game)', color: '#60A5FA' },
  chat: { label: '杂谈 (Chat)', color: '#FBBF24' },
  collab: { label: '联动 (Collab)', color: '#A855F7' }
};

// 当前月份的日程示例数据
const scheduleData = reactive<LiveScheduleItem[]>([
  { day: 1, type: 'song', title: '【歌回】最喜欢的恋爱歌曲精选', time: '20:00 - 22:00', desc: '轻松恋爱歌主题歌回' },
  { day: 3, type: 'game', title: '【游戏】恐怖游戏：层层恐惧', time: '21:00 - 23:00', desc: '深夜恐怖体验直播' },
  { day: 5, type: 'chat', title: '【杂谈】闲聊近况 & 唠嗑', time: '19:30 - 21:00', desc: '和观众一起聊聊最近的故事' },
  { day: 10, type: 'song', title: '【歌回】花音节并不骗人…', time: '20:00 - 22:30', desc: '高能歌回特别场' },
  { day: 12, type: 'game', title: '【游戏】合作联机之夜', time: '20:30 - 23:00', desc: '和好友一起联机游戏' },
  { day: 14, type: 'chat', title: '【杂谈】箱花墙回忆大会', time: '19:00 - 21:00', desc: '一起回顾那些暖心瞬间' }
]);

// 近期回放示例数据
const replays = ref<ReplayItem[]>([
  {
    id: 1,
    title: '【歌回】最人节并不骗人…',
    type: 'song',
    date: '2024-04-02',
    link: '#'
  },
  {
    id: 2,
    title: '【游戏】恐怖游戏：层层恐惧',
    type: 'game',
    date: '2024-04-05',
    link: '#'
  },
  {
    id: 3,
    title: '【杂谈】箱花墙回忆大会',
    type: 'chat',
    date: '2024-04-08',
    link: '#'
  }
]);

// -----------------------
// 日历逻辑
// -----------------------

const currentMonth = ref<Dayjs>(dayjs('2024-04-01'));

const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

interface CalendarCell {
  date: Dayjs;
  isCurrentMonth: boolean;
  schedule?: LiveScheduleItem;
}

const calendarCells = computed<CalendarCell[]>(() => {
  const startOfMonth = currentMonth.value.startOf('month');
  const endOfMonth = currentMonth.value.endOf('month');

  const startWeekday = startOfMonth.day(); // 0 ~ 6
  const daysInMonth = currentMonth.value.daysInMonth();

  const cells: CalendarCell[] = [];

  // 前置空格（上个月的占位）
  for (let i = 0; i < startWeekday; i++) {
    const date = startOfMonth.subtract(startWeekday - i, 'day');
    cells.push({
      date,
      isCurrentMonth: false
    });
  }

  // 当前月日期
  for (let d = 1; d <= daysInMonth; d++) {
    const date = currentMonth.value.date(d);
    const scheduleForDay = scheduleData.find((s) => s.day === d);
    cells.push({
      date,
      isCurrentMonth: true,
      schedule: scheduleForDay
    });
  }

  // 填满到 6 行（42 个格子）
  const totalCells = 42;
  const remaining = totalCells - cells.length;
  const lastDate = endOfMonth;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: lastDate.add(i, 'day'),
      isCurrentMonth: false
    });
  }

  return cells;
});

const selectedDate = ref<Dayjs | null>(currentMonth.value);

const selectedSchedule = computed<LiveScheduleItem | undefined>(() => {
  if (!selectedDate.value) return undefined;
  return scheduleData.find(
    (item) =>
      currentMonth.value.month() === selectedDate.value?.month() &&
      item.day === selectedDate.value.date()
  );
});

const monthLabel = computed(() => currentMonth.value.format('YYYY 年 M 月'));

const handlePrevMonth = () => {
  currentMonth.value = currentMonth.value.subtract(1, 'month');
};

const handleNextMonth = () => {
  currentMonth.value = currentMonth.value.add(1, 'month');
};

const handleSelectDate = (cell: CalendarCell) => {
  if (!cell.isCurrentMonth) return;
  selectedDate.value = cell.date;
};

const isToday = (cell: CalendarCell) => {
  const today = dayjs();
  return (
    cell.date.date() === today.date() &&
    cell.date.month() === today.month() &&
    cell.date.year() === today.year()
  );
};

// -----------------------
// ECharts 环形图
// -----------------------

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const chartData = computed(() => {
  const typeCount: Record<LiveType, number> = {
    song: 0,
    game: 0,
    chat: 0,
    collab: 0
  };

  scheduleData.forEach((item) => {
    typeCount[item.type] += 1;
  });

  return (Object.keys(typeCount) as LiveType[])
    .filter((k) => typeCount[k] > 0)
    .map((k) => ({
      name: liveTypeMeta[k].label,
      value: typeCount[k],
      itemStyle: { color: liveTypeMeta[k].color }
    }));
});

const renderChart = () => {
  if (!chartContainer.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value);
  }

  chartInstance.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: {
        color: '#4B5563',
        fontSize: 12
      }
    },
    series: [
      {
        name: '直播内容分布',
        type: 'pie',
        radius: ['55%', '80%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.value
      }
    ]
  });
};

onMounted(() => {
  renderChart();
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

watch(
  chartData,
  () => {
    renderChart();
  },
  { deep: true }
);
</script>

<template>
  <div class="fade-in max-w-6xl mx-auto py-8 space-y-6">
    <!-- 标题与说明 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          直播中心
          <span class="text-xl">🕒</span>
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          直播日程安排与内容分析，一目了然掌握花音的直播计划。
        </p>
      </div>
      
    </div>

    <!-- 主体：左侧日历 + 右侧分析 -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 左：日历 -->
      <div class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <!-- 月份控制 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-gray-800">直播日程</h3>
            <span class="px-2 py-0.5 rounded-full text-xs bg-pink-50 text-pink-500 border border-pink-100">
              月视图
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="px-2 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm"
              @click="handlePrevMonth"
            >
              ‹ 上一月
            </button>
            <div class="text-sm text-gray-600 font-medium min-w-[120px] text-center">
              {{ monthLabel }}
            </div>
            <button
              class="px-2 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm"
              @click="handleNextMonth"
            >
              下一月 ›
            </button>
          </div>
        </div>

        <!-- 星期标题 -->
        <div class="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-2">
          <div v-for="w in weeks" :key="w" class="py-2">
            {{ w }}
          </div>
        </div>

        <!-- 日历格子 -->
        <div class="grid grid-cols-7 gap-1.5 flex-1">
          <button
            v-for="cell in calendarCells"
            :key="cell.date.format('YYYY-MM-DD')"
            class="relative rounded-lg border text-left px-2 py-2 transition-all text-xs aspect-square"
            :class="[
              cell.isCurrentMonth ? 'bg-gray-50 border-gray-100' : 'bg-white border-dashed border-gray-100 text-gray-300',
              selectedDate && cell.isCurrentMonth && cell.date.isSame(selectedDate, 'day')
                ? 'ring-2 ring-pink-300 border-pink-300 bg-pink-50'
                : '',
              cell.schedule ? 'hover:border-pink-300 hover:bg-pink-50 hover:shadow-sm cursor-pointer' : ''
            ]"
            @click="handleSelectDate(cell)"
          >
            <div class="flex items-start justify-between mb-1">
              <span class="text-sm font-semibold" :class="cell.isCurrentMonth ? 'text-gray-800' : 'text-gray-300'">
                {{ cell.date.date() }}
              </span>
              <span
                v-if="isToday(cell)"
                class="px-1.5 py-0.5 rounded-full text-[10px] bg-pink-500 text-white font-medium"
              >
                今天
              </span>
            </div>
            <!-- 有直播的日期，高亮小圆点 -->
            <div v-if="cell.schedule" class="mt-1 flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <span
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: liveTypeMeta[cell.schedule.type].color }"
                />
                <span class="text-[10px] text-gray-600 truncate">
                  {{ cell.schedule.title.replace(/【.*?】/, '') }}
                </span>
              </div>
            </div>
          </button>
        </div>

        <!-- 选中日期详情 -->
        <div class="mt-4 rounded-xl bg-pink-50/60 border border-pink-100 px-4 py-3 flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 mb-1">
              {{ selectedDate ? selectedDate.format('YYYY 年 M 月 D 日 dddd') : '请选择日期' }}
            </div>
            <div v-if="selectedSchedule">
              <div class="text-sm font-semibold text-gray-800">
                {{ selectedSchedule.title }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ selectedSchedule.time }} ·
                <span :style="{ color: liveTypeMeta[selectedSchedule.type].color }">
                  {{ liveTypeMeta[selectedSchedule.type].label }}
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ selectedSchedule.desc }}
              </div>
            </div>
            <div v-else class="text-xs text-gray-400">
              当天暂无直播安排，可以安排一场特别活动哦～
            </div>
          </div>
          <div class="hidden sm:flex flex-col items-end text-right gap-1 text-[11px] text-gray-500">
            <div class="flex items-center gap-2">
              <span
                v-for="(meta, key) in liveTypeMeta"
                :key="key"
                class="inline-flex items-center gap-1"
              >
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: meta.color }" />
                {{ meta.label.split(' ')[0] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：内容分布 + 回放 -->
      <div class="w-full lg:w-80 space-y-4 flex-shrink-0">
        <!-- 环形图 -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[320px]">
          <h3 class="font-bold text-gray-800 mb-1 text-center text-sm">直播内容分布</h3>
          <p class="text-[11px] text-gray-400 text-center mb-3">
            当前月份内不同类型直播所占比例
          </p>
          <div ref="chartContainer" class="flex-1 min-h-[220px]" />
        </div>

        <!-- 近期回放 -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="font-bold text-gray-800 mb-3 text-sm">近期回放归档</h3>
          <ul class="space-y-2 text-xs">
            <li
              v-for="item in replays"
              :key="item.id"
              class="flex items-start justify-between group"
            >
              <div>
                <a
                  :href="item.link"
                  class="text-pink-500 group-hover:text-pink-600 underline decoration-pink-200 underline-offset-2"
                >
                  {{ item.title }}
                </a>
                <div class="text-[11px] text-gray-400 mt-0.5">
                  {{ item.date }} ·
                  <span :style="{ color: liveTypeMeta[item.type].color }">
                    {{ liveTypeMeta[item.type].label }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>