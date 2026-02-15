<template>
  <div>
    <a-page-header title="语录管理" />
    <a-space class="toolbar" wrap>
      <a-button type="primary" @click="openCreate">新增语录</a-button>
      <a-button @click="fetchData" :loading="loading">刷新</a-button>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      row-key="id"
      size="small"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该语录？"
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
      :title="editing ? '编辑语录' : '新增语录'"
      @ok="handleSubmit"
      :confirm-loading="submitLoading"
      destroy-on-close
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="内容" required>
          <a-textarea v-model:value="formState.text" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  type QuoteItem,
  getQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
} from '../api/quotes'

const loading = ref(false)
const submitLoading = ref(false)
const list = ref<QuoteItem[]>([])
const modalOpen = ref(false)
const editing = ref(false)

const formState = reactive<QuoteItem>({
  id: undefined,
  text: '',
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '内容', dataIndex: 'text', key: 'text' },
  { title: '操作', key: 'actions', width: 140 },
]

const resetForm = () => {
  formState.id = undefined
  formState.text = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    list.value = await getQuotes()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = false
  resetForm()
  modalOpen.value = true
}

const openEdit = (record: QuoteItem) => {
  editing.value = true
  formState.id = record.id
  formState.text = record.text
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (!formState.text) return
  submitLoading.value = true
  const payload = { text: formState.text }
  try {
    if (editing.value && formState.id) {
      await updateQuote(formState.id, payload)
    } else {
      await createQuote(payload)
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
    await deleteQuote(id)
    await fetchData()
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

