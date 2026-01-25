<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { getBilibiliArchivesApi } from '../api';

interface LiveScheduleItem {
  day: number;
  title: string;
  time: string;
  desc: string;
  pubdate: number; // 时间戳
  bvid?: string;
  link?: string;
}

interface ReplayItem {
  id: number;
  title: string;
  date: string;
  link: string;
}

interface BilibiliArchiveItem {
  aid: number;
  title: string;
  pubdate: number; // 时间戳（秒）
  bvid: string;
  pic?: string;
  duration?: number;
  stat?: {
    view?: number;
  };
}




// 直播日程数据（从接口获取）
const scheduleData = reactive<LiveScheduleItem[]>([]);
// 存储所有日程数据（用于本地过滤）
const allScheduleData = ref<LiveScheduleItem[]>([]);
const loading = ref(false);

// 将 Bilibili 回放数据格式转换为前端需要的格式
const transformScheduleData = (apiData: BilibiliArchiveItem[]): LiveScheduleItem[] => {
  const result: LiveScheduleItem[] = [];
  
  (apiData ?? []).forEach((item) => {
    try {
      // 解析时间戳（秒）
      const date = dayjs.unix(item.pubdate);
      
      if (!date.isValid()) {
        return;
      }
      
      // 从标题中提取时间信息（如果有）
      const timeMatch = item.title.match(/(\d{1,2})[点时]/);
      const timeStr = timeMatch ? `${timeMatch[1]}:00` : '待定';
      
      // 从标题中提取日期信息（支持多种格式）
      let dayFromTitle: number | null = null;
      
      // 匹配格式：X月X日、X/X、X-X、X.X 等
      const dayMatch = item.title.match(/(?:(\d{1,2})[月/\-\.](\d{1,2})[日]?)|(?:(\d{4})[年\-/\.](\d{1,2})[月\-/\.](\d{1,2})[日]?)/);
      if (dayMatch) {
        // 如果有年月日格式
        if (dayMatch[3] && dayMatch[4] && dayMatch[5]) {
          const titleDate = dayjs(`${dayMatch[3]}-${dayMatch[4]}-${dayMatch[5]}`);
          if (titleDate.isValid()) {
            dayFromTitle = titleDate.date();
          }
        } 
        // 如果只有月日格式
        else if (dayMatch[1] && dayMatch[2]) {
          dayFromTitle = parseInt(dayMatch[2], 10);
        }
      }
      
      // 如果从标题中提取到了日期，使用标题中的日期；否则使用时间戳对应的日期
      const day = dayFromTitle !== null ? dayFromTitle : date.date();
      
      result.push({
        day: day,
        title: item.title || '直播回放',
        time: timeStr,
        desc: item.title || '',
        pubdate: item.pubdate,
        bvid: item.bvid,
        link: item.bvid ? `https://www.bilibili.com/video/${item.bvid}/` : undefined
      });
    } catch (error) {
      console.error('转换日程数据失败:', item, error);
    }
  });
  
  return result;
};

// 初始化获取所有直播日程数据（只调用一次）
const fetchAllScheduleData = async () => {
  loading.value = true;
  try {
    // 获取所有回放数据（ps=3000）
    const response = await getBilibiliArchivesApi({ ps: 3000, pn: 1 });
    const archives = (response?.data?.archives ?? response?.archives ?? []) as BilibiliArchiveItem[];
    
    // 转换所有数据并存储
    allScheduleData.value = transformScheduleData(archives);
    
    // 初始化当前月份的数据
    filterScheduleDataByMonth(currentMonth.value);
  } catch (error) {
    console.error('获取直播日程失败:', error);
    // 出错时使用空数组
    allScheduleData.value = [];
    scheduleData.length = 0;
  } finally {
    loading.value = false;
  }
};

// 根据月份过滤本地数据（不调用接口）
const filterScheduleDataByMonth = (month: Dayjs) => {
  const startOfMonth = month.startOf('month');
  const endOfMonth = month.endOf('month');
  const monthStartTimestamp = startOfMonth.unix();
  const monthEndTimestamp = endOfMonth.unix();
  
  // 过滤出当前月份的数据
  const monthSchedules = allScheduleData.value.filter((item) => {
    return item.pubdate >= monthStartTimestamp && item.pubdate <= monthEndTimestamp;
  });
  
  // 更新当前显示的日程数据
  scheduleData.length = 0;
  scheduleData.push(...monthSchedules);
};

const replays = ref<ReplayItem[]>([]);
const replayLoading = ref(false);

const fetchReplays = async () => {
  replayLoading.value = true;
  try {
    const res = await getBilibiliArchivesApi({ ps: 3000, pn: 1 });
    const archives = (res?.data?.archives ?? res?.archives ?? []) as BilibiliArchiveItem[];
    replays.value = archives.map((item, idx) => {
      const date = item?.pubdate ? dayjs.unix(item.pubdate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      return {
        id: item?.aid ?? idx,
        title: item?.title ?? '直播回放',
        date,
        link: item?.bvid ? `https://www.bilibili.com/video/${item.bvid}/` : '#'
      };
    });
  } catch (error) {
    console.error('获取回放列表失败:', error);
    replays.value = [];
  } finally {
    replayLoading.value = false;
  }
};

// -----------------------
// 日历逻辑
// -----------------------

const currentMonth = ref<Dayjs>(dayjs());

const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

interface CalendarCell {
  date: Dayjs;
  isCurrentMonth: boolean;
  schedules?: LiveScheduleItem[]; // 同一天可能有多条日程
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
    const schedulesForDay = scheduleData.filter((s) => s.day === d);
    cells.push({
      date,
      isCurrentMonth: true,
      schedules: schedulesForDay.length > 0 ? schedulesForDay : undefined
    });
  }

  // 填满到 5 行（35 个格子）
  const totalCells = 35;
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

const selectedSchedules = computed<LiveScheduleItem[]>(() => {
  if (!selectedDate.value) return [];
  return scheduleData.filter(
    (item) =>
      currentMonth.value.month() === selectedDate.value?.month() &&
      currentMonth.value.year() === selectedDate.value?.year() &&
      item.day === selectedDate.value.date()
  );
});

const monthLabel = computed(() => currentMonth.value.format('YYYY 年 M 月'));

const handlePrevMonth = () => {
  currentMonth.value = currentMonth.value.subtract(1, 'month');
  filterScheduleDataByMonth(currentMonth.value);
};

const handleNextMonth = () => {
  currentMonth.value = currentMonth.value.add(1, 'month');
  filterScheduleDataByMonth(currentMonth.value);
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

let chartInstance: echarts.ECharts | null = null;



const handleClickReplay = (link: string) => {
  
  window.open(link, '_blank','noopener,noreferrer');
};

onMounted(() => {
  // 初始化加载所有日程数据（只调用一次）
  fetchAllScheduleData();
  fetchReplays();
  
  
  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
});

// 监听月份变化，自动过滤本地数据
watch(currentMonth, (newMonth) => {
  filterScheduleDataByMonth(newMonth);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

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
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center py-8 text-gray-500 text-sm">
          加载中...
        </div>
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
              cell.schedules && cell.schedules.length > 0 ? 'hover:border-pink-300 hover:bg-pink-50 hover:shadow-sm cursor-pointer' : ''
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
            <!-- 有直播的日期，高亮小圆点（最多显示2条） -->
            <div v-if="cell.schedules && cell.schedules.length > 0" class="mt-1 flex flex-col gap-0.5">
              <div
                v-for="(schedule, idx) in cell.schedules.slice(0, 2)"
                :key="idx"
                class="flex items-center gap-1"
              >
                <span
                  class="w-2 h-2 rounded-full flex-shrink-0 bg-pink-500"
                />
                <span class="text-[10px] text-gray-600 truncate">
                  {{ schedule.title.replace(/【.*?】/, '') }}
                </span>
              </div>
              <div v-if="cell.schedules.length > 2" class="text-[9px] text-gray-400 mt-0.5">
                +{{ cell.schedules.length - 2 }} 更多
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
            <div v-if="selectedSchedules.length > 0" class="space-y-3">
              <div
                v-for="(schedule, idx) in selectedSchedules"
                :key="idx"
                class="border-b border-pink-100 pb-2 last:border-0 last:pb-0 cursor-pointer"
                @click="handleClickReplay(schedule.link)"
              >
                <div class="text-sm font-semibold text-gray-800">
                  {{ schedule.title }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ schedule.time }}
                </div>
               
              </div>
            </div>
            <div v-else class="text-xs text-gray-400">
              当天暂无直播安排，可以安排一场特别活动哦～
            </div>
          </div>
        </div>
      </div>

  

        <!-- 近期回放 -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full">
          <h3 class="font-bold text-gray-800 mb-3 text-sm">近期回放归档</h3>
          <div v-if="replayLoading" class="text-xs text-gray-400">加载中...</div>
          <ul v-else-if="replays.length" class="space-y-2 text-xs">
            <li v-for="item in replays.slice(0, 10)" :key="item.id" class="flex items-start justify-between group">
              <div @click="handleClickReplay(item.link)" class="cursor-pointer">
                  {{ item.title }}
                <div class="text-[11px] text-gray-400 mt-0.5">
                  {{ item.date }} 
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="text-xs text-gray-400">暂无回放数据</div>
        </div>
      </div>
    </div>

</template>