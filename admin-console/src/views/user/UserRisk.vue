<template>
  <div class="user-risk-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card high-risk" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.highRisk }}</div>
              <div class="stat-label">高风险用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card medium-risk" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.mediumRisk }}</div>
              <div class="stat-label">中风险用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card low-risk" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.lowRisk }}</div>
              <div class="stat-label">低风险用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card total" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总风险用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户信息">
          <el-input
            v-model="searchForm.keyword"
            placeholder="手机号/用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select
            v-model="searchForm.riskLevel"
            placeholder="请选择风险等级"
            clearable
            style="width: 150px"
          >
            <el-option label="高风险" value="high" />
            <el-option label="中风险" value="medium" />
            <el-option label="低风险" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险类型">
          <el-select
            v-model="searchForm.riskType"
            placeholder="请选择风险类型"
            clearable
            style="width: 150px"
          >
            <el-option label="登录异常" value="login" />
            <el-option label="行为异常" value="behavior" />
            <el-option label="支付异常" value="payment" />
            <el-option label="信用异常" value="credit" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 风险用户列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="riskList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.avatarUrl" :size="40">
                {{ row.username.charAt(0) }}
              </el-avatar>
              <div class="user-detail">
                <div>{{ row.username }}</div>
                <div class="phone">{{ row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getRiskLevelType(row.riskLevel)">
              {{ getRiskLevelLabel(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险类型" width="120">
          <template #default="{ row }">
            <el-tag type="info">
              {{ getRiskTypeLabel(row.riskType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="riskScore" label="风险评分" width="100">
          <template #default="{ row }">
            <span :class="getRiskScoreClass(row.riskScore)">
              {{ row.riskScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="riskReason" label="风险原因" show-overflow-tooltip />
        <el-table-column prop="detectedAt" label="检测时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.detectedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              size="small"
              @click="handleProcess(row)"
            >
              处理
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleAddBlacklist(row)"
            >
              加入黑名单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 处理风险对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理风险用户"
      width="600px"
    >
      <el-form
        ref="processFormRef"
        :model="processForm"
        :rules="processFormRules"
        label-width="100px"
      >
        <el-form-item label="用户信息">
          <div>{{ currentRisk?.username }} ({{ currentRisk?.phone }})</div>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-tag :type="getRiskLevelType(currentRisk?.riskLevel)">
            {{ getRiskLevelLabel(currentRisk?.riskLevel) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="处理方式" prop="action">
          <el-radio-group v-model="processForm.action">
            <el-radio label="ignore">忽略</el-radio>
            <el-radio label="warning">警告</el-radio>
            <el-radio label="restrict">限制</el-radio>
            <el-radio label="blacklist">加入黑名单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明" prop="remark">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProcessSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  WarningFilled,
  Warning,
  InfoFilled,
  User,
} from '@element-plus/icons-vue'

// 风险用户数据类型
interface RiskUser {
  id: number
  username: string
  phone: string
  avatarUrl: string
  riskLevel: 'high' | 'medium' | 'low'
  riskType: 'login' | 'behavior' | 'payment' | 'credit'
  riskScore: number
  riskReason: string
  detectedAt: string
  status: 'pending' | 'processed' | 'ignored'
}

// 统计数据
const stats = reactive({
  highRisk: 5,
  mediumRisk: 12,
  lowRisk: 8,
  total: 25,
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  riskLevel: '',
  riskType: '',
})

// 风险用户列表
const riskList = ref<RiskUser[]>([
  {
    id: 1,
    username: '张三',
    phone: '13800138000',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    riskLevel: 'high',
    riskType: 'login',
    riskScore: 85,
    riskReason: '短时间内多次登录失败，疑似账号被盗',
    detectedAt: '2024-11-29T10:30:00.000Z',
    status: 'pending',
  },
  {
    id: 2,
    username: '李四',
    phone: '13800138001',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    riskLevel: 'medium',
    riskType: 'behavior',
    riskScore: 65,
    riskReason: '异常浏览行为，频繁切换账号',
    detectedAt: '2024-11-29T09:15:00.000Z',
    status: 'pending',
  },
  {
    id: 3,
    username: '王五',
    phone: '13800138002',
    avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    riskLevel: 'low',
    riskType: 'payment',
    riskScore: 45,
    riskReason: '支付金额异常，超出正常范围',
    detectedAt: '2024-11-29T08:00:00.000Z',
    status: 'processed',
  },
])

const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3,
})

// 处理对话框
const processDialogVisible = ref(false)
const currentRisk = ref<RiskUser | null>(null)
const processFormRef = ref<FormInstance>()

const processForm = reactive({
  action: 'warning',
  remark: '',
})

const processFormRules: FormRules = {
  action: [
    { required: true, message: '请选择处理方式', trigger: 'change' },
  ],
  remark: [
    { required: true, message: '请输入处理说明', trigger: 'blur' },
  ],
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  // TODO: 调用搜索API
  ElMessage.success('搜索功能开发中...')
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.riskLevel = ''
  searchForm.riskType = ''
  pagination.page = 1
  // TODO: 重新加载数据
}

// 查看详情
const handleView = (row: RiskUser) => {
  ElMessage.info('查看风险用户详情功能开发中...')
  // TODO: 跳转到详情页面或打开详情对话框
}

// 处理风险
const handleProcess = (row: RiskUser) => {
  currentRisk.value = row
  processForm.action = 'warning'
  processForm.remark = ''
  processDialogVisible.value = true
}

// 提交处理
const handleProcessSubmit = async () => {
  if (!processFormRef.value) return

  await processFormRef.value.validate(async (valid) => {
    if (!valid) return

    ElMessage.success('处理成功')
    processDialogVisible.value = false
    // TODO: 调用处理API
    if (currentRisk.value) {
      currentRisk.value.status = 'processed'
    }
  })
}

// 加入黑名单
const handleAddBlacklist = async (row: RiskUser) => {
  try {
    await ElMessageBox.confirm(
      `确定要将用户 "${row.username}" 加入黑名单吗？`,
      '加入黑名单确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    ElMessage.success('已加入黑名单')
    // TODO: 调用加入黑名单API
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  // TODO: 重新加载数据
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  // TODO: 重新加载数据
}

// 获取风险等级类型
const getRiskLevelType = (level?: string) => {
  const typeMap: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return typeMap[level || ''] || 'info'
}

// 获取风险等级标签
const getRiskLevelLabel = (level?: string) => {
  const labelMap: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  }
  return labelMap[level || ''] || level
}

// 获取风险类型标签
const getRiskTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    login: '登录异常',
    behavior: '行为异常',
    payment: '支付异常',
    credit: '信用异常',
  }
  return labelMap[type] || type
}

// 获取风险评分样式
const getRiskScoreClass = (score: number) => {
  if (score >= 80) return 'risk-score-high'
  if (score >= 60) return 'risk-score-medium'
  return 'risk-score-low'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    processed: 'success',
    ignored: 'info',
  }
  return typeMap[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待处理',
    processed: '已处理',
    ignored: '已忽略',
  }
  return labelMap[status] || status
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 页面加载
onMounted(() => {
  // TODO: 加载风险用户列表
})
</script>

<style scoped lang="scss">
.user-risk-container {
  padding: 20px;

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }

      &.high-risk {
        .stat-icon {
          background: #fef0f0;
          color: #f56c6c;
        }

        .stat-value {
          color: #f56c6c;
        }
      }

      &.medium-risk {
        .stat-icon {
          background: #fdf6ec;
          color: #e6a23c;
        }

        .stat-value {
          color: #e6a23c;
        }
      }

      &.low-risk {
        .stat-icon {
          background: #f4f4f5;
          color: #909399;
        }

        .stat-value {
          color: #909399;
        }
      }

      &.total {
        .stat-icon {
          background: #ecf5ff;
          color: #409eff;
        }

        .stat-value {
          color: #409eff;
        }
      }
    }
  }

  .search-card,
  .table-card {
    margin-bottom: 20px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-detail {
      .phone {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }

  .risk-score-high {
    color: #f56c6c;
    font-weight: 600;
  }

  .risk-score-medium {
    color: #e6a23c;
    font-weight: 600;
  }

  .risk-score-low {
    color: #909399;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
