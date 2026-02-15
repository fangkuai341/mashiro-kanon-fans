<template>
  <div>
    <a-page-header title="动态管理" />
    <a-space class="toolbar" wrap>
      <a-button type="primary" @click="openCreate">新增动态</a-button>
      <a-button @click="fetchData" :loading="loading">刷新</a-button>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      row-key="id"
      size="small"
      :pagination="{ pageSize: 10 }"
      :scroll="{ x: 600 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该动态？"
              @confirm="() => handleDelete(record.id)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑动态' : '新增动态'"
      @ok="handleSubmit"
      :confirm-loading="submitLoading"
      destroy-on-close
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="分类" required>
          <a-input v-model:value="formState.cat" placeholder="例如：公告 / 活动" />
        </a-form-item>
        <a-form-item label="日期" required>
          <a-date-picker
            v-model:value="formState.date"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item label="内容" required>
          <a-textarea v-model:value="formState.text" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  type NewsItem,
  getNews,
  createNews,
  updateNews,
  deleteNews,
} from '../api/news'

interface NewsForm {
  id?: number
  cat: string
  date: string | Dayjs | null
  text: string
}

const loading = ref(false)
const submitLoading = ref(false)
const list = ref<NewsItem[]>([])
const modalOpen = ref(false)
const editing = ref(false)

const formState = reactive<NewsForm>({
  id: undefined,
  cat: '',
  date: null,
  text: '',
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '分类', dataIndex: 'cat', key: 'cat', width: 100 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '内容', dataIndex: 'text', key: 'text' },
  { title: '操作', key: 'actions', width: 140, fixed: 'right' as const },
]

const resetForm = () => {
  formState.id = undefined
  formState.cat = ''
  formState.date = null
  formState.text = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    list.value = await getNews()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = false
  resetForm()
  modalOpen.value = true
}

const openEdit = (record: NewsItem) => {
  editing.value = true
  formState.id = record.id
  formState.cat = record.cat
  formState.date = record.date
  formState.text = record.text
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (!formState.cat || !formState.date || !formState.text) return
  submitLoading.value = true

  const payload = {
    cat: formState.cat,
    date: dayjs(formState.date).format('YYYY-MM-DD'),
    text: formState.text,
  }

  try {
    if (editing.value && formState.id) {
      await updateNews(formState.id, payload)
    } else {
      await createNews(payload)
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
    await deleteNews(id)
    await fetchData()
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

