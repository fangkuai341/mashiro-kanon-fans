<script setup lang="ts">
import { reactive } from 'vue';
import Footer from './components/Footer.vue';
import NavBar from './components/NavBar.vue';
import type { Database } from './types';

// --- Data Store (保持在顶层，或移至 Pinia) ---
const db = reactive<Database>({

  quotes: [
    "大家晚上好！我是清楚系(?)VTuber真白花音！",
    "虽然我也想吃薯片，但是作为偶像为了嗓子要忍耐...",
    "今天的歌声传达到大家心里了吗？",
    "诶？我才没有迷路，只是在探索新地图！"
  ],
  timeline: [
    { year: "2020", date: "09/19", event: "初次出道直播 🎤", remark: "start" },
    { year: "2021", date: "05/20", event: "YouTube 订阅突破 5 万", remark: "milestone" },
    { year: "2022", date: "12/24", event: "3D 新衣披露 & 生日 Live", remark: "major" },
    { year: "2023", date: "08/15", event: "首张原创专辑发布", remark: "release" },
    { year: "2024", date: "01/01", event: "新年和服披露", remark: "costume" }
  ],
  songs: [
    { id: 1, title: "Phony", artist: "Tsumiki", lastSung: "2024-03-15", link: "#" },
    { id: 2, title: "First Love", artist: "宇多田光", lastSung: "2024-02-14", link: "#" },
    { id: 3, title: "Betelgeuse", artist: "Yuuri", lastSung: "2024-01-20", link: "#" },
    { id: 4, title: "Idol", artist: "YOASOBI", lastSung: "2023-12-25", link: "#" },
    { id: 5, title: "可爱的话对不起", artist: "HoneyWorks", lastSung: "2024-03-01", link: "#" },
    { id: 6, title: "God knows...", artist: "凉宫春日", lastSung: "2023-11-11", link: "#" },
    { id: 7, title: "Marigold", artist: "Aimyon", lastSung: "2024-01-05", link: "#" },
    { id: 8, title: "Dry Flower", artist: "Yuuri", lastSung: "2023-10-10", link: "#" },
    { id: 9, title: "怪物", artist: "YOASOBI", lastSung: "2023-09-15", link: "#" }
  ],
  schedule: [
    { day: 1, type: "song" },
    { day: 3, type: "game" },
    { day: 5, type: "chat" },
    { day: 7, type: "collab" },
    { day: 10, type: "song" },
    { day: 12, type: "game" },
    { day: 14, type: "chat" }
  ]
});

const switchTab = (tab: string) => activeTab.value = tab;

</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NavBar  @switch="switchTab" />

    <main class="max-w-6xl mx-auto px-4 py-6 flex-grow w-full">
      <!-- 使用 v-if 确保组件卸载和挂载，触发生命周期以重新渲染 Canvas 图表 -->
      <router-view />
      <!-- <DashboardView v-if="activeTab === 'dashboard'"
                     :news="db.news"
                     :quotes="db.quotes"
                     @navigate="switchTab" />

      <ProfileView v-if="activeTab === 'profile'"
                   :timeline="db.timeline" />

      <MusicView v-if="activeTab === 'music'"
                 :songs="db.songs" />

      <LiveView v-if="activeTab === 'live'"
                :schedule="db.schedule" />

      <CommunityView v-if="activeTab === 'community'" />

      <ShopView v-if="activeTab === 'shop'" /> -->
    </main>

    <Footer />
  </div>
</template>