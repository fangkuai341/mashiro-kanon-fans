<template>
  <div>
    <a-page-header title="时间轴管理" />
    <a-space class="toolbar" wrap>
      <a-button type="primary" @click="openCreate">新增时间节点</a-button>
      <a-button @click="fetchData" :loading="loading">刷新</a-button>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      row-key="id"
      size="small"
      :pagination="{ pageSize: 10 }"
      :scroll="{ x: 800 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该时间节点？"
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
      :title="editing ? '编辑时间节点' : '新增时间节点'"
      @ok="handleSubmit"
      :confirm-loading="submitLoading"
      destroy-on-close
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="年份" required>
          <a-input-number
            v-model:value="formState.year"
            :min="2000"
            :max="2100"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="日期" required>
          <a-date-picker
            v-model:value="formState.date"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item label="事件" required>
          <a-input v-model:value="formState.text" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="formState.remark" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  type TimelineItem,
  getTimeline,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from '../api/timeline'

interface TimelineForm {
  id?: number
  year: number | null
  date: string | Dayjs | null
  text: string
  remark?: string
}

const loading = ref(false)
const submitLoading = ref(false)
const list = ref<TimelineItem[]>([])
const modalOpen = ref(false)
const editing = ref(false)

const formState = reactive<TimelineForm>({
  id: undefined,
  year: null,
  date: null,
  text: '',
  remark: '',
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '年份', dataIndex: 'year', key: 'year', width: 80 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '事件', dataIndex: 'text', key: 'text', width: 200 },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '操作', key: 'actions', width: 140, fixed: 'right' as const },
]

const resetForm = () => {
  formState.id = undefined
  formState.year = null
  formState.date = null
  formState.text = ''
  formState.remark = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    list.value = await getTimeline()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = false
  resetForm()
  modalOpen.value = true
}

const openEdit = (record: TimelineItem) => {
  editing.value = true
  formState.id = record.id
  formState.year = record.year
  formState.date = record.date
  formState.text = record.text
  formState.remark = record.remark
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (!formState.year || !formState.date || !formState.text) return
  submitLoading.value = true

  const payload = {
    year: formState.year,
    date: dayjs(formState.date).format('YYYY-MM-DD'),
    text: formState.text,
    remark: formState.remark,
  }

  try {
    if (editing.value && formState.id) {
      await updateTimeline(formState.id, payload)
    } else {
      await createTimeline(payload)
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
    await deleteTimeline(id)
    await fetchData()
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

