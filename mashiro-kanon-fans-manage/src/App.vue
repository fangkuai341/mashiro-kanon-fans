<template>
  <div class="layout-root">
    <a-layout class="layout" has-sider>
      <a-layout-sider
        class="sider"
        breakpoint="lg"
        collapsible
        v-model:collapsed="collapsed"
      >
        <div class="logo">Mashiro 管理后台</div>
        <a-menu
          theme="dark"
          mode="inline"
          :selected-keys="[selectedKey]"
          @click="onMenuClick"
        >
          <a-menu-item key="dashboard">
            <span>仪表盘</span>
          </a-menu-item>
          <a-menu-item key="news">
            <span>动态</span>
          </a-menu-item>
          <a-menu-item key="quotes">
            <span>语录</span>
          </a-menu-item>
          <a-menu-item key="timeline">
            <span>时间轴</span>
          </a-menu-item>
          <a-menu-item key="songs">
            <span>音乐</span>
          </a-menu-item>
          <a-menu-item key="fanarts">
            <span>同人图</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout class="main">
        <a-layout-header class="header">
          <div class="header-title">Mashiro Kanon Fans 管理系统</div>
        </a-layout-header>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const collapsed = ref(false)
const route = useRoute()
const router = useRouter()

const selectedKey = computed(() => (route.name as string) || 'dashboard')

const onMenuClick = (info: { key: string }) => {
  if (info.key === selectedKey.value) return
  router.push({ name: info.key })
}

watch(
  () => route.name,
  (name) => {
    if (!name) {
      router.replace({ name: 'dashboard' })
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.layout-root {
  height: 100vh;
}

.layout {
  min-height: 100vh;
}

.sider {
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
}

.logo {
  height: 64px;
  margin: 16px;
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.main {
  margin-left: 200px;
  transition: margin-left 0.2s;
}

.header {
  background: #fff;
  padding-inline: 16px;
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.content {
  margin: 16px;
  padding: 16px;
  background: #fff;
  min-height: calc(100vh - 112px);
  overflow: auto;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sider {
    position: relative;
  }

  .main {
    margin-left: 0;
  }

  .content {
    margin: 8px;
    padding: 12px;
    min-height: auto;
  }
}
</style>