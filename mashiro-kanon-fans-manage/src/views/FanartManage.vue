<template>
  <div>
    <a-page-header title="同人图管理" />
    <a-space class="toolbar" wrap>
      <a-button type="primary" @click="openCreate">新增同人图</a-button>
      <a-button @click="fetchData" :loading="loading">刷新</a-button>
    </a-space>
    <a-table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      row-key="id"
      size="small"
      :pagination="{ pageSize: 8 }"
      :scroll="{ x: 900 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'preview'">
          <a-image
            v-if="record.img_url"
            :width="80"
            :src="imageFullUrl(record.img_url)"
            :alt="record.title"
          />
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-popconfirm
            title="确定删除该同人图？"
            @confirm="() => handleDelete(record.id)"
          >
            <a-button type="link" danger size="small">删除</a-button>
          </a-popconfirm>
        </template>
        <template v-else-if="column.dataIndex === 'source_link'">
          <a :href="record.source_link" target="_blank" v-if="record.source_link">来源链接</a>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      title="新增同人图"
      @ok="handleSubmit"
      :confirm-loading="submitLoading"
      destroy-on-close
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="作者">
          <a-input v-model:value="formState.author" />
        </a-form-item>
        <a-form-item label="标题">
          <a-input v-model:value="formState.title" />
        </a-form-item>
        <a-form-item label="图片" required>
          <a-upload
            name="image"
            :action="uploadUrl"
            list-type="picture-card"
            :max-count="1"
            :show-upload-list="true"
            :headers="{}"
            :before-upload="beforeUpload"
            @change="handleUploadChange"
          >
            <div v-if="!uploading && !formState.img_url">
              <plus-outlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="来源链接">
          <a-input v-model:value="formState.source_link" placeholder="作者主页 / 原帖链接" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  type FanartItem,
  getFanarts,
  createFanart,
  deleteFanart,
  getUploadUrl,
  getImageFullUrl,
} from '../api/fanart'

const loading = ref(false)
const submitLoading = ref(false)
const list = ref<FanartItem[]>([])
const modalOpen = ref(false)
const uploading = ref(false)

const formState = reactive<FanartItem>({
  author: '',
  title: '',
  img_url: '',
  source_link: '',
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '预览', key: 'preview', width: 120 },
  { title: '标题', dataIndex: 'title', key: 'title', width: 160 },
  { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
  { title: '来源', dataIndex: 'source_link', key: 'source_link', width: 160 },
  { title: '操作', key: 'actions', width: 120, fixed: 'right' as const },
]

const uploadUrl = getUploadUrl()

const imageFullUrl = getImageFullUrl

const resetForm = () => {
  formState.author = ''
  formState.title = ''
  formState.img_url = ''
  formState.source_link = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    list.value = await getFanarts()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  resetForm()
  modalOpen.value = true
}

const beforeUpload = () => {
  uploading.value = true
  return true
}

const handleUploadChange = (info: UploadChangeParam<UploadFile>) => {
  if (info.file.status === 'done') {
    uploading.value = false
    const res: any = info.file.response
    if (res && res.success && res.url) {
      formState.img_url = res.url
    }
  } else if (info.file.status === 'error' || info.file.status === 'removed') {
    uploading.value = false
  }
}

const handleSubmit = async () => {
  if (!formState.img_url) return
  submitLoading.value = true
  try {
    await createFanart({
      author: formState.author,
      title: formState.title,
      img_url: formState.img_url,
      source_link: formState.source_link,
    })
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
    await deleteFanart(id)
    await fetchData()
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

