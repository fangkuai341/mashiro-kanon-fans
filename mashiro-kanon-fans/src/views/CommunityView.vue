<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { gsap } from 'gsap';
import { Icon } from '@iconify/vue';
import { message } from 'ant-design-vue';
import MiniGame from '../components/MiniGame.vue';
import PuzzleGame from '../components/PuzzleGame.vue';
import { uploadImageApi } from '../api';

onMounted(async () => {
  // 等待DOM渲染完成
  await nextTick();
  
  const communityHeader = document.querySelector('.community-header');
  if (communityHeader) {
    gsap.fromTo(communityHeader,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }
  
  const gameSection = document.querySelector('.game-section');
  if (gameSection) {
    gsap.fromTo(gameSection,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.7, delay: 0.2, ease: 'back.out(1.7)' }
    );
  }
  
  const artGridItems = document.querySelectorAll('.art-grid-item');
  if (artGridItems.length > 0) {
    gsap.fromTo(artGridItems,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1, 
        delay: 0.4, 
        ease: 'power2.out',
        onComplete: () => {
          artGridItems.forEach(item => {
            gsap.set(item, { clearProps: 'all' });
          });
        }
      }
    );
  }
});

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
    <div class="community-header text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-2 gradient-text flex items-center justify-center gap-2">
        花音的后花园
        <Icon icon="noto:carousel-horse" class="text-2xl animate-bounce" style="animation-duration: 2s;" />
      </h2>
      <p class="text-sm text-gray-600">同人创作展示与休闲小游戏。</p>
    </div>

    <!-- 游戏区域 -->
    <div class="game-section bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden card-hover">
      <!-- 背景装饰 -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl"></div>
      
      <div class="relative z-10 text-center mb-6">
        <h3 class="text-3xl font-bold text-pink-50 mb-2 flex items-center justify-center gap-2">
          <Icon icon="noto:video-game" class="text-3xl animate-pulse" style="animation-duration: 2s;" />
          休闲小游戏
        </h3>
        <p class="text-pink-100">选择你喜欢的游戏开始挑战吧！</p>
      </div>
      
      <div class="relative z-10 grid grid-cols-2 md:grid-cols-1 gap-6 lg:gap-8">
        <!-- 俄罗斯方块游戏 -->
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center gap-4 hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg">
          <div class="text-center">
            <h4 class="text-xl font-bold text-yellow-100 mb-1 flex items-center justify-center gap-2">
              <Icon icon="noto:video-game" class="text-xl" />
              俄罗斯方块
            </h4>
            <p class="text-sm text-yellow-50/80">经典消除游戏，消除行数获得高分！</p>
          </div>
          <MiniGame />
        </div>
        
        <!-- 拼图游戏 -->
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center gap-4 hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg">
          <div class="text-center">
            <h4 class="text-xl font-bold text-pink-50 mb-1 flex items-center justify-center gap-2">
              <Icon icon="noto:puzzle-piece" class="text-xl" />
              白菜拼图
            </h4>
            <p class="text-sm text-pink-100/80">3x3九宫格拼图，移动拼图块恢复正确顺序！</p>
          </div>
          <PuzzleGame />
        </div>
      </div>
    </div>

    <!-- Art Grid -->
    <div>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold gradient-text border-l-4 border-pink-400 pl-3">精选同人绘</h3>
          
        </div>
        
        <!-- 上传的图片展示 -->
        <div v-if="uploadedImages.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div 
                v-for="(img, idx) in uploadedImages" 
                :key="idx"
                class="art-grid-item bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-orange-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group relative card-hover"
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
                v-for="(iconName, idx) in ['noto:artist-palette', 'noto:sparkles', 'noto:shortcake', 'noto:t-shirt']" 
                :key="idx"
                class="art-grid-item bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-2 pb-4 aspect-[3/4] flex flex-col items-center justify-center border border-pink-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl card-hover"
            >
                <Icon :icon="iconName" class="text-5xl" />
                <span class="text-xs mt-2 text-gray-400">By @FanArtist</span>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.upload-btn {
  background: linear-gradient(to right, #FFB6C1, #FFC0CB);
  color: #8B4A6B;
}

.upload-btn:hover {
  background: linear-gradient(to right, #FFC0CB, #FFB3BA);
}

.art-grid-item {
  opacity: 1;
  transform: translate(0, 0);
}
</style>