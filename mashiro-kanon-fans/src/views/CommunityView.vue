<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import MiniGame from '../components/MiniGame.vue';
import PuzzleGame from '../components/PuzzleGame.vue';
import { uploadImageApi } from '../api';

// 上传状态
const uploading = ref(false);
const uploadedImages = ref<Array<{ url: string; originalname: string }>>([]);

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) {
    return;
  }

  // 验证文件类型
  const allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.indexOf(file.type) === -1) {
    message.error('只支持上传图片文件 (jpeg, jpg, png, gif, webp)');
    target.value = '';
    return;
  }

  // 验证文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    message.error('图片大小不能超过 5MB');
    target.value = '';
    return;
  }

  // 开始上传
  uploading.value = true;
  try {
    const response = await uploadImageApi(file);
    if (response.success) {
      // 构建完整的图片URL
      const fullUrl = `http://localhost:3000${response.url}`;
      uploadedImages.value.unshift({
        url: fullUrl,
        originalname: response.originalname
      });
      message.success('图片上传成功！');
    } else {
      message.error('上传失败，请重试');
    }
  } catch (error: any) {
    console.error('上传错误:', error);
    const errorMsg = error?.response?.data?.error || error?.message || '上传失败，请重试';
    message.error(errorMsg);
  } finally {
    uploading.value = false;
    target.value = ''; // 清空文件选择，允许重复选择同一文件
  }
};
</script>

<template>
  <div class="fade-in space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2 text-pink-500">花音的后花园 🎠</h2>
      <p class="text-sm text-gray-500">同人创作展示与休闲小游戏。</p>
    </div>

    <!-- 游戏区域 -->
    <div class="bg-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
      <div class="text-center mb-6">
        <h3 class="text-3xl font-bold text-yellow-300 mb-2">🎮 休闲小游戏</h3>
        <p class="text-indigo-200">选择你喜欢的游戏开始挑战吧！</p>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-1 gap-6 lg:gap-8">
        <!-- 俄罗斯方块游戏 -->
        <div class="bg-indigo-800/50 rounded-xl p-4 flex flex-col items-center gap-4 hover:bg-indigo-800/70 transition">
          <div class="text-center">
            <h4 class="text-xl font-bold text-yellow-300 mb-1">🎮 俄罗斯方块</h4>
            <p class="text-sm text-indigo-200">经典消除游戏，消除行数获得高分！</p>
          </div>
          <MiniGame />
        </div>
        
        <!-- 拼图游戏 -->
        <div class="bg-indigo-800/50 rounded-xl p-4 flex flex-col items-center gap-4 hover:bg-indigo-800/70 transition">
          <div class="text-center">
            <h4 class="text-xl font-bold text-yellow-300 mb-1">🧩 白菜拼图</h4>
            <p class="text-sm text-indigo-200">3x3九宫格拼图，移动拼图块恢复正确顺序！</p>
          </div>
          <PuzzleGame />
        </div>
      </div>
    </div>

    <!-- Art Grid -->
    <div>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-700 border-l-4 border-pink-400 pl-3">精选同人绘</h3>
            <label class="relative inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg cursor-pointer hover:bg-pink-600 transition-colors">
                <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    @change="handleFileChange" 
                    class="hidden"
                    :disabled="uploading"
                />
                <span v-if="!uploading">📤 上传图片</span>
                <span v-else class="flex items-center gap-2">
                    <span class="animate-spin">⏳</span> 上传中...
                </span>
            </label>
        </div>
        
        <!-- 上传的图片展示 -->
        <div v-if="uploadedImages.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div 
                v-for="(img, idx) in uploadedImages" 
                :key="idx"
                class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition hover:-translate-y-1 hover:shadow-md group relative"
            >
                <div class="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                        :src="img.url" 
                        :alt="img.originalname"
                        class="w-full h-full object-cover"
                        @error="(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect fill=\'%23ddd\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\'%3E加载失败%3C/text%3E%3C/svg%3E' }"
                    />
                </div>
                <div class="p-2 bg-white">
                    <p class="text-xs text-gray-500 truncate" :title="img.originalname">{{ img.originalname }}</p>
                </div>
            </div>
        </div>

        <!-- 默认占位图 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
                v-for="(icon, idx) in ['🎨', '✨', '🍰', '👗']" 
                :key="idx"
                class="bg-gray-50 rounded-lg shadow-sm p-2 pb-4 aspect-[3/4] flex flex-col items-center justify-center border border-gray-200 transition hover:-translate-y-1"
            >
                <span class="text-4xl">{{ icon }}</span>
                <span class="text-xs mt-2 text-gray-400">By @FanArtist</span>
            </div>
        </div>
    </div>
  </div>
</template>