<template>
    <div class="fade-in space-y-6">
        <h2 class="text-2xl font-bold mb-2">周边商店 🛍️</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div v-for="item in ['👕', '💿', '🖼️', '🧸']" :key="item"
                 class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                <div class="h-40 bg-gray-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">{{ item }}</div>
                <div class="p-4">
                    <h3 class="font-bold text-gray-800 text-sm">官方周边商品</h3>
                    <p class="text-pink-500 font-bold mt-1">¥ 2,000</p>
                    <button class="w-full mt-3 bg-gray-800 text-white text-xs py-2 rounded hover:bg-gray-700">跳转至 BOOTH</button>
                </div>
            </div>
        </div>
    </div>
</template>