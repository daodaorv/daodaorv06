<template>
  <div class="header-container">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 折叠按钮 -->
      <el-button
        type="text"
        class="toggle-button"
        @click="$emit('toggle-sidebar')"
      >
        <el-icon :size="20">
          <Fold v-if="!collapse" />
          <Expand v-else />
        </el-icon>
      </el-button>
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索功能..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 通知中心 -->
      <el-popover
        placement="bottom-end"
        :width="360"
        trigger="click"
      >
        <template #reference>
          <div class="notification-container">
            <el-badge :value="notificationCount" :hidden="notificationCount === 0">
              <el-button type="text" class="notification-button">
                <el-icon :size="20"><Bell /></el-icon>
              </el-button>
            </el-badge>
          </div>
        </template>

        <div class="notification-panel">
          <div class="notification-header">
            <h4>通知中心</h4>
            <el-button type="text" @click="clearAllNotifications">
              清空全部
            </el-button>
          </div>
          <div class="notification-list">
            <div
              v-for="item in notifications"
              :key="item.id"
              class="notification-item"
              :class="{ 'is-read': item.read }"
              @click="handleNotificationClick(item)"
            >
              <div class="notification-icon">
                <el-icon :color="getNotificationColor(item.type)">
                  <component :is="getNotificationIcon(item.type)" />
                </el-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ item.title }}</div>
                <div class="notification-desc">{{ item.description }}</div>
                <div class="notification-time">{{ formatTime(item.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div v-if="notifications.length === 0" class="notification-empty">
            <el-empty description="暂无通知" :image-size="80" />
          </div>
        </div>
      </el-popover>

      <!-- 全屏切换 -->
      <el-tooltip content="全屏切换" placement="bottom">
        <el-button
          type="text"
          class="fullscreen-button"
          @click="toggleFullscreen"
        >
          <el-icon :size="20">
            <FullScreen v-if="!isFullscreen" />
            <Aim v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 用户信息 -->
      <el-dropdown @command="handleUserCommand">
        <div class="user-container">
          <el-avatar
            :size="36"
            :src="userInfo.avatar"
            @error="() => (userInfo.avatar = '')"
          >
            {{ userInfo.name?.charAt(0) }}
          </el-avatar>
          <span class="user-name">{{ userInfo.name }}</span>
          <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// 图标组件
import {
  Fold,
  Expand,
  Search,
  Bell,
  FullScreen,
  Aim,
  CaretBottom,
  User,
  Setting,
  SwitchButton,
  InfoFilled,
  WarningFilled,
  CircleCheckFilled,
  MessageFilled
} from '@element-plus/icons-vue'

interface Props {
  collapse: boolean
}

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description: string
  read: boolean
  createdAt: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const searchKeyword = ref('')
const isFullscreen = ref(false)
const notifications = ref<Notification[]>([])

// 用户信息
const userInfo = computed(() => authStore.user || {})

// 未读通知数量
const notificationCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

// 初始化dayjs插件
dayjs.extend(relativeTime)

// 方法
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return

  // 这里可以实现全局搜索功能
  ElMessage.info(`搜索: ${searchKeyword.value}`)
  searchKeyword.value = ''
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await authStore.logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  } catch (error) {
    // 用户取消或登出失败
  }
}

const handleNotificationClick = (notification: Notification) => {
  // 标记为已读
  notification.read = true

  // 处理通知点击逻辑
  console.log('Notification clicked:', notification)
}

const clearAllNotifications = () => {
  notifications.value = []
  ElMessage.success('通知已清空')
}

const getNotificationIcon = (type: string) => {
  const iconMap = {
    info: InfoFilled,
    success: CircleCheckFilled,
    warning: WarningFilled,
    error: MessageFilled
  }
  return iconMap[type] || InfoFilled
}

const getNotificationColor = (type: string) => {
  const colorMap = {
    info: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    error: '#F56C6C'
  }
  return colorMap[type] || '#409EFF'
}

const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

// 初始化通知数据
const initNotifications = () => {
  notifications.value = [
    {
      id: '1',
      type: 'info',
      title: '系统通知',
      description: '系统将于今晚22:00进行维护升级',
      read: false,
      createdAt: dayjs().subtract(1, 'hour').toISOString()
    },
    {
      id: '2',
      type: 'warning',
      title: '订单提醒',
      description: '您有3个待处理的订单需要确认',
      read: false,
      createdAt: dayjs().subtract(3, 'hour').toISOString()
    },
    {
      id: '3',
      type: 'success',
      title: '审批通过',
      description: '您提交的车辆上架申请已通过审批',
      read: true,
      createdAt: dayjs().subtract(1, 'day').toISOString()
    }
  ]
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  initNotifications()
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
.header-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--el-bg-color);

  .header-left {
    display: flex;
    align-items: center;

    .toggle-button {
      padding: 8px;
      margin-right: 16px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .search-container {
      width: 240px;

      .search-input {
        :deep(.el-input__wrapper) {
          background-color: var(--el-fill-color-lighter);
          border: none;
          box-shadow: none;
        }
      }
    }

    .notification-container {
      .notification-button {
        padding: 8px;
      }
    }

    .fullscreen-button {
      padding: 8px;
    }

    .user-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .user-name {
        font-size: 14px;
        color: var(--el-text-color-primary);
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dropdown-icon {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        transition: transform 0.3s;
      }
    }
  }
}

// 通知面板样式
.notification-panel {
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .notification-list {
    max-height: 360px;
    overflow-y: auto;

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--el-fill-color-lighter);
      }

      &.is-read {
        opacity: 0.6;
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .notification-desc {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 11px;
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }

  .notification-empty {
    padding: 40px 16px;
    text-align: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;

    .header-right {
      gap: 8px;

      .search-container {
        width: 180px;
      }

      .user-container {
        .user-name {
          display: none;
        }
      }
    }
  }
}
</style>