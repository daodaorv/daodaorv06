<!-- @ts-nocheck -->
<template>
  <div class="ticket-management-container">


    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="4">
        <StatsCard
          title="总工单数"
          :value="stats.totalTickets"
          icon="Tickets"
          color="#409EFF"
        />
      </el-col>
      <el-col :span="4">
        <StatsCard
          title="待处理"
          :value="stats.pendingTickets"
          icon="Clock"
          color="#E6A23C"
        />
      </el-col>
      <el-col :span="4">
        <StatsCard
          title="处理中"
          :value="stats.processingTickets"
          icon="Loading"
          color="#409EFF"
        />
      </el-col>
      <el-col :span="4">
        <StatsCard
          title="已解决"
          :value="stats.resolvedTickets"
          icon="CircleCheck"
          color="#67C23A"
        />
      </el-col>
      <el-col :span="4">
        <StatsCard
          title="平均响应"
          :value="`${stats.avgResponseTime}分钟`"
          icon="Timer"
          color="#909399"
        />
      </el-col>
      <el-col :span="4">
        <StatsCard
          title="平均满意度"
          :value="stats.avgSatisfaction.toFixed(1)"
          icon="Star"
          color="#F7BA2A"
        />
      </el-col>
    </el-row>

    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :data="ticketList"
      :columns="tableColumns"
      :loading="loading"
      :actions="tableActions"
      :pagination="pagination"
      :actions-width="200"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 工单类型 -->
      <template #type="{ row }">
        <el-tag :type="getTypeTagType(row.type)" size="small">
          {{ getTypeLabel(row.type) }}
        </el-tag>
      </template>

      <!-- 优先级 -->
      <template #priority="{ row }">
        <el-tag :type="getPriorityTagType(row.priority)" size="small">
          {{ getPriorityLabel(row.priority) }}
        </el-tag>
      </template>

      <!-- 状态 -->
      <template #status="{ row }">
        <el-tag :type="getStatusTagType(row.status)" size="small">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>

      <!-- 关联营地 -->
      <template #campsiteName="{ row }">
        <span v-if="row.type === 'campsite_inquiry' && row.campsiteName">
          {{ row.campsiteName }}
        </span>
        <span v-else style="color: #909399">-</span>
      </template>

      <!-- 客服人员 -->
      <template #assignee="{ row }">
        <span v-if="row.assigneeName">{{ row.assigneeName }}</span>
        <el-tag v-else type="info" size="small">未分配</el-tag>
      </template>

      <!-- 满意度 -->
      <template #satisfaction="{ row }">
        <el-rate
          v-if="row.satisfaction"
          :model-value="row.satisfaction"
          disabled
          size="small"
        />
        <span v-else class="no-rating">未评价</span>
      </template>
    </DataTable>

    <!-- 分配工单对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配工单"
      width="500px"
      @close="handleAssignDialogClose"
    >
      <el-form :model="assignForm" :rules="assignRules" ref="assignFormRef" label-width="100px">
        <el-form-item label="客服人员" prop="assigneeId">
          <el-select v-model="assignForm.assigneeId" placeholder="请选择客服人员" style="width: 100%">
            <el-option
              v-for="agent in availableAgents"
              :key="agent.id"
              :label="`${agent.name} (${agent.currentTickets}/${agent.maxConcurrent})`"
              :value="agent.id"
              :disabled="agent.currentTickets >= agent.maxConcurrent"
            >
              <div class="agent-option">
                <span>{{ agent.name }}</span>
                <el-tag
                  :type="getAgentStatusType(agent.status)"
                  size="small"
                  style="margin-left: 8px"
                >
                  {{ getAgentStatusLabel(agent.status) }}
                </el-tag>
                <span style="margin-left: 8px; color: #909399; font-size: 12px">
                  {{ agent.currentTickets }}/{{ agent.maxConcurrent }}
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignSubmit" :loading="assigning">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 工单详情对话框（含对话UI） -->
    <el-dialog
      v-model="detailDialogVisible"
      title="工单详情"
      width="1000px"
      class="ticket-detail-dialog"
      @close="handleDetailDialogClose"
      @open="handleDetailDialogOpen"
    >
      <div v-if="currentTicket" class="ticket-detail-container">
        <!-- 左侧：工单信息 -->
        <div class="ticket-info-panel">
          <!-- 基本信息 -->
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="工单编号">
              {{ currentTicket.ticketNo }}
            </el-descriptions-item>
            <el-descriptions-item label="工单类型">
              <el-tag :type="getTypeTagType(currentTicket.type)" size="small">
                {{ getTypeLabel(currentTicket.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityTagType(currentTicket.priority)" size="small">
                {{ getPriorityLabel(currentTicket.priority) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(currentTicket.status)" size="small">
                {{ getStatusLabel(currentTicket.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户">
              {{ currentTicket.userName }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentTicket.userPhone }}
            </el-descriptions-item>
            <el-descriptions-item label="客服人员">
              {{ currentTicket.assigneeName || '未分配' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ currentTicket.createdAt }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 工单标题 -->
          <div class="info-section">
            <h4>工单标题</h4>
            <div class="content-box">{{ currentTicket.title }}</div>
          </div>

          <!-- 问题描述 -->
          <div class="info-section">
            <h4>问题描述</h4>
            <div class="content-box">{{ currentTicket.description }}</div>
          </div>

          <!-- 标签 -->
          <div v-if="currentTicket.tags.length > 0" class="info-section">
            <h4>标签</h4>
            <el-tag
              v-for="(tag, index) in currentTicket.tags"
              :key="index"
              style="margin-right: 8px"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>

          <!-- 满意度评价 -->
          <div v-if="currentTicket.satisfaction" class="info-section">
            <h4>满意度评价</h4>
            <div class="satisfaction-box">
              <el-rate :model-value="currentTicket.satisfaction" disabled />
              <div v-if="currentTicket.satisfactionComment" class="satisfaction-comment">
                {{ currentTicket.satisfactionComment }}
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：对话区域 -->
        <div class="chat-panel">
          <div class="chat-header">
            <span class="chat-title">对话记录</span>
            <el-tag v-if="unreadCount > 0" type="danger" size="small">
              {{ unreadCount }} 条未读
            </el-tag>
          </div>

          <!-- 消息列表 -->
          <div class="chat-messages" ref="chatMessagesRef">
            <div v-if="messagesLoading" class="messages-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            <template v-else>
              <div v-if="messages.length === 0" class="no-messages">
                暂无对话记录
              </div>
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['message-item', `message-${msg.sender}`]"
              >
                <!-- 系统消息 -->
                <div v-if="msg.sender === 'system'" class="system-message">
                  <span class="system-text">{{ msg.content }}</span>
                  <span class="system-time">{{ formatMessageTime(msg.createdAt) }}</span>
                </div>

                <!-- 用户/客服消息 -->
                <template v-else>
                  <el-avatar
                    v-if="msg.sender === 'user'"
                    :src="msg.senderAvatar"
                    :size="36"
                    class="message-avatar"
                  />
                  <div class="message-content">
                    <div class="message-header">
                      <span class="sender-name">{{ msg.senderName }}</span>
                      <span class="message-time">{{ formatMessageTime(msg.createdAt) }}</span>
                    </div>
                    <div class="message-bubble">
                      <!-- 文本消息 -->
                      <div v-if="msg.type === 'text'" class="message-text">
                        <template v-for="(part, idx) in parseMessageContent(msg.content)" :key="idx">
                          <span v-if="part.type === 'text'">{{ part.value }}</span>
                          <span
                            v-else-if="part.type === 'order'"
                            class="order-link"
                            @click="handleOrderClick(part.value)"
                          >{{ part.value }}</span>
                        </template>
                      </div>
                      <!-- 图片消息 -->
                      <div v-else-if="msg.type === 'image'" class="message-image">
                        <div v-if="msg.content" class="image-caption">
                          <template v-for="(part, idx) in parseMessageContent(msg.content)" :key="idx">
                            <span v-if="part.type === 'text'">{{ part.value }}</span>
                            <span
                              v-else-if="part.type === 'order'"
                              class="order-link"
                              @click="handleOrderClick(part.value)"
                            >{{ part.value }}</span>
                          </template>
                        </div>
                        <el-image
                          v-for="(img, idx) in msg.attachments"
                          :key="idx"
                          :src="img"
                          :preview-src-list="msg.attachments"
                          fit="cover"
                          class="chat-image"
                        />
                      </div>
                      <!-- 文件消息 -->
                      <div v-else-if="msg.type === 'file'" class="message-file">
                        <el-link
                          v-for="(file, idx) in msg.attachments"
                          :key="idx"
                          :href="file"
                          target="_blank"
                          type="primary"
                        >
                          <el-icon><Document /></el-icon>
                          附件{{ idx + 1 }}
                        </el-link>
                      </div>
                      <!-- 卡片消息 -->
                      <div v-else-if="msg.type === 'card'" class="message-card" @click="handleCardClick(msg.cardType, msg.cardData)">
                        <!-- 订单卡片 -->
                        <template v-if="msg.cardType === 'order'">
                          <div class="card-header">
                            <el-icon><Tickets /></el-icon>
                            <span>订单信息</span>
                            <el-tag :type="getOrderStatusType(msg.cardData.status)" size="small">
                              {{ msg.cardData.statusText }}
                            </el-tag>
                          </div>
                          <div class="card-body order-card">
                            <el-image :src="msg.cardData.vehicleImage" fit="cover" class="card-image" />
                            <div class="card-info">
                              <div class="card-title">{{ msg.cardData.vehicleName }}</div>
                              <div class="card-desc">订单号：{{ msg.cardData.orderNo }}</div>
                              <div class="card-desc">{{ msg.cardData.startDate }} 至 {{ msg.cardData.endDate }}</div>
                              <div class="card-price">¥{{ msg.cardData.totalAmount }}</div>
                            </div>
                          </div>
                          <div class="card-footer">
                            <span>点击查看订单详情</span>
                            <el-icon><ArrowRight /></el-icon>
                          </div>
                        </template>
                        <!-- 车辆卡片 -->
                        <template v-else-if="msg.cardType === 'vehicle'">
                          <div class="card-header">
                            <el-icon><Van /></el-icon>
                            <span>车辆信息</span>
                            <el-tag :type="getVehicleStatusType(msg.cardData.status)" size="small">
                              {{ msg.cardData.statusText }}
                            </el-tag>
                          </div>
                          <div class="card-body vehicle-card">
                            <el-image :src="msg.cardData.image" fit="cover" class="card-image" />
                            <div class="card-info">
                              <div class="card-title">{{ msg.cardData.name }}</div>
                              <div class="card-desc">车牌：{{ msg.cardData.plateNumber }}</div>
                              <div class="card-desc">型号：{{ msg.cardData.modelName }}</div>
                              <div class="card-price">¥{{ msg.cardData.dailyPrice }}/天</div>
                            </div>
                          </div>
                          <div class="card-footer">
                            <span>点击查看车辆详情</span>
                            <el-icon><ArrowRight /></el-icon>
                          </div>
                        </template>
                        <!-- 营地卡片 -->
                        <template v-else-if="msg.cardType === 'campsite'">
                          <div class="card-header">
                            <el-icon><Place /></el-icon>
                            <span>营地信息</span>
                            <div class="card-rating">
                              <el-icon color="#f7ba2a"><Star /></el-icon>
                              <span>{{ msg.cardData.rating }}</span>
                            </div>
                          </div>
                          <div class="card-body campsite-card">
                            <el-image :src="msg.cardData.image" fit="cover" class="card-image" />
                            <div class="card-info">
                              <div class="card-title">{{ msg.cardData.name }}</div>
                              <div class="card-desc">{{ msg.cardData.address }}</div>
                              <div class="card-tags">
                                <el-tag v-for="(f, i) in msg.cardData.facilities.slice(0, 3)" :key="i" size="small" type="info">
                                  {{ f }}
                                </el-tag>
                              </div>
                              <div class="card-price">¥{{ msg.cardData.price }}/晚</div>
                            </div>
                          </div>
                          <div class="card-footer">
                            <span>点击查看营地详情</span>
                            <el-icon><ArrowRight /></el-icon>
                          </div>
                        </template>
                        <!-- 旅游产品卡片 -->
                        <template v-else-if="msg.cardType === 'tour'">
                          <div class="card-header">
                            <el-icon><Compass /></el-icon>
                            <span>旅游产品</span>
                          </div>
                          <div class="card-body tour-card">
                            <el-image :src="msg.cardData.image" fit="cover" class="card-image" />
                            <div class="card-info">
                              <div class="card-title">{{ msg.cardData.name }}</div>
                              <div class="card-desc">{{ msg.cardData.duration }} | {{ msg.cardData.departure }}出发</div>
                              <div class="card-tags">
                                <el-tag v-for="(h, i) in msg.cardData.highlights.slice(0, 2)" :key="i" size="small" type="success">
                                  {{ h }}
                                </el-tag>
                              </div>
                              <div class="card-price">¥{{ msg.cardData.price }}起</div>
                            </div>
                          </div>
                          <div class="card-footer">
                            <span>点击查看产品详情</span>
                            <el-icon><ArrowRight /></el-icon>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                  <el-avatar
                    v-if="msg.sender === 'agent'"
                    :src="msg.senderAvatar"
                    :size="36"
                    class="message-avatar"
                  />
                </template>
              </div>
            </template>
          </div>

          <!-- 消息输入区域 -->
          <div class="chat-input" v-if="canReply">
            <el-input
              v-model="messageInput"
              type="textarea"
              :rows="3"
              placeholder="请输入回复内容..."
              :disabled="sending"
              @keydown.enter.ctrl="handleSendMessage"
            />
            <div class="input-actions">
              <span class="input-tip">Ctrl + Enter 发送</span>
              <el-button
                type="primary"
                :loading="sending"
                :disabled="!messageInput.trim()"
                @click="handleSendMessage"
              >
                发送
              </el-button>
            </div>
          </div>
          <div v-else class="chat-input-disabled">
            <el-alert
              :title="getDisabledReplyReason()"
              type="info"
              :closable="false"
              show-icon
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentTicket && currentTicket.status === 'pending'"
          type="primary"
          @click="handleAssignFromDetail"
        >
          分配
        </el-button>
        <el-button
          v-if="currentTicket && currentTicket.status === 'processing'"
          type="success"
          @click="handleResolveFromDetail"
        >
          标记为已解决
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Document, Tickets, Van, Place, Star, Compass, ArrowRight } from '@element-plus/icons-vue'
import StatsCard from '@/components/common/StatsCard.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import {
  getTickets,
  getTicketStats,
  assignTicket,
  updateTicketStatus,
  getServiceAgents,
  getTicketMessages,
  sendTicketMessage,
  markMessagesAsRead,
  type Ticket,
  type TicketStats,
  type TicketStatus,
  type TicketType,
  type TicketPriority,
  type ServiceAgent,
  type ServiceStatus,
  type TicketMessage,
  type CardType,
  type CardData
} from '@/api/customerService'
import { getOrderByOrderNo } from '@/api/order'

const router = useRouter()

// 统计数据
const stats = ref<TicketStats>({
  totalTickets: 0,
  pendingTickets: 0,
  processingTickets: 0,
  resolvedTickets: 0,
  closedTickets: 0,
  avgResponseTime: 0,
  avgResolveTime: 0,
  avgSatisfaction: 0,
  todayTickets: 0
})

// 搜索表单
const searchForm = ref({
  status: '',
  type: '',
  priority: '',
  assigneeId: '',
  keyword: ''
})

// 搜索字段配置
const searchFields = [
  {
    type: 'select',
    prop: 'status',
    label: '工单状态',
    placeholder: '请选择工单状态',
    options: [
      { label: '待处理', value: 'pending' },
      { label: '处理中', value: 'processing' },
      { label: '已解决', value: 'resolved' },
      { label: '已关闭', value: 'closed' },
      { label: '已重开', value: 'reopened' }
    ]
  },
  {
    type: 'select',
    prop: 'type',
    label: '工单类型',
    placeholder: '请选择工单类型',
    options: [
      { label: '咨询', value: 'consultation' },
      { label: '投诉', value: 'complaint' },
      { label: '建议', value: 'suggestion' },
      { label: '技术问题', value: 'technical' },
      { label: '退款', value: 'refund' },
      { label: '营地咨询', value: 'campsite_inquiry' },
      { label: '其他', value: 'other' }
    ]
  },
  {
    type: 'select',
    prop: 'priority',
    label: '优先级',
    placeholder: '请选择优先级',
    options: [
      { label: '低', value: 'low' },
      { label: '中', value: 'medium' },
      { label: '高', value: 'high' },
      { label: '紧急', value: 'urgent' }
    ]
  },
  {
    type: 'input',
    prop: 'keyword',
    label: '关键词',
    placeholder: '请输入工单编号、标题或用户名'
  }
]

// 表格数据
const ticketList = ref<Ticket[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const tableColumns = [
  { prop: 'ticketNo', label: '工单编号', width: 150 },
  { prop: 'type', label: '类型', width: 100, slot: 'type' },
  { prop: 'title', label: '标题', minWidth: 200 },
  { prop: 'userName', label: '用户', width: 120 },
  { prop: 'campsiteName', label: '关联营地', width: 150, slot: 'campsiteName' },
  { prop: 'priority', label: '优先级', width: 100, slot: 'priority' },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'assignee', label: '客服', width: 120, slot: 'assignee' },
  { prop: 'satisfaction', label: '满意度', width: 150, slot: 'satisfaction' },
  { prop: 'createdAt', label: '创建时间', width: 160 }
]

// 表格操作
const tableActions = [
  {
    label: '查看',
    type: 'primary',
    link: true,
    onClick: (row: Ticket) => handleViewDetail(row)
  },
  {
    label: '分配',
    type: 'success',
    link: true,
    onClick: (row: Ticket) => handleAssign(row),
    show: (row: Ticket) => row.status === 'pending'
  },
  {
    label: '标记已解决',
    type: 'warning',
    link: true,
    onClick: (row: Ticket) => handleResolve(row),
    show: (row: Ticket) => row.status === 'processing'
  }
]

// 分配对话框
const assignDialogVisible = ref(false)
const currentTicket = ref<Ticket | null>(null)
const assignForm = reactive({
  assigneeId: 0
})
const assignFormRef = ref()
const assignRules = {
  assigneeId: [{ required: true, message: '请选择客服人员', trigger: 'change' }]
}
const assigning = ref(false)
const availableAgents = ref<ServiceAgent[]>([])

// 详情对话框
const detailDialogVisible = ref(false)

// 对话相关
const messages = ref<TicketMessage[]>([])
const messagesLoading = ref(false)
const messageInput = ref('')
const sending = ref(false)
const chatMessagesRef = ref<HTMLElement | null>(null)

// 未读消息数
const unreadCount = computed(() => {
  return messages.value.filter((msg) => !msg.isRead && msg.sender === 'user').length
})

// 是否可以回复
const canReply = computed(() => {
  if (!currentTicket.value) return false
  return ['processing', 'reopened'].includes(currentTicket.value.status)
})

// 获取不能回复的原因
const getDisabledReplyReason = () => {
  if (!currentTicket.value) return ''
  const status = currentTicket.value.status
  if (status === 'pending') return '工单尚未分配，请先分配客服人员'
  if (status === 'resolved') return '工单已解决，如需继续沟通请重新开启工单'
  if (status === 'closed') return '工单已关闭，无法继续回复'
  return ''
}

// 格式化消息时间
const formatMessageTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 订单号正则表达式（匹配 ORD 开头的订单号）
const ORDER_NO_REGEX = /ORD\d{12,}/g

// 解析消息内容，将订单号转换为可点击链接
const parseMessageContent = (content: string) => {
  const parts: Array<{ type: 'text' | 'order'; value: string }> = []
  let lastIndex = 0
  let match

  // 重置正则表达式
  ORDER_NO_REGEX.lastIndex = 0

  while ((match = ORDER_NO_REGEX.exec(content)) !== null) {
    // 添加订单号之前的文本
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }
    // 添加订单号
    parts.push({ type: 'order', value: match[0] })
    lastIndex = match.index + match[0].length
  }

  // 添加剩余文本
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }

  // 如果没有匹配到订单号，返回原始内容
  if (parts.length === 0) {
    parts.push({ type: 'text', value: content })
  }

  return parts
}

// 点击订单号跳转到订单详情
const handleOrderClick = async (orderNo: string) => {
  try {
    const order = await getOrderByOrderNo(orderNo)
    if (order) {
      // 关闭当前对话框
      detailDialogVisible.value = false
      // 跳转到订单详情页
      router.push(`/orders/detail/${order.id}`)
    } else {
      ElMessage.warning(`订单 ${orderNo} 不存在`)
    }
  } catch (error) {
    console.error('查找订单失败:', error)
    ElMessage.error('查找订单失败')
  }
}

// 点击卡片跳转到对应详情页
const handleCardClick = (cardType: CardType | undefined, cardData: CardData | undefined) => {
  if (!cardType || !cardData) return

  // 关闭当前对话框
  detailDialogVisible.value = false

  switch (cardType) {
    case 'order':
      router.push(`/orders/detail/${(cardData as any).id}`)
      break
    case 'vehicle':
      router.push(`/vehicles/list?id=${(cardData as any).id}`)
      break
    case 'campsite':
      router.push(`/campsites/edit/${(cardData as any).id}`)
      break
    case 'tour':
      // 旅游产品详情页（如果有的话）
      ElMessage.info('旅游产品详情页开发中')
      break
    default:
      break
  }
}

// 获取订单状态标签类型
const getOrderStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_payment: 'warning',
    pending_confirm: 'warning',
    confirmed: 'primary',
    in_use: 'success',
    completed: 'info',
    cancelled: 'danger',
    refunding: 'warning',
    refunded: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取车辆状态标签类型
const getVehicleStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    available: 'success',
    rented: 'primary',
    maintenance: 'warning',
    offline: 'info'
  }
  return statusMap[status] || 'info'
}

// 获取对话消息
const fetchMessages = async () => {
  if (!currentTicket.value) return

  messagesLoading.value = true
  try {
    messages.value = await getTicketMessages(currentTicket.value.id)
    // 标记消息已读
    await markMessagesAsRead(currentTicket.value.id)
    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('获取对话消息失败:', error)
  } finally {
    messagesLoading.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

// 发送消息
const handleSendMessage = async () => {
  if (!messageInput.value.trim() || !currentTicket.value || sending.value) return

  sending.value = true
  try {
    const newMessage = await sendTicketMessage({
      ticketId: currentTicket.value.id,
      content: messageInput.value.trim()
    })
    messages.value.push(newMessage)
    messageInput.value = ''
    await nextTick()
    scrollToBottom()
    ElMessage.success('发送成功')
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

// 详情对话框打开时加载消息
const handleDetailDialogOpen = () => {
  fetchMessages()
}

// 获取统计数据
const fetchStats = async () => {
  try {
    stats.value = await getTicketStats()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取工单列表
const fetchTicketList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      status: searchForm.value.status as TicketStatus | undefined,
      type: searchForm.value.type as TicketType | undefined,
      priority: searchForm.value.priority as TicketPriority | undefined,
      assigneeId: searchForm.value.assigneeId ? Number(searchForm.value.assigneeId) : undefined,
      keyword: searchForm.value.keyword
    }
    const { list, total } = await getTickets(params)
    ticketList.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取工单列表失败:', error)
    ElMessage.error('获取工单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取可用客服
const fetchAvailableAgents = async () => {
  try {
    availableAgents.value = await getServiceAgents({ status: 'online' })
  } catch (error) {
    console.error('获取客服列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchTicketList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    status: '',
    type: '',
    priority: '',
    assigneeId: '',
    keyword: ''
  }
  handleSearch()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTicketList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchTicketList()
}

// 查看详情
const handleViewDetail = (row: Ticket) => {
  currentTicket.value = row
  detailDialogVisible.value = true
}

// 分配工单
const handleAssign = async (row: Ticket) => {
  currentTicket.value = row
  assignForm.assigneeId = 0
  await fetchAvailableAgents()
  assignDialogVisible.value = true
}

// 从详情页分配
const handleAssignFromDetail = () => {
  detailDialogVisible.value = false
  if (currentTicket.value) {
    handleAssign(currentTicket.value)
  }
}

// 提交分配
const handleAssignSubmit = async () => {
  if (!assignFormRef.value || !currentTicket.value) return

  await assignFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    assigning.value = true
    try {
      const agent = availableAgents.value.find((a) => a.id === assignForm.assigneeId)
      if (!agent) {
        ElMessage.error('客服人员不存在')
        return
      }

      await assignTicket(currentTicket.value!.id, agent.id, agent.name)
      ElMessage.success('分配成功')
      assignDialogVisible.value = false
      fetchTicketList()
      fetchStats()
    } catch (error) {
      console.error('分配失败:', error)
      ElMessage.error('分配失败')
    } finally {
      assigning.value = false
    }
  })
}

// 关闭分配对话框
const handleAssignDialogClose = () => {
  assignFormRef.value?.resetFields()
  currentTicket.value = null
}

// 标记为已解决
const handleResolve = async (row: Ticket) => {
  try {
    await ElMessageBox.confirm('确定要将此工单标记为已解决吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await updateTicketStatus(row.id, 'resolved')
    ElMessage.success('操作成功')
    fetchTicketList()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 从详情页标记为已解决
const handleResolveFromDetail = () => {
  detailDialogVisible.value = false
  if (currentTicket.value) {
    handleResolve(currentTicket.value)
  }
}

// 关闭详情对话框
const handleDetailDialogClose = () => {
  currentTicket.value = null
  messages.value = []
  messageInput.value = ''
}

// 获取工单类型标签类型
const getTypeTagType = (type: TicketType) => {
  const typeMap: Record<TicketType, any> = {
    consultation: '',
    complaint: 'danger',
    suggestion: 'success',
    technical: 'warning',
    refund: 'info',
    campsite_inquiry: 'primary',
    other: ''
  }
  return typeMap[type] || 'info'
}

// 获取工单类型标签
const getTypeLabel = (type: TicketType) => {
  const typeMap: Record<TicketType, string> = {
    consultation: '咨询',
    complaint: '投诉',
    suggestion: '建议',
    technical: '技术问题',
    refund: '退款',
    campsite_inquiry: '营地咨询',
    other: '其他'
  }
  return typeMap[type] || type
}

// 获取优先级标签类型
const getPriorityTagType = (priority: TicketPriority) => {
  const priorityMap: Record<TicketPriority, any> = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return priorityMap[priority] || 'info'
}

// 获取优先级标签
const getPriorityLabel = (priority: TicketPriority) => {
  const priorityMap: Record<TicketPriority, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || priority
}

// 获取状态标签类型
const getStatusTagType = (status: TicketStatus) => {
  const statusMap: Record<TicketStatus, any> = {
    pending: 'warning',
    processing: '',
    resolved: 'success',
    closed: 'info',
    reopened: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: TicketStatus) => {
  const statusMap: Record<TicketStatus, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭',
    reopened: '已重开'
  }
  return statusMap[status] || status
}

// 获取客服状态类型
const getAgentStatusType = (status: ServiceStatus) => {
  const statusMap: Record<ServiceStatus, any> = {
    online: 'success',
    busy: 'warning',
    offline: 'info',
    break: ''
  }
  return statusMap[status] || 'info'
}

// 获取客服状态标签
const getAgentStatusLabel = (status: ServiceStatus) => {
  const statusMap: Record<ServiceStatus, string> = {
    online: '在线',
    busy: '忙碌',
    offline: '离线',
    break: '休息'
  }
  return statusMap[status] || status
}

// 初始化
onMounted(() => {
  fetchStats()
  fetchTicketList()
})
</script>

<style scoped lang="scss">
.ticket-management-container {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.no-rating {
  color: #909399;
  font-size: 12px;
}

.agent-option {
  display: flex;
  align-items: center;
}

// 工单详情容器（左右布局）
.ticket-detail-container {
  display: flex;
  gap: 20px;
  height: 600px;
}

// 左侧工单信息面板
.ticket-info-panel {
  width: 350px;
  flex-shrink: 0;
  overflow-y: auto;
  padding-right: 10px;

  .info-section {
    margin-top: 16px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: #303133;
    }
  }

  .content-box {
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    line-height: 1.6;
    color: #606266;
    font-size: 13px;
  }

  .satisfaction-box {
    .satisfaction-comment {
      margin-top: 8px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      line-height: 1.6;
      color: #606266;
      font-size: 13px;
    }
  }
}

// 右侧对话面板
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;

    .chat-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #fafafa;

    .messages-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 100%;
      color: #909399;
    }

    .no-messages {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;
      font-size: 14px;
    }
  }

  .chat-input {
    padding: 12px 16px;
    border-top: 1px solid #e4e7ed;
    background: #fff;

    .input-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;

      .input-tip {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .chat-input-disabled {
    padding: 12px 16px;
    border-top: 1px solid #e4e7ed;
    background: #f5f7fa;
  }
}

// 消息项
.message-item {
  margin-bottom: 16px;

  &.message-system {
    display: flex;
    justify-content: center;
  }

  &.message-user {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    .message-content {
      max-width: 70%;
    }

    .message-bubble {
      background: #fff;
      border: 1px solid #e4e7ed;
    }
  }

  &.message-agent {
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-start;
    gap: 10px;

    .message-content {
      max-width: 70%;
      align-items: flex-end;
    }

    .message-header {
      flex-direction: row-reverse;
    }

    .message-bubble {
      background: #409eff;
      color: #fff;

      .message-text {
        color: #fff;
      }
    }
  }
}

// 系统消息
.system-message {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;

  .system-text {
    color: #909399;
  }

  .system-time {
    color: #c0c4cc;
  }
}

// 消息头像
.message-avatar {
  flex-shrink: 0;
}

// 消息内容
.message-content {
  display: flex;
  flex-direction: column;

  .message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    .sender-name {
      font-size: 12px;
      font-weight: 500;
      color: #606266;
    }

    .message-time {
      font-size: 11px;
      color: #c0c4cc;
    }
  }

  .message-bubble {
    padding: 10px 14px;
    border-radius: 8px;
    word-break: break-word;

    .message-text {
      font-size: 14px;
      line-height: 1.6;
      color: #303133;
      white-space: pre-wrap;

      .order-link {
        color: #409eff;
        cursor: pointer;
        text-decoration: underline;
        font-weight: 500;

        &:hover {
          color: #66b1ff;
        }
      }
    }

    .message-image {
      .image-caption {
        margin-bottom: 8px;
        font-size: 13px;

        .order-link {
          color: #409eff;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 500;

          &:hover {
            color: #66b1ff;
          }
        }
      }

      .chat-image {
        max-width: 200px;
        max-height: 150px;
        border-radius: 4px;
        cursor: pointer;
      }
    }

    .message-file {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    // 卡片消息样式
    .message-card {
      width: 280px;
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #409eff;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 12px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
        font-size: 13px;
        font-weight: 500;
        color: #303133;

        .el-icon {
          font-size: 16px;
          color: #409eff;
        }

        .el-tag {
          margin-left: auto;
        }

        .card-rating {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 13px;
          color: #f7ba2a;
        }
      }

      .card-body {
        display: flex;
        gap: 10px;
        padding: 12px;

        .card-image {
          width: 80px;
          height: 60px;
          border-radius: 4px;
          flex-shrink: 0;
          object-fit: cover;
        }

        .card-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .card-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .card-desc {
            font-size: 12px;
            color: #909399;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .card-tags {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;

            .el-tag {
              font-size: 10px;
              padding: 0 4px;
              height: 18px;
              line-height: 16px;
            }
          }

          .card-price {
            font-size: 14px;
            font-weight: 600;
            color: #f56c6c;
          }
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: #fafafa;
        border-top: 1px solid #e4e7ed;
        font-size: 12px;
        color: #909399;

        .el-icon {
          font-size: 12px;
        }
      }
    }
  }
}

// 客服消息中的订单链接样式覆盖
.message-agent {
  .message-bubble {
    .message-text .order-link,
    .message-image .image-caption .order-link {
      color: #fff;
      text-decoration: underline;

      &:hover {
        color: #e6f0ff;
      }
    }

    // 客服发送的卡片消息样式调整
    .message-card {
      background: #fff;
    }
  }
}
</style>
