<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { Icon } from '@iconify/vue';
import { getShopApi } from '../api';
import type { ShopItem } from '../type';

onMounted(async () => {
  try {
    items.value = await getShopApi();
    
    // GSAP 动画
    gsap.from('.shop-header', {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'power3.out'
    });
    
    gsap.from('.shop-item', {
      opacity: 0,
      y: 30,
      scale: 0.9,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.2,
      ease: 'back.out(1.7)'
    });
  } catch (e) {
    console.error('获取商店数据失败:', e);
  }
});

const items = ref<ShopItem[]>([]);
</script>

<template>
  <div class="fade-in space-y-6">
    <div class="shop-header">
      <h2 class="text-2xl md:text-3xl font-bold mb-2 gradient-text flex items-center gap-2">
        周边商店
        <Icon icon="noto:shopping-bags" class="text-2xl animate-pulse" style="animation-duration: 2s;" />
      </h2>
      <p class="text-sm text-gray-600 mb-4">
        当前为从官方渠道抓取的实装周边信息，点击可跳转到购买页面。
      </p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div
        v-for="item in items"
        :key="item.itemsId"
        class="shop-item bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100/50 overflow-hidden group flex flex-col card-hover"
      >
        <a
          :href="item.jumpUrl"
          target="_blank"
          rel="noreferrer noopener"
          class="h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="item.itemsImg"
            :src="item.itemsImg"
            :alt="item.name"
            referrerpolicy="no-referrer"
            class="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
          <div
            v-else
            class="h-full w-full flex items-center justify-center group-hover:scale-105 transition-transform"
          >
            <Icon icon="noto:shopping-bags" class="text-5xl" />
          </div>
        </a>
        <div class="p-4 flex-1 flex flex-col">
          <div
            class="font-bold text-gray-800 text-sm mb-2 min-h-[2rem] overflow-hidden"
            style="min-height: 2rem; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical;"
          >
            {{ item.name }}
          </div>
          <p class="text-pink-500 font-bold mt-auto text-sm">
            <span v-if="item.pricePrefix" class="text-xs mr-1">{{ item.pricePrefix }}</span>
            ¥ {{ item.price }}
          </p>
          <a
            :href="item.jumpUrl"
            target="_blank"
            rel="noreferrer noopener"
            class="shop-btn w-full mt-3 text-white text-xs py-2 rounded-lg text-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            前往购买
          </a>
        </div>
      </div>
      <div
        v-if="items.length === 0"
        class="col-span-2 md:col-span-4 text-center text-gray-400 text-sm py-10"
      >
        暂无商店数据，请稍后再试～
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-btn {
  background: linear-gradient(to right, #ff9800, #ffc107);
}

.shop-btn:hover {
  background: linear-gradient(to right, #f57c00, #ffb300);
}
</style>