<template>
  <div class="withdrawal-audit-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">提现审核</span>
      </template>
    </el-page-header>

    <el-card class="main-card">
      <el-tabs v-model="activeTab">
        <!-- 提现申请列表 -->
        <el-tab-pane label="提现申请" name="requests">
          <el-form :inline="true" :model="queryForm" class="search-form">
            <el-form-item label="用户">
              <el-input
                v-model="queryForm.userId"
                placeholder="请输入用户ID或姓名"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="queryForm.status" placeholder="请选择" clearable>
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="处理中" value="processing" />
                <el-option label="已完成" value="completed" />
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

          <el-table :data="requestList" v-loading="loading" border stripe>
            <el-table-column prop="userName" label="用户" width="120" />
            <el-table-column prop="amount" label="提现金额" width="120" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="fee" label="手续费" width="100" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.fee) }}</template>
            </el-table-column>
            <el-table-column prop="actualAmount" label="实际到账" width="120" align="right">
              <template #default="{ row }">
                <span style="color: #67c23a; font-weight: bold"
                  >¥{{ formatNumber(row.actualAmount) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="bankName" label="银行" width="150" />
            <el-table-column prop="bankAccount" label="账号" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="申请时间" width="160" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  link
                  type="success"
                  size="small"
                  @click="handleApprove(row)"
                >
                  通过
                </el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  link
                  type="danger"
                  size="small"
                  @click="handleReject(row)"
                >
                  拒绝
                </el-button>
                <el-button
                  v-if="row.status === 'approved'"
                  link
                  type="primary"
                  size="small"
                  @click="handleComplete(row)"
                >
                  完成
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            class="pagination"
          />
        </el-tab-pane>

        <!-- 余额管理 -->
        <el-tab-pane label="余额管理" name="balance">
          <balance-management />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { WithdrawalRequest } from '@/types/profit'
import { WithdrawalStatus } from '@/types/profit'
import { getWithdrawalRequests, reviewWithdrawalRequest, completeWithdrawal } from '@/api/profit'
import BalanceManagement from './components/BalanceManagement.vue'

const activeTab = ref('requests')
const loading = ref(false)

const queryForm = reactive({
  userId: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const requestList = ref<WithdrawalRequest[]>([])

const fetchRequests = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (queryForm.userId) params.userId = queryForm.userId
    if (queryForm.status) params.status = queryForm.status

    const res = await getWithdrawalRequests(params)
    requestList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取提现申请失败:', error)
    ElMessage.error('获取提现申请失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRequests()
}

const handleReset = () => {
  queryForm.userId = ''
  queryForm.status = ''
  pagination.page = 1
  fetchRequests()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchRequests()
}

const handlePageChange = () => {
  fetchRequests()
}

const handleApprove = async (row: WithdrawalRequest) => {
  try {
    await ElMessageBox.confirm('确认通过该提现申请？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await reviewWithdrawalRequest(row.id, { status: WithdrawalStatus.APPROVED })
    ElMessage.success('审核通过')
    fetchRequests()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      ElMessage.error('审核失败')
    }
  }
}

const handleReject = async (row: WithdrawalRequest) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝提现', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因',
    })
    await reviewWithdrawalRequest(row.id, { status: WithdrawalStatus.REJECTED, reason })
    ElMessage.success('已拒绝')
    fetchRequests()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleComplete = async (row: WithdrawalRequest) => {
  try {
    await ElMessageBox.confirm('确认已完成打款？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await completeWithdrawal(row.id)
    ElMessage.success('已完成')
    fetchRequests()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const formatNumber = (num: number) => num.toFixed(2)

const getStatusName = (status: WithdrawalStatus) => {
  const map: Record<WithdrawalStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
  }
  return map[status] || status
}

const getStatusTag = (status: WithdrawalStatus): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<WithdrawalStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchRequests()
})
</script>

<style scoped lang="scss">
.withdrawal-audit-container {
  padding: 20px;

  }

  .main-card {
    .search-form {
      margin-bottom: 20px;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
