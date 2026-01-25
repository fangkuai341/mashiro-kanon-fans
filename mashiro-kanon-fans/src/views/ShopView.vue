<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getShopApi } from '../api';
import type { ShopItem } from '../type';

const items = ref<ShopItem[]>([]);

onMounted(async () => {
  try {
    items.value = await getShopApi();
  } catch (e) {
    console.error('获取商店数据失败:', e);
  }
});
</script>

<template>
  <div class="fade-in space-y-6">
    <h2 class="text-2xl font-bold mb-2">周边商店 🛍️</h2>
    <p class="text-sm text-gray-500 mb-4">
      当前为从官方渠道抓取的实装周边信息，点击可跳转到购买页面。
    </p>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div
        v-for="item in items"
        :key="item.itemsId"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col"
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
            class="h-full w-full flex items-center justify-center text-4xl group-hover:scale-105 transition-transform"
          >
            🛍️
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
            class="w-full mt-3 bg-gray-800 text-white text-xs py-2 rounded text-center hover:bg-gray-700 transition-colors"
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