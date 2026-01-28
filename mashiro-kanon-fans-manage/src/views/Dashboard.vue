<template>
  <div class="dashboard">
    <a-page-header title="仪表盘" sub-title="Mashiro Kanon Fans 后台概览" />
    <a-row :gutter="[16, 16]" class="mt-16">
      <a-col :xs="24" :md="12">
        <a-card title="内容管理">
          <p>左侧菜单中可以管理动态、语录、时间轴、音乐以及同人图。</p>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-card title="提示">
          <p>本后台已适配移动端，推荐在 PC 端进行主要维护。</p>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.mt-16 {
  margin-top: 16px;
}
</style>

