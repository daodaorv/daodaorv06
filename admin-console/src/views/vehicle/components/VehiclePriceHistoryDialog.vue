<template>
  <el-dialog v-model="visible" title="价格历史" width="800px">
    <el-table v-loading="loading" :data="priceHistory" border>
      <el-table-column prop="effectiveDate" label="生效日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.effectiveDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="dailyPrice" label="日租金" width="100">
        <template #default="{ row }">
          ¥{{ row.dailyPrice }}
        </template>
      </el-table-column>
      <el-table-column prop="weeklyPrice" label="周租金" width="100">
        <template #default="{ row }">
          ¥{{ row.weeklyPrice }}
        </template>
      </el-table-column>
      <el-table-column prop="monthlyPrice" label="月租金" width="100">
        <template #default="{ row }">
          ¥{{ row.monthlyPrice }}
        </template>
      </el-table-column>
      <el-table-column prop="changeReason" label="变更原因" min-width="150" />
      <el-table-column prop="createdAt" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <div v-if="!loading && priceHistory.length === 0" class="empty-text">
      暂无价格历史记录
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  priceHistory: unknown[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 格式化日期
const formatDate = (date: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.empty-text {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}
</style>
