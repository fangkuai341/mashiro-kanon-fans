<script setup lang="ts">
import { onUnmounted, reactive } from 'vue';
// 使用 Vite 的 ?url 后缀明确导入为 URL
// @ts-ignore
import puzzleImageUrl from '../assets/img/puzzle.png?url';

const GRID_SIZE = 3;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const CELL_SIZE = 80;
const GAP = 4;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * GAP;

// 获取拼图块在原图中的位置
const getTilePosition = (tileValue: number) => {
  if (tileValue === 0) return { x: 0, y: 0 };
  // tileValue 是 1-8，需要转换为 0-7 的索引
  const index = tileValue - 1;
  const col = index % GRID_SIZE;
  const row = Math.floor(index / GRID_SIZE);
  // 使用拼图块的显示尺寸来计算位置（确保切片对齐）
  // 背景图片会被缩放到 BOARD_SIZE，每个切片正好是 CELL_SIZE
  return {
    x: -col * CELL_SIZE,
    y: -row * CELL_SIZE
  };
};

// 目标状态（完成状态）
const solvedState = Array.from({ length: TOTAL_CELLS - 1 }, (_, i) => i + 1).concat(0);

const gameState = reactive({
  active: false,
  puzzle: [...solvedState],
  emptyIndex: TOTAL_CELLS - 1,
  moves: 0,
  startTime: 0,
  elapsedTime: 0,
  completed: false
});

let timerId: number | null = null;

// 检查是否可解（逆序数算法）
const isSolvable = (arr: number[]): boolean => {
  let inversions = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] !== 0 && arr[j] !== 0 && arr[i] > arr[j]) {
        inversions++;
      }
    }
  }
  // 对于3x3，逆序数为偶数时可解
  return inversions % 2 === 0;
};

// 打乱拼图（确保可解）
const shufflePuzzle = (): void => {
  let shuffled: number[];
  do {
    shuffled = [...solvedState];
    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (!isSolvable(shuffled) || isSolved(shuffled));
  
  gameState.puzzle = shuffled;
  gameState.emptyIndex = shuffled.indexOf(0);
};

// 检查是否完成
const isSolved = (puzzle: number[] = gameState.puzzle): boolean => {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (puzzle[i] !== solvedState[i]) {
      return false;
    }
  }
  return true;
};

// 获取可移动的相邻索引
const getAdjacentIndices = (index: number): number[] => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const adjacent: number[] = [];
  
  if (row > 0) adjacent.push(index - GRID_SIZE); // 上
  if (row < GRID_SIZE - 1) adjacent.push(index + GRID_SIZE); // 下
  if (col > 0) adjacent.push(index - 1); // 左
  if (col < GRID_SIZE - 1) adjacent.push(index + 1); // 右
  
  return adjacent;
};

// 移动拼图块
const moveTile = (index: number): void => {
  if (!gameState.active || gameState.completed) return;
  
  const adjacentIndices = getAdjacentIndices(gameState.emptyIndex);
  
  if (adjacentIndices.includes(index)) {
    // 交换位置
    [gameState.puzzle[index], gameState.puzzle[gameState.emptyIndex]] = 
      [gameState.puzzle[gameState.emptyIndex], gameState.puzzle[index]];
    
    gameState.emptyIndex = index;
    gameState.moves++;
    
    // 检查是否完成
    if (isSolved()) {
      gameState.completed = true;
      gameState.active = false;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  }
};

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 开始游戏
const startGame = (): void => {
  if (gameState.active) return;
  
  gameState.active = true;
  gameState.completed = false;
  gameState.moves = 0;
  gameState.startTime = Date.now();
  gameState.elapsedTime = 0;
  
  shufflePuzzle();
  
  // 启动计时器
  timerId = window.setInterval(() => {
    if (gameState.active && !gameState.completed) {
      gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    }
  }, 1000);
};

// 重置游戏
const resetGame = (): void => {
  gameState.active = false;
  gameState.completed = false;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  startGame();
};

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});
</script>

<template>
  <div class="relative bg-gray-900 border-4 border-indigo-500 rounded-xl overflow-hidden shadow-2xl p-4" style="width: 300px; min-height: 400px;">
    <!-- 游戏信息 -->
    <div class="text-white text-xs mb-3 space-y-1">
      <div class="flex justify-between">
        <span>步数: {{ gameState.moves }}</span>
        <span>时间: {{ formatTime(gameState.elapsedTime) }}</span>
      </div>
    </div>
    
    <!-- 拼图网格 -->
    <div class="relative mx-auto" :style="{ width: `${BOARD_SIZE}px`, height: `${BOARD_SIZE}px` }">
      <div 
        v-for="(value, index) in gameState.puzzle" 
        :key="`${index}-${value}`"
        class="absolute transition-all duration-200 ease-in-out cursor-pointer select-none"
        :class="{
          'opacity-0': value === 0,
          'hover:scale-105 active:scale-95': value !== 0 && gameState.active && !gameState.completed
        }"
        :style="{
          left: `${(index % GRID_SIZE) * (CELL_SIZE + GAP)}px`,
          top: `${Math.floor(index / GRID_SIZE) * (CELL_SIZE + GAP)}px`,
          width: `${CELL_SIZE}px`,
          height: `${CELL_SIZE}px`,
          zIndex: value === 0 ? 0 : 1
        }"
        @click="moveTile(index)"
      >
        <div 
          v-if="value !== 0"
          class="w-full  rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden bg-gray-200"
          :style="{
            backgroundImage: `url(${puzzleImageUrl})`,
            backgroundSize: `${GRID_SIZE * CELL_SIZE}px ${GRID_SIZE * CELL_SIZE}px`,
            backgroundPosition: `${getTilePosition(value).x}px ${getTilePosition(value).y}px`,
            backgroundRepeat: 'no-repeat',
            height: '100%',
          }"
        >
        </div>
      </div>
    </div>
    
    <!-- 完成提示 -->
    <div v-if="gameState.completed" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20 rounded-xl">
      <h4 class="text-2xl font-bold mb-2 text-yellow-300">🎉 完成！</h4>
      <p class="text-sm mb-1">步数: {{ gameState.moves }}</p>
      <p class="text-sm mb-4">时间: {{ formatTime(gameState.elapsedTime) }}</p>
      <button 
        @click="resetGame" 
        class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-bold transition transform hover:scale-105"
      >
        再来一局
      </button>
    </div>
    
    <!-- 开始界面 -->
    <div v-if="!gameState.active && !gameState.completed" class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/90 rounded-xl">
      <button 
        @click="startGame" 
        class="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition mb-3"
      >
        开始游戏
      </button>
      <p class="text-white text-xs text-center px-4">
        点击空白附近的拼图块<br/>将它们移动到正确位置
      </p>
    </div>
  </div>
</template>
