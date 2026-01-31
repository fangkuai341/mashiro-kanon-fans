<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';

const footerRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (footerRef.value) {
    gsap.from(footerRef.value.children, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.2,
      ease: 'power2.out'
    });
  }
});
</script>

<template>
  <footer 
    ref="footerRef"
    class="mt-12 pt-8 border-t border-pink-100/50 text-center pb-8 relative"
  >
    <!-- 背景装饰 -->
    <div class="absolute inset-0 bg-gradient-to-t from-pink-50/30 to-transparent pointer-events-none"></div>
    
    <div class="relative z-10 mb-4">
      <h4 class="font-bold text-gray-700 mb-2 gradient-text">鸣谢 (Credits)</h4>
      <p class="text-sm text-gray-600 mt-2">网站制作: 雪梨，claude</p>
    </div>
    <div class="relative z-10 text-xs text-gray-500 leading-relaxed">
      本站为非官方 (Unofficial) 粉丝站点。<br>
      所有素材版权归真白花音及相关权利人所有。
    </div>
  </footer>
</template>

<style scoped>
footer {
  background: linear-gradient(to top, rgba(255, 240, 245, 0.5) 0%, transparent 100%);
}
</style>