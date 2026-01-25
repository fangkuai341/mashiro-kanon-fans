<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';

// 游戏配置
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 15;
const BOARD_WIDTH = COLS * BLOCK_SIZE;
const BOARD_HEIGHT = ROWS * BLOCK_SIZE;
const BOARD_OFFSET_X = (300 - BOARD_WIDTH) / 2;
const BOARD_OFFSET_Y = (400 - BOARD_HEIGHT) / 2;

// 俄罗斯方块形状定义
const SHAPES = [
  // I
  [[1, 1, 1, 1]],
  // O
  [[1, 1], [1, 1]],
  // T
  [[0, 1, 0], [1, 1, 1]],
  // S
  [[0, 1, 1], [1, 1, 0]],
  // Z
  [[1, 1, 0], [0, 1, 1]],
  // J
  [[1, 0, 0], [1, 1, 1]],
  // L
  [[0, 0, 1], [1, 1, 1]]
];

const COLORS = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const gameCanvas = ref<HTMLCanvasElement | null>(null);
const gameState = reactive({
  active: false,
  score: 0,
  highScore: 0,
  gameOver: false,
  level: 1,
  lines: 0
});

let gameLoopId: number;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let board: number[][] = [];
let currentPiece: { shape: number[][], x: number, y: number, color: number } | null = null;
let keys: Set<string> = new Set();

// 初始化游戏板
const initBoard = () => {
  board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
};

// 创建新方块
const createPiece = () => {
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[shapeIndex],
    x: Math.floor(COLS / 2) - 1,
    y: 0,
    color: shapeIndex
  };
};

// 检查碰撞
const isValidMove = (piece: typeof currentPiece, dx: number, dy: number, rotatedShape?: number[][]): boolean => {
  if (!piece) return false;
  const shape = rotatedShape || piece.shape;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = piece.x + x + dx;
        const newY = piece.y + y + dy;
        
        if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
        if (newY >= 0 && board[newY][newX]) return false;
      }
    }
  }
  return true;
};

// 旋转方块
const rotatePiece = (piece: typeof currentPiece): number[][] | null => {
  if (!piece) return null;
  const shape = piece.shape;
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotated[x][rows - 1 - y] = shape[y][x];
    }
  }
  
  return rotated;
};

// 放置方块到游戏板
const placePiece = () => {
  if (!currentPiece) return;
  
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardY = currentPiece.y + y;
        const boardX = currentPiece.x + x;
        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece.color + 1;
        }
      }
    }
  }
};

// 清除满行
const clearLines = () => {
  let linesCleared = 0;
  
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++; // 重新检查同一行
    }
  }
  
  if (linesCleared > 0) {
    gameState.lines += linesCleared;
    const points = [0, 100, 300, 500, 800][linesCleared] || 0;
    gameState.score += points * (gameState.level + 1);
    gameState.level = Math.floor(gameState.lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (gameState.level - 1) * 100);
  }
};

// 检查游戏结束
const checkGameOver = (): boolean => {
  if (!currentPiece) return false;
  return !isValidMove(currentPiece, 0, 0);
};

// 处理输入
const handleKeyDown = (e: KeyboardEvent) => {
  if (!gameState.active) return;
  
  // 游戏相关的按键，阻止默认行为（防止页面滚动等）
  const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '];
  if (gameKeys.indexOf(e.key) !== -1) {
    e.preventDefault();
  }
  
  keys.add(e.key);
  
  if (e.key === 'ArrowLeft' && currentPiece && isValidMove(currentPiece, -1, 0)) {
    currentPiece.x--;
  } else if (e.key === 'ArrowRight' && currentPiece && isValidMove(currentPiece, 1, 0)) {
    currentPiece.x++;
  } else if (e.key === 'ArrowDown' && currentPiece && isValidMove(currentPiece, 0, 1)) {
    currentPiece.y++;
  } else if (e.key === 'ArrowUp' && currentPiece) {
    const rotated = rotatePiece(currentPiece);
    if (rotated && isValidMove(currentPiece, 0, 0, rotated)) {
      currentPiece.shape = rotated;
    }
  } else if (e.key === ' ') {
    // 空格键快速下落
    if (currentPiece) {
      while (isValidMove(currentPiece, 0, 1)) {
        currentPiece.y++;
      }
    }
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  keys.delete(e.key);
};

const handleCanvasClick = () => {
  if (gameCanvas.value) {
    gameCanvas.value.focus();
  }
};

// 绘制函数
const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, colorIndex: number) => {
  const color = COLORS[colorIndex];
  const px = BOARD_OFFSET_X + x * BLOCK_SIZE;
  const py = BOARD_OFFSET_Y + y * BLOCK_SIZE;
  
  // 绘制方块主体
  ctx.fillStyle = color;
  ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  
  // 绘制边框
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  
  // 高光效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(px, py, BLOCK_SIZE, 3);
  ctx.fillRect(px, py, 3, BLOCK_SIZE);
};

const drawBoard = (ctx: CanvasRenderingContext2D) => {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        drawBlock(ctx, x, y, board[y][x] - 1);
      }
    }
  }
};

const drawPiece = (ctx: CanvasRenderingContext2D) => {
  if (!currentPiece) return;
  
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color);
      }
    }
  }
};

const gameLoop = (ctx: CanvasRenderingContext2D, time: number) => {
  if (!gameState.active) return;
  
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  
  // 方块下落
  if (dropCounter > dropInterval) {
    dropCounter = 0;
    
    if (currentPiece && isValidMove(currentPiece, 0, 1)) {
      currentPiece.y++;
    } else {
      if (currentPiece) {
        placePiece();
        clearLines();
        currentPiece = createPiece();
        
        if (checkGameOver()) {
          gameState.active = false;
          gameState.gameOver = true;
          gameState.highScore = Math.max(gameState.score, gameState.highScore);
          cancelAnimationFrame(gameLoopId);
          return;
        }
      }
    }
  }
  
  // 绘制
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制背景
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制游戏板边框
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.strokeRect(BOARD_OFFSET_X - 1, BOARD_OFFSET_Y - 1, BOARD_WIDTH + 2, BOARD_HEIGHT + 2);
  
  // 绘制网格线
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(BOARD_OFFSET_X + x * BLOCK_SIZE, BOARD_OFFSET_Y);
    ctx.lineTo(BOARD_OFFSET_X + x * BLOCK_SIZE, BOARD_OFFSET_Y + BOARD_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(BOARD_OFFSET_X, BOARD_OFFSET_Y + y * BLOCK_SIZE);
    ctx.lineTo(BOARD_OFFSET_X + BOARD_WIDTH, BOARD_OFFSET_Y + y * BLOCK_SIZE);
    ctx.stroke();
  }
  
  drawBoard(ctx);
  drawPiece(ctx);
  
  // 绘制分数
  ctx.fillStyle = 'white';
  ctx.font = "14px monospace";
  ctx.fillText(`Score: ${gameState.score}`, 10, 20);
  ctx.fillText(`Level: ${gameState.level}`, 10, 40);
  ctx.fillText(`Lines: ${gameState.lines}`, 10, 60);
  
  gameLoopId = requestAnimationFrame((t) => gameLoop(ctx, t));
};

const startGame = () => {
  if (gameState.active) return;
  gameState.active = true;
  gameState.score = 0;
  gameState.gameOver = false;
  gameState.level = 1;
  gameState.lines = 0;
  dropCounter = 0;
  dropInterval = 1000;
  keys.clear();
  initBoard();
  currentPiece = createPiece();
  lastTime = performance.now();

  if (gameCanvas.value) {
    const ctx = gameCanvas.value.getContext('2d');
    if (ctx) {
      gameLoopId = requestAnimationFrame((t) => gameLoop(ctx, t));
    }
  }
};

const resetGame = () => {
  gameState.active = false;
  cancelAnimationFrame(gameLoopId);
  startGame();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  initBoard();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  cancelAnimationFrame(gameLoopId);
});
</script>

<template>
  <div class="relative bg-gray-900 border-4 border-indigo-500 rounded-xl overflow-hidden shadow-2xl" style="width: 300px; height: 400px;">
    <canvas ref="gameCanvas" width="300" height="400" tabindex="0" class="outline-none" @click="handleCanvasClick"></canvas>
    <div v-if="gameState.gameOver" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10">
      <h4 class="text-2xl font-bold mb-2">Game Over</h4>
      <p class="text-lg mb-4">Score: <span>{{ gameState.score }}</span></p>
      <button @click="resetGame" class="bg-white text-indigo-900 px-4 py-1 rounded font-bold">Try Again</button>
    </div>
    <div v-if="!gameState.active && !gameState.gameOver" class="absolute inset-0 flex flex-col items-center justify-center z-10">
        <button @click="startGame" class="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition mb-2">开始游戏</button>
        <p class="text-white text-xs text-center px-4 mt-2">
          方向键移动/旋转<br/>空格快速下落
        </p>
    </div>
    <div class="absolute top-2 right-2 text-white text-xs bg-indigo-800 px-2 py-1 rounded z-10">
        High Score: {{ gameState.highScore }}
    </div>
  </div>
</template>