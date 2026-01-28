<script setup lang="ts">

import Footer from './components/Footer.vue';
import NavBar from './components/NavBar.vue';


</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NavBar  />

    <main class="max-w-6xl mx-auto px-4 py-6 flex-grow w-full">
      <!-- 使用 v-if 确保组件卸载和挂载，触发生命周期以重新渲染 Canvas 图表 -->
      <router-view />
     
    </main>

    <Footer />
  </div>
</template>