<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #ecf5ff; color: #409eff">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">总分润金额</div>
              <div class="stats-value">¥{{ formatNumber(statistics.totalProfit) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #f0f9ff; color: #67c23a">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">订单数量</div>
              <div class="stats-value">{{ statistics.orderCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #fef0f0; color: #f56c6c">
              <el-icon :size="24"><Link /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">捆绑订单数</div>
              <div class="stats-value">{{ statistics.bundledOrderCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #fdf6ec; color: #e6a23c">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">平均分润</div>
              <div class="stats-value">¥{{ formatNumber(statistics.avgProfitPerOrder) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="main-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="分润记录" name="records">
          <el-form :inline="true" :model="queryForm" class="search-form">
            <el-form-item label="业主">
              <el-input
                v-model="queryForm.ownerId"
                placeholder="请输入业主ID或姓名"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="营地">
              <el-input
                v-model="queryForm.campsiteId"
                placeholder="请输入营地ID或名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="分润状态">
              <el-select v-model="queryForm.status" placeholder="请选择" clearable>
                <el-option label="待结算" value="pending" />
                <el-option label="已计算" value="calculated" />
                <el-option label="已支付" value="paid" />
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
            <el-table-column prop="campsiteName" label="营地" width="150" />
            <el-table-column prop="ownerName" label="业主" width="120" />
            <el-table-column prop="cooperationType" label="合作类型" width="120">
              <template #default="{ row }">
                <el-tag>{{ getCooperationTypeName(row.cooperationType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderAmount" label="订单金额" width="120" align="right">
              <template #default="{ row }">¥{{ formatNumber(row.orderAmount) }}</template>
            </el-table-column>
            <el-table-column prop="profitAmount" label="分润金额" width="120" align="right">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold"
                  >¥{{ formatNumber(row.profitAmount) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="isBundled" label="捆绑销售" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.isBundled" type="success">是</el-tag>
                <el-tag v-else type="info">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="160" />
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

        <el-tab-pane label="营地配置" name="config">
          <campsite-config />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, Document, Link, TrendCharts, Search, Refresh } from '@element-plus/icons-vue'
import type { CampsiteProfitRecord, CampsiteCooperationType, ProfitStatus } from '@/types/profit'
import { getCampsiteProfitRecords, getCampsiteProfitStatistics } from '@/api/profit'
import CampsiteConfig from './components/CampsiteConfig.vue'

const activeTab = ref('records')
const loading = ref(false)

const statistics = ref({
  totalProfit: 0,
  orderCount: 0,
  bundledOrderCount: 0,
  avgProfitPerOrder: 0,
})

const queryForm = reactive({
  ownerId: '',
  campsiteId: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const recordList = ref<CampsiteProfitRecord[]>([])

const fetchStatistics = async () => {
  try {
    const res = await getCampsiteProfitStatistics({})
    statistics.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (queryForm.ownerId) params.ownerId = queryForm.ownerId
    if (queryForm.campsiteId) params.campsiteId = queryForm.campsiteId
    if (queryForm.status) params.status = queryForm.status

    const res = await getCampsiteProfitRecords(params)
    recordList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取记录列表失败:', error)
    ElMessage.error('获取记录列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchRecords()
  fetchStatistics()
}

const handleReset = () => {
  queryForm.ownerId = ''
  queryForm.campsiteId = ''
  queryForm.status = ''
  pagination.page = 1
  fetchRecords()
  fetchStatistics()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchRecords()
}

const handlePageChange = () => {
  fetchRecords()
}

const formatNumber = (num: number) => num.toFixed(2)

const getCooperationTypeName = (type: CampsiteCooperationType) => {
  const map: Record<CampsiteCooperationType, string> = {
    ground_cooperation: '地面合作',
    venue_rental: '场地租赁',
  }
  return map[type] || type
}

const getStatusName = (status: ProfitStatus) => {
  const map: Record<ProfitStatus, string> = {
    pending: '待结算',
    calculated: '已计算',
    paid: '已支付',
    frozen: '已冻结',
    cancelled: '已取消',
  }
  return map[status] || status
}

const getStatusTag = (status: ProfitStatus): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<ProfitStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'info',
    calculated: 'warning',
    paid: 'success',
    frozen: 'danger',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchStatistics()
  fetchRecords()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .page-description {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }

  .stats-row {
    margin-bottom: 20px;

    .stats-card {
      .stats-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stats-icon {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stats-info {
          flex: 1;

          .stats-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stats-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
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
