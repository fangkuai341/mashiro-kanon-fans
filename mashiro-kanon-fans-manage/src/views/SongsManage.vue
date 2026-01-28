<template>
  <div>
    <a-page-header title="音乐管理" />
    <a-space class="toolbar" wrap>
      <a-button type="primary" @click="openCreate">新增歌曲</a-button>
      <a-input-search
        v-model:value="keyword"
        placeholder="按标题 / 歌手搜索"
        style="max-width: 240px"
        @search="fetchData"
        allow-clear
      />
      <a-button @click="fetchData" :loading="loading">刷新</a-button>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      row-key="id"
      size="small"
      :pagination="{ pageSize: 10 }"
      :scroll="{ x: 900 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该歌曲？"
              @confirm="() => handleDelete(record.id)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'link'">
          <a :href="record.link" target="_blank" v-if="record.link">播放链接</a>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑歌曲' : '新增歌曲'"
      @ok="handleSubmit"
      :confirm-loading="submitLoading"
      destroy-on-close
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model:value="formState.title" />
        </a-form-item>
        <a-form-item label="歌手" required>
          <a-input v-model:value="formState.artist" />
        </a-form-item>
        <a-form-item label="最后演唱日期" required>
          <a-date-picker
            v-model:value="formState.last_song"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item label="链接">
          <a-input v-model:value="formState.link" placeholder="B站 / 音乐平台链接" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { Dayjs } from 'dayjs'
import axios from 'axios'
import dayjs from 'dayjs'

interface SongItem {
  id?: number
  title: string
  artist: string
  last_song: string
  link?: string
}

interface SongForm {
  id?: number
  title: string
  artist: string
  last_song: string | Dayjs | null
  link?: string
}

const baseURL = 'http://localhost:3000/api'

const loading = ref(false)
const submitLoading = ref(false)
const list = ref<SongItem[]>([])
const modalOpen = ref(false)
const editing = ref(false)
const keyword = ref('')

const formState = reactive<SongForm>({
  id: undefined,
  title: '',
  artist: '',
  last_song: null,
  link: '',
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '标题', dataIndex: 'title', key: 'title', width: 160 },
  { title: '歌手', dataIndex: 'artist', key: 'artist', width: 160 },
  { title: '最后演唱日期', dataIndex: 'last_song', key: 'last_song', width: 140 },
  { title: '链接', dataIndex: 'link', key: 'link', width: 160 },
  { title: '操作', key: 'actions', width: 140, fixed: 'right' as const },
]

const resetForm = () => {
  formState.id = undefined
  formState.title = ''
  formState.artist = ''
  formState.last_song = null
  formState.link = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get<SongItem[]>(`${baseURL}/songs`, {
      params: keyword.value ? { q: keyword.value } : undefined,
    })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = false
  resetForm()
  modalOpen.value = true
}

const openEdit = (record: SongItem) => {
  editing.value = true
  formState.id = record.id
  formState.title = record.title
  formState.artist = record.artist
  formState.last_song = record.last_song
  formState.link = record.link
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (!formState.title || !formState.artist || !formState.last_song) return
  submitLoading.value = true
  const payload: SongItem = {
    title: formState.title,
    artist: formState.artist,
    last_song:dayjs(formState.last_song).format('YYYY-MM-DD'),
    link: formState.link,
  }

  try {
    if (editing.value && formState.id) {
      await axios.put(`${baseURL}/songs/${formState.id}`, payload)
    } else {
      await axios.post(`${baseURL}/songs`, payload)
    }
    modalOpen.value = false
    await fetchData()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (id?: number) => {
  if (!id) return
  loading.value = true
  try {
    await axios.delete(`${baseURL}/songs/${id}`)
    await fetchData()
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

