<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { createFeedbackApi } from '../api';
import type { FeedbackType } from '../type';

const feedbackType = ref<FeedbackType>('bug');
const content = ref('');
const submitting = ref(false);

const feedbackTypes: { value: FeedbackType; label: string; icon: string; color: string }[] = [
  { value: 'bug', label: 'Bug 反馈', icon: 'mdi:bug', color: 'text-red-500' },
  { value: '需求', label: '功能需求', icon: 'mdi:lightbulb-on', color: 'text-yellow-500' },
  { value: '其他', label: '其他建议', icon: 'mdi:comment-text', color: 'text-blue-500' }
];

const handleSubmit = async () => {
  if (!content.value.trim()) {
    message.warning('请输入反馈内容');
    return;
  }

  if (content.value.trim().length < 5) {
    message.warning('反馈内容至少需要5个字符');
    return;
  }

  try {
    submitting.value = true;
    await createFeedbackApi({
      type: feedbackType.value,
      content: content.value.trim()
    });
    message.success('反馈提交成功，感谢您的反馈！');
    content.value = '';
    feedbackType.value = 'bug';
  } catch (error: any) {
    message.error(error?.error || '提交失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="feedback-view min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- 标题区域 -->
      <div class="text-center mb-8">
        
        <h1 class="text-4xl font-bold gradient-text mb-2">意见反馈</h1>
      
      </div>

      <!-- 反馈表单卡片 -->
      <div class="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-pink-100">
        <!-- 反馈类型选择 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <Icon icon="mdi:tag" class="inline mr-2" />
            <h2>反馈类型</h2> 
          </label>
          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="type in feedbackTypes"
              :key="type.value"
              @click="feedbackType = type.value"
              :class="[
                'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300',
                feedbackType === type.value
                  ? 'border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md scale-105'
                  : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/50'
              ]"
            >
              <Icon :icon="type.icon" :class="['text-3xl mb-2', type.color]" />
              <span class="text-sm font-medium text-gray-700">{{ type.label }}</span>
            </button>
          </div>
        </div>

        <!-- 反馈内容输入 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            <Icon icon="mdi:text-box" class="inline mr-2" />
            反馈内容
          </label>
          <textarea
            v-model="content"
            placeholder="请详细描述您的问题或建议..."
            rows="8"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-300 resize-none"
          ></textarea>
          <p class="mt-2 text-xs text-gray-500">
            已输入 {{ content.length }} 个字符（至少5个字符）
          </p>
        </div>

        <!-- 提交按钮 -->
        <button
          @click="handleSubmit"
          :disabled="submitting || !content.trim() || content.trim().length < 5"
          class="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          <Icon
            v-if="submitting"
            icon="mdi:loading"
            class="animate-spin text-xl"
          />
          <Icon
            v-else
            icon="mdi:send"
            class="text-xl"
          />
          <span>{{ submitting ? '提交中...' : '提交反馈' }}</span>
        </button>

        <!-- 提示信息 -->
        <div class="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div class="flex items-start gap-3">
            <Icon icon="mdi:information" class="text-blue-500 text-xl mt-0.5 flex-shrink-0" />
            <div class="text-sm text-blue-700">
              <p class="font-medium mb-1">反馈须知：</p>
              <ul class="list-disc list-inside space-y-1 text-blue-600">
                <li>Bug 反馈请尽量提供复现步骤</li>
                <li>功能需求请详细描述使用场景</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
