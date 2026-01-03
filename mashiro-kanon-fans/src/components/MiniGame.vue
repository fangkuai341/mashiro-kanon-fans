<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue';

// 游戏逻辑完全封装在此组件内
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const gameState = reactive({
  active: false,
  score: 0,
  highScore: 0,
  gameOver: false
});

let gameLoopId: number;
let items: any[] = [];
let player = { x: 125, y: 350, w: 50, h: 50 };

const startGame = () => {
  if (gameState.active) return;
  gameState.active = true;
  gameState.score = 0;
  gameState.gameOver = false;
  items = [];

  if (gameCanvas.value) {
    const ctx = gameCanvas.value.getContext('2d');
    if (ctx) gameLoop(ctx);
  }
};

const resetGame = () => {
  gameState.active = false;
  cancelAnimationFrame(gameLoopId);
  startGame();
};

const spawnItem = (canvasWidth: number) => {
  if (Math.random() < 0.03) {
    const type = Math.random() > 0.2 ? 'note' : 'bomb';
    items.push({
      x: Math.random() * (canvasWidth - 20),
      y: -20,
      type: type,
      speed: 2 + Math.random() * 2
    });
  }
};

const gameLoop = (ctx: CanvasRenderingContext2D) => {
  if (!gameState.active) return;

  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw BG
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Player
  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.arc(player.x + player.w/2, player.y + player.h/2, 20, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.fillRect(player.x + 10, player.y + 15, 8, 8);
  ctx.fillRect(player.x + 32, player.y + 15, 8, 8);

  // Draw Items & Logic
  spawnItem(canvas.width);

  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    item.y += item.speed;

    ctx.font = "20px Arial";
    ctx.fillText(item.type === 'note' ? '🎵' : '💣', item.x, item.y);

    // Collision logic...
    if (item.y > 350 && item.y < 400 && item.x > player.x && item.x < player.x + player.w) {
      if (item.type === 'note') {
        gameState.score += 10;
        items.splice(i, 1);
      } else {
        gameState.active = false;
        gameState.gameOver = true;
        gameState.highScore = Math.max(gameState.score, gameState.highScore);
        cancelAnimationFrame(gameLoopId);
        return;
      }
    }
    if (item.y > 400) items.splice(i, 1);
  }

  // Draw Score
  ctx.fillStyle = 'white';
  ctx.font = "16px monospace";
  ctx.fillText("Score: " + gameState.score, 10, 20);

  gameLoopId = requestAnimationFrame(() => gameLoop(ctx));
};

const handleCanvasMove = (e: MouseEvent) => {
  if (!gameCanvas.value) return;
  const rect = gameCanvas.value.getBoundingClientRect();
  let newX = e.clientX - rect.left - player.w / 2;
  const canvasWidth = gameCanvas.value.width;
  if (newX < 0) newX = 0;
  if (newX > canvasWidth - player.w) newX = canvasWidth - player.w;
  player.x = newX;
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  if (!gameCanvas.value) return;
  const rect = gameCanvas.value.getBoundingClientRect();
  let newX = e.touches[0].clientX - rect.left - player.w / 2;
  const canvasWidth = gameCanvas.value.width;
  if (newX < 0) newX = 0;
  if (newX > canvasWidth - player.w) newX = canvasWidth - player.w;
  player.x = newX;
};

onUnmounted(() => cancelAnimationFrame(gameLoopId));
</script>

<template>
  <div class="relative bg-gray-900 border-4 border-indigo-500 rounded-xl overflow-hidden shadow-2xl" style="width: 300px; height: 400px;">
    <canvas ref="gameCanvas" width="300" height="400" class="cursor-pointer"
            @mousemove="handleCanvasMove"
            @touchmove="handleTouchMove"></canvas>
    <div v-if="gameState.gameOver" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
      <h4 class="text-2xl font-bold mb-2">Game Over</h4>
      <p class="text-lg mb-4">Score: <span>{{ gameState.score }}</span></p>
      <button @click="resetGame" class="bg-white text-indigo-900 px-4 py-1 rounded font-bold">Try Again</button>
    </div>
    <div v-if="!gameState.active && !gameState.gameOver" class="absolute inset-0 flex items-center justify-center">
        <button @click="startGame" class="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition">开始游戏</button>
    </div>
    <div class="absolute top-2 right-2 text-white text-xs bg-indigo-800 px-2 py-1 rounded">
        High Score: {{ gameState.highScore }}
    </div>
  </div>
</template>