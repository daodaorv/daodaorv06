<template>
  <div class="page-container">
    <!-- 欢迎区域 -->
    <el-card shadow="never" class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-info">
          <h2>欢迎回来，{{ user?.username }}！</h2>
          <p class="welcome-time">{{ currentTime }}</p>
          <p class="welcome-subtitle">今天是美好的一天，让我们开始工作吧</p>
        </div>
        <div class="welcome-avatar">
          <el-avatar :size="80" :src="user?.avatar" />
        </div>
      </div>
    </el-card>

    <!-- 数据概览 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-primary">
              <el-icon :size="32">
                <Van />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.vehicleCount }}</div>
              <div class="stat-label">车辆总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-success">
              <el-icon :size="32">
                <List />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.orderCount }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-warning">
              <el-icon :size="32">
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon stat-icon-danger">
              <el-icon :size="32">
                <Money />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">¥{{ stats.revenue.toLocaleString() }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <div class="quick-actions">
        <el-button type="primary" :icon="Plus" @click="handleQuickAction('/vehicles/create')">
          添加车辆
        </el-button>
        <el-button :icon="List" @click="handleQuickAction('/orders')">
          查看订单
        </el-button>
        <el-button :icon="Ticket" @click="handleQuickAction('/coupons')">
          发放优惠券
        </el-button>
        <el-button :icon="User" @click="handleQuickAction('/users')">
          用户管理
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Plus, List, Ticket, User, Van, Money } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const currentTime = ref('')
const stats = reactive({
  vehicleCount: 48,
  orderCount: 326,
  userCount: 1234,
  revenue: 2456789
})

const user = computed(() => userStore.user)

let timer: number | null = null

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }
  currentTime.value = now.toLocaleDateString('zh-CN', options)
}

// 快捷操作
const handleQuickAction = (path: string) => {
  router.push(path)
}

onMounted(() => {
  // 初始化用户信息
  userStore.initUserInfo()

  // 更新时间
  updateTime()
  timer = window.setInterval(updateTime, 60000) // 每分钟更新一次
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.welcome-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;

  :deep(.el-card__body) {
    color: #fff;
  }

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .welcome-info {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #fff;
      }

      .welcome-time {
        font-size: 14px;
        opacity: 0.9;
        margin: 0 0 4px 0;
      }

      .welcome-subtitle {
        font-size: 14px;
        opacity: 0.8;
        margin: 0;
      }
    }
  }
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;

      &.stat-icon-primary {
        background: #ecf5ff;
        color: #409eff;
      }

      &.stat-icon-success {
        background: #f0f9ff;
        color: #67c23a;
      }

      &.stat-icon-warning {
        background: #fdf6ec;
        color: #e6a23c;
      }

      &.stat-icon-danger {
        background: #fef0f0;
        color: #f56c6c;
      }
    }

    .stat-info {
      flex: 1;

      .stat-number {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .quick-actions {
    justify-content: center;
  }
}
</style>
