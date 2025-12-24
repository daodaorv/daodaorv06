<template>
  <div class="balance-management">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="用户">
        <el-input v-model="queryForm.userId" placeholder="请输入用户ID或姓名" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="最低余额">
        <el-input-number v-model="queryForm.minBalance" :min="0" :precision="2" style="width: 150px" />
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

    <el-table :data="balanceList" v-loading="loading" border stripe>
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column prop="balance" label="当前余额" width="120" align="right">
        <template #default="{ row }">
          <span style="color: #67c23a; font-weight: bold">¥{{ formatNumber(row.balance) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="frozenBalance" label="冻结余额" width="120" align="right">
        <template #default="{ row }">
          <span v-if="row.frozenBalance > 0" style="color: #f56c6c">¥{{ formatNumber(row.frozenBalance) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalIncome" label="累计收入" width="120" align="right">
        <template #default="{ row }">¥{{ formatNumber(row.totalIncome) }}</template>
      </el-table-column>
      <el-table-column prop="totalWithdrawal" label="累计提现" width="120" align="right">
        <template #default="{ row }">¥{{ formatNumber(row.totalWithdrawal) }}</template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="160" />
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
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { BalanceRecord } from '@/types/profit'
import { getBalanceRecords } from '@/api/profit'

const loading = ref(false)

const queryForm = reactive({
  userId: '',
  minBalance: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const balanceList = ref<BalanceRecord[]>([])

const fetchBalances = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (queryForm.userId) params.userId = queryForm.userId
    if (queryForm.minBalance !== undefined) params.minBalance = queryForm.minBalance

    const res = await getBalanceRecords(params)
    balanceList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取余额记录失败:', error)
    ElMessage.error('获取余额记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchBalances()
}

const handleReset = () => {
  queryForm.userId = ''
  queryForm.minBalance = undefined
  pagination.page = 1
  fetchBalances()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchBalances()
}

const handlePageChange = () => {
  fetchBalances()
}

const formatNumber = (num: number) => num.toFixed(2)

onMounted(() => {
  fetchBalances()
})
</script>

<style scoped lang="scss">
.balance-management {
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
