<template>
  <div class="risk-control-records">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="用户">
        <el-input
          v-model="queryForm.userId"
          placeholder="请输入用户ID或姓名"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="风险级别">
        <el-select v-model="queryForm.riskLevel" placeholder="请选择" clearable>
          <el-option label="低风险" value="low" />
          <el-option label="中风险" value="medium" />
          <el-option label="高风险" value="high" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择" clearable>
          <el-option label="待处理" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已忽略" value="dismissed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-table :data="recordList" v-loading="loading" border stripe>
      <el-table-column prop="orderNo" label="订单号" width="160" />
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column prop="ruleName" label="触发规则" width="150" />
      <el-table-column prop="riskLevel" label="风险级别" width="100">
        <template #default="{ row }">
          <el-tag :type="getRiskLevelTag(row.riskLevel)">{{
            getRiskLevelName(row.riskLevel)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="action" label="执行动作" width="100" />
      <el-table-column prop="reason" label="原因" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="触发时间" width="160" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            link
            type="success"
            size="small"
            @click="handleConfirm(row)"
          >
            确认
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            link
            type="info"
            size="small"
            @click="handleDismiss(row)"
          >
            忽略
          </el-button>
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { RiskControlRecord } from '@/types/profit'
import { getRiskControlRecords, handleRiskControlRecord } from '@/api/profit'

const loading = ref(false)

const queryForm = reactive({
  userId: '',
  riskLevel: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const recordList = ref<RiskControlRecord[]>([])

const fetchRecords = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (queryForm.userId) params.userId = queryForm.userId
    if (queryForm.riskLevel) params.riskLevel = queryForm.riskLevel
    if (queryForm.status) params.status = queryForm.status

    const res = await getRiskControlRecords(params)
    recordList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取风控记录失败:', error)
    ElMessage.error('获取风控记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRecords()
}

const handleReset = () => {
  queryForm.userId = ''
  queryForm.riskLevel = ''
  queryForm.status = ''
  pagination.page = 1
  fetchRecords()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchRecords()
}

const handlePageChange = () => {
  fetchRecords()
}

const handleConfirm = async (row: RiskControlRecord) => {
  try {
    await ElMessageBox.confirm('确认该风控记录为真实风险？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await handleRiskControlRecord(row.id, { status: 'confirmed' })
    ElMessage.success('已确认')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleDismiss = async (row: RiskControlRecord) => {
  try {
    const { value: note } = await ElMessageBox.prompt('请输入忽略原因（可选）', '忽略风控记录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    await handleRiskControlRecord(row.id, { status: 'dismissed', note })
    ElMessage.success('已忽略')
    fetchRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleViewDetail = (row: RiskControlRecord) => {
  ElMessage.info('查看详情功能开发中...')
}

const getRiskLevelName = (level: string) => {
  const map: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  }
  return map[level] || level
}

const getRiskLevelTag = (level: string) => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  }
  return map[level] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    confirmed: '已确认',
    dismissed: '已忽略',
  }
  return map[status] || status
}

const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'danger',
    dismissed: 'info',
  }
  return map[status] || ''
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped lang="scss">
.risk-control-records {
  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
