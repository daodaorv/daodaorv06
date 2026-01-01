<template>
  <el-dialog v-model="visible" title="导入用户" width="500px">
    <el-alert
      title="导入说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>1. 请先下载模板文件，按照模板格式填写用户信息</p>
      <p>2. 支持 Excel 文件格式（.xlsx, .xls）</p>
      <p>3. 单次最多导入 1000 条数据</p>
    </el-alert>

    <el-upload
      class="upload-demo"
      drag
      :auto-upload="false"
      :on-change="handleFileChange"
      :limit="1"
      accept=".xlsx,.xls"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
    </el-upload>

    <template #footer>
      <el-button @click="$emit('download-template')">下载模板</el-button>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleUpload">
        确定导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

interface Props {
  modelValue: boolean
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'upload': [file: File]
  'download-template': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const selectedFile = ref<File | null>(null)

const handleFileChange = (file: UploadFile): void => {
  if (file.raw) {
    selectedFile.value = file.raw
  }
}

const handleUpload = (): void => {
  if (selectedFile.value) {
    emit('upload', selectedFile.value)
  }
}
</script>

<style scoped>
.el-alert p {
  margin: 4px 0;
  font-size: 13px;
}

.upload-demo {
  margin-top: 20px;
}
</style>
