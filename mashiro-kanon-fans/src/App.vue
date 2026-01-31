<script setup lang="ts">
import { onMounted } from 'vue';
import { gsap } from 'gsap';
import Footer from './components/Footer.vue';
import NavBar from './components/NavBar.vue';
import ParticleBackground from './components/ParticleBackground.vue';

onMounted(() => {
  // 页面加载动画
  gsap.from('main', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  });
});
</script>

<template>
  <div class="app-container min-h-screen flex flex-col relative">
    <!-- 背景光束效果 -->
    <div class="beam-container fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="beam beam-1"></div>
      <div class="beam beam-2"></div>
      <div class="beam beam-3"></div>
    </div>
    
    <!-- 粒子背景 -->
    <ParticleBackground />
    
    <!-- 渐变背景层 -->
    <div class="gradient-overlay fixed inset-0 pointer-events-none z-0"></div>
    
    <!-- 内容层 -->
    <div class="relative z-10">
      <NavBar />
      <main class="max-w-6xl mx-auto px-4 py-6 flex-grow w-full">
        <router-view />
      </main>
      <Footer />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4e1 50%, #ffe5e5 100%);
  position: relative;
}

.beam-container {
  opacity: 0.4;
}

.beam {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 182, 193, 0.6),
    rgba(255, 192, 203, 0.6),
    rgba(255, 179, 186, 0.6),
    transparent
  );
  animation: beamMove 8s ease-in-out infinite;
  filter: blur(1px);
}

.beam-1 {
  left: 10%;
  animation-delay: 0s;
}

.beam-2 {
  left: 50%;
  animation-delay: 2.5s;
}

.beam-3 {
  left: 80%;
  animation-delay: 5s;
}

@keyframes beamMove {
  0%, 100% {
    transform: translateY(-100%) scaleY(0.5);
    opacity: 0;
  }
  50% {
    transform: translateY(0) scaleY(1);
    opacity: 0.6;
  }
}

.gradient-overlay {
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 192, 203, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 182, 193, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 179, 186, 0.1) 0%, transparent 50%);
}
</style>