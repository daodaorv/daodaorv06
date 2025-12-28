// @ts-nocheck
/**
 * 客服管理 Mock 数据
 */

// 工单状态
export type TicketStatus = 'pending' | 'processing' | 'resolved' | 'closed' | 'reopened'

// 工单优先级
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// 工单类型
export type TicketType =
  | 'consultation'
  | 'complaint'
  | 'suggestion'
  | 'technical'
  | 'refund'
  | 'campsite_inquiry'
  | 'other'

// 客服技能
export type ServiceSkill = 'vehicle' | 'order' | 'payment' | 'technical' | 'complaint' | 'general'

// 客服状态
export type ServiceStatus = 'online' | 'busy' | 'offline' | 'break'

// 知识库分类代码
export type KnowledgeCategoryCode = 'faq' | 'guide' | 'policy' | 'technical' | 'other'

// 兼容旧类型名称
export type KnowledgeCategory = KnowledgeCategoryCode

// 文章展示范围
export type ArticleVisibility = 'admin_only' | 'miniprogram_only' | 'both'

// 知识库分类实体
export interface KnowledgeCategoryEntity {
  id: number
  code: KnowledgeCategoryCode
  name: string
  icon: string
  description?: string
  articleCount: number
  order: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

// 工单记录
export interface Ticket {
  id: number
  ticketNo: string
  type: TicketType
  title: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  userId: number
  userName: string
  userPhone: string
  assigneeId: number | null
  assigneeName: string | null
  tags: string[]
  attachments: string[]
  // 营地咨询相关字段
  campsiteId?: number | null
  campsiteName?: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null
  responseTime: number | null // 响应时长（分钟）
  resolveTime: number | null // 解决时长（小时）
  satisfaction: number | null // 满意度评分 1-5
  satisfactionComment: string
}

// 工单统计
export interface TicketStats {
  totalTickets: number
  pendingTickets: number
  processingTickets: number
  resolvedTickets: number
  closedTickets: number
  avgResponseTime: number // 平均响应时长（分钟）
  avgResolveTime: number // 平均解决时长（小时）
  avgSatisfaction: number // 平均满意度
  todayTickets: number
}

// 客服人员
export interface ServiceAgent {
  id: number
  name: string
  avatar: string
  status: ServiceStatus
  skills: ServiceSkill[]
  maxConcurrent: number // 最大并发工单数
  currentTickets: number // 当前处理工单数
  totalTickets: number // 累计处理工单数
  avgSatisfaction: number // 平均满意度
  avgResponseTime: number // 平均响应时长（分钟）
  onlineTime: number // 今日在线时长（小时）
  createdAt: string
}

// 智能路由配置
export interface RoutingConfig {
  id: number
  enableAutoRouting: boolean // 启用自动路由
  routingStrategy: 'skill' | 'load' | 'priority' | 'round_robin'
  skillMatching: boolean // 技能匹配
  loadBalancing: boolean // 负载均衡
  priorityFirst: boolean // 优先级优先
  maxWaitTime: number // 最大等待时间（分钟）
  autoEscalate: boolean // 自动升级
  escalateTime: number // 升级时间（分钟）
  workingHours: {
    start: string
    end: string
  }
  updatedAt: string
}

// 知识库文章
export interface KnowledgeArticle {
  id: number
  title: string
  summary: string // 文章摘要
  content: string
  categoryId: number // 分类ID
  categoryCode: KnowledgeCategoryCode // 分类代码
  categoryName: string // 分类名称
  tags: string[]
  visibility: ArticleVisibility // 展示范围
  isHot: boolean // 热门标记
  order: number // 排序权重
  viewCount: number
  likeCount: number
  helpfulCount: number // 有用数
  isPublished: boolean
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

// 知识库统计
export interface KnowledgeStats {
  totalArticles: number
  publishedArticles: number
  totalViews: number
  totalLikes: number
  totalHelpful: number // 总有用数
  avgViewsPerArticle: number
  hotArticles: number // 热门文章数
  adminOnlyArticles: number // 仅客服可见文章数
  miniprogramOnlyArticles: number // 仅小程序可见文章数
  bothVisibleArticles: number // 双端可见文章数
  topArticles: Array<{
    id: number
    title: string
    viewCount: number
  }>
}

// 消息发送者类型
export type MessageSender = 'user' | 'agent' | 'system'

// 消息类型
export type MessageType = 'text' | 'image' | 'file' | 'system' | 'card'

// 卡片类型
export type CardType = 'order' | 'vehicle' | 'campsite' | 'tour'

// 订单卡片数据
export interface OrderCardData {
  id: number
  orderNo: string
  status: string
  statusText: string
  vehicleName: string
  vehicleImage: string
  startDate: string
  endDate: string
  totalAmount: number
}

// 车辆卡片数据
export interface VehicleCardData {
  id: number
  name: string
  image: string
  plateNumber: string
  modelName: string
  dailyPrice: number
  status: string
  statusText: string
}

// 营地卡片数据
export interface CampsiteCardData {
  id: number
  name: string
  image: string
  address: string
  rating: number
  price: number
  facilities: string[]
}

// 旅游产品卡片数据
export interface TourCardData {
  id: number
  name: string
  image: string
  duration: string
  price: number
  departure: string
  highlights: string[]
}

// 卡片数据联合类型
export type CardData = OrderCardData | VehicleCardData | CampsiteCardData | TourCardData

// 对话消息
export interface TicketMessage {
  id: number
  ticketId: number
  sender: MessageSender
  senderName: string
  senderAvatar: string
  type: MessageType
  content: string
  attachments: string[]
  // 卡片消息相关
  cardType?: CardType
  cardData?: CardData
  createdAt: string
  isRead: boolean
}

// Mock 工单数据
const mockTickets: Ticket[] = [
  {
    id: 1,
    ticketNo: 'TK202512030001',
    type: 'consultation',
    title: '如何预订房车？',
    description: '我是新用户，想了解一下如何在小程序上预订房车，需要准备什么材料？',
    priority: 'medium',
    status: 'resolved',
    userId: 1001,
    userName: '张三',
    userPhone: '13800138001',
    assigneeId: 1,
    assigneeName: '客服小王',
    tags: ['预订', '新手'],
    attachments: [],
    createdAt: '2025-12-03 09:00:00',
    updatedAt: '2025-12-03 09:30:00',
    resolvedAt: '2025-12-03 09:30:00',
    closedAt: '2025-12-03 10:00:00',
    responseTime: 5,
    resolveTime: 0.5,
    satisfaction: 5,
    satisfactionComment: '回复很及时，解答很详细',
  },
  {
    id: 2,
    ticketNo: 'TK202512030002',
    type: 'complaint',
    title: '车辆有异味',
    description: '我租的房车里有很重的烟味，影响使用体验，要求换车或退款',
    priority: 'high',
    status: 'processing',
    userId: 1002,
    userName: '李四',
    userPhone: '13800138002',
    assigneeId: 2,
    assigneeName: '客服小李',
    tags: ['投诉', '车辆问题'],
    attachments: ['https://picsum.photos/400/300?random=20'],
    createdAt: '2025-12-03 10:00:00',
    updatedAt: '2025-12-03 10:30:00',
    resolvedAt: null,
    closedAt: null,
    responseTime: 10,
    resolveTime: null,
    satisfaction: null,
    satisfactionComment: '',
  },
  {
    id: 3,
    ticketNo: 'TK202512030003',
    type: 'technical',
    title: '小程序支付失败',
    description: '我在支付订单时一直提示"支付失败"，但是钱已经扣了',
    priority: 'urgent',
    status: 'pending',
    userId: 1003,
    userName: '王五',
    userPhone: '13800138003',
    assigneeId: null,
    assigneeName: null,
    tags: ['支付', '技术问题'],
    attachments: ['https://picsum.photos/400/300?random=21'],
    createdAt: '2025-12-03 11:00:00',
    updatedAt: '2025-12-03 11:00:00',
    resolvedAt: null,
    closedAt: null,
    responseTime: null,
    resolveTime: null,
    satisfaction: null,
    satisfactionComment: '',
  },
  {
    id: 4,
    ticketNo: 'TK202512030004',
    type: 'refund',
    title: '申请退款',
    description: '因为临时有事无法出行，申请退款',
    priority: 'medium',
    status: 'resolved',
    userId: 1004,
    userName: '赵六',
    userPhone: '13800138004',
    assigneeId: 1,
    assigneeName: '客服小王',
    tags: ['退款'],
    attachments: [],
    createdAt: '2025-12-02 14:00:00',
    updatedAt: '2025-12-02 16:00:00',
    resolvedAt: '2025-12-02 16:00:00',
    closedAt: '2025-12-02 17:00:00',
    responseTime: 15,
    resolveTime: 2,
    satisfaction: 4,
    satisfactionComment: '处理速度还可以',
  },
  {
    id: 5,
    ticketNo: 'TK202512030005',
    type: 'suggestion',
    title: '建议增加车型',
    description: '希望能增加一些小型房车，适合2-3人的家庭出游',
    priority: 'low',
    status: 'closed',
    userId: 1005,
    userName: '孙七',
    userPhone: '13800138005',
    assigneeId: 3,
    assigneeName: '客服小张',
    tags: ['建议', '车型'],
    attachments: [],
    createdAt: '2025-12-01 10:00:00',
    updatedAt: '2025-12-01 11:00:00',
    resolvedAt: '2025-12-01 11:00:00',
    closedAt: '2025-12-01 11:30:00',
    responseTime: 20,
    resolveTime: 1,
    satisfaction: 5,
    satisfactionComment: '感谢反馈',
  },
]

// Mock 客服人员数据
const mockServiceAgents: ServiceAgent[] = [
  {
    id: 1,
    name: '客服小王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent1',
    status: 'online',
    skills: ['vehicle', 'order', 'general'],
    maxConcurrent: 5,
    currentTickets: 2,
    totalTickets: 156,
    avgSatisfaction: 4.8,
    avgResponseTime: 8,
    onlineTime: 6.5,
    createdAt: '2025-01-01 00:00:00',
  },
  {
    id: 2,
    name: '客服小李',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent2',
    status: 'busy',
    skills: ['complaint', 'refund', 'general'],
    maxConcurrent: 5,
    currentTickets: 5,
    totalTickets: 203,
    avgSatisfaction: 4.6,
    avgResponseTime: 10,
    onlineTime: 7.2,
    createdAt: '2025-01-01 00:00:00',
  },
  {
    id: 3,
    name: '客服小张',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent3',
    status: 'online',
    skills: ['technical', 'payment', 'general'],
    maxConcurrent: 3,
    currentTickets: 1,
    totalTickets: 98,
    avgSatisfaction: 4.9,
    avgResponseTime: 6,
    onlineTime: 5.8,
    createdAt: '2025-02-01 00:00:00',
  },
  {
    id: 4,
    name: '客服小刘',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent4',
    status: 'break',
    skills: ['vehicle', 'technical', 'general'],
    maxConcurrent: 4,
    currentTickets: 0,
    totalTickets: 134,
    avgSatisfaction: 4.7,
    avgResponseTime: 9,
    onlineTime: 4.5,
    createdAt: '2025-01-15 00:00:00',
  },
  {
    id: 5,
    name: '客服小陈',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent5',
    status: 'offline',
    skills: ['order', 'refund', 'general'],
    maxConcurrent: 5,
    currentTickets: 0,
    totalTickets: 187,
    avgSatisfaction: 4.5,
    avgResponseTime: 12,
    onlineTime: 0,
    createdAt: '2025-01-10 00:00:00',
  },
]

// Mock 智能路由配置
let mockRoutingConfig: RoutingConfig = {
  id: 1,
  enableAutoRouting: true,
  routingStrategy: 'skill',
  skillMatching: true,
  loadBalancing: true,
  priorityFirst: true,
  maxWaitTime: 5,
  autoEscalate: true,
  escalateTime: 30,
  workingHours: {
    start: '09:00',
    end: '18:00',
  },
  updatedAt: '2025-12-03 10:00:00',
}

// Mock 知识库分类数据
const mockKnowledgeCategories: KnowledgeCategoryEntity[] = [
  {
    id: 1,
    code: 'faq',
    name: '常见问题',
    icon: 'QuestionFilled',
    description: '用户常见问题解答',
    articleCount: 1,
    order: 1,
    isEnabled: true,
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-01-01 00:00:00',
  },
  {
    id: 2,
    code: 'guide',
    name: '使用指南',
    icon: 'Document',
    description: '产品使用教程和指南',
    articleCount: 2,
    order: 2,
    isEnabled: true,
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-01-01 00:00:00',
  },
  {
    id: 3,
    code: 'policy',
    name: '政策条款',
    icon: 'Files',
    description: '服务政策和条款说明',
    articleCount: 2,
    order: 3,
    isEnabled: true,
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-01-01 00:00:00',
  },
  {
    id: 4,
    code: 'technical',
    name: '技术支持',
    icon: 'Setting',
    description: '技术问题和故障排除',
    articleCount: 0,
    order: 4,
    isEnabled: true,
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-01-01 00:00:00',
  },
  {
    id: 5,
    code: 'other',
    name: '其他',
    icon: 'More',
    description: '其他类型文章',
    articleCount: 0,
    order: 5,
    isEnabled: true,
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-01-01 00:00:00',
  },
]

// Mock 知识库文章数据
const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: 1,
    title: '如何预订房车？',
    summary: '详细介绍在小程序上预订房车的完整流程，包括选车、选日期、填写信息和支付等步骤。',
    content: '# 房车预订流程\n\n1. 打开小程序\n2. 选择车型\n3. 选择日期\n4. 填写信息\n5. 支付订单',
    categoryId: 2,
    categoryCode: 'guide',
    categoryName: '使用指南',
    tags: ['预订', '新手'],
    visibility: 'both',
    isHot: true,
    order: 100,
    viewCount: 1250,
    likeCount: 98,
    helpfulCount: 156,
    isPublished: true,
    authorId: 1,
    authorName: '管理员',
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-12-01 10:00:00',
  },
  {
    id: 2,
    title: '房车驾驶注意事项',
    summary: '房车驾驶安全指南，包括车速控制、转弯技巧、车况检查等重要注意事项。',
    content: '# 房车驾驶安全指南\n\n1. 控制车速\n2. 注意转弯半径\n3. 检查车况\n4. 遵守交通规则',
    categoryId: 2,
    categoryCode: 'guide',
    categoryName: '使用指南',
    tags: ['驾驶', '安全'],
    visibility: 'both',
    isHot: false,
    order: 90,
    viewCount: 980,
    likeCount: 76,
    helpfulCount: 89,
    isPublished: true,
    authorId: 1,
    authorName: '管理员',
    createdAt: '2025-01-05 00:00:00',
    updatedAt: '2025-11-20 10:00:00',
  },
  {
    id: 3,
    title: '退款政策说明',
    summary: '详细说明不同取消时间对应的退款比例，帮助用户了解退款规则。',
    content:
      '# 退款政策\n\n## 全额退款\n- 提前7天以上取消\n\n## 部分退款\n- 提前3-7天取消，退款50%\n\n## 不予退款\n- 提前3天内取消',
    categoryId: 3,
    categoryCode: 'policy',
    categoryName: '政策条款',
    tags: ['退款', '政策'],
    visibility: 'both',
    isHot: true,
    order: 100,
    viewCount: 2100,
    likeCount: 145,
    helpfulCount: 234,
    isPublished: true,
    authorId: 1,
    authorName: '管理员',
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-12-01 10:00:00',
  },
  {
    id: 4,
    title: '常见技术问题解答',
    summary: '解答支付失败、无法登录等常见技术问题，提供详细的解决步骤。',
    content:
      '# 技术问题FAQ\n\n## 支付失败怎么办？\n1. 检查网络\n2. 检查余额\n3. 联系客服\n\n## 无法登录怎么办？\n1. 检查手机号\n2. 重置密码\n3. 联系客服',
    categoryId: 1,
    categoryCode: 'faq',
    categoryName: '常见问题',
    tags: ['技术', 'FAQ'],
    visibility: 'both',
    isHot: false,
    order: 80,
    viewCount: 1560,
    likeCount: 112,
    helpfulCount: 178,
    isPublished: true,
    authorId: 2,
    authorName: '技术支持',
    createdAt: '2025-01-10 00:00:00',
    updatedAt: '2025-11-25 10:00:00',
  },
  {
    id: 5,
    title: '房车保险说明',
    summary: '介绍房车租赁包含的保险类型，包括车损险、第三者责任险等。',
    content:
      '# 房车保险\n\n我们为每辆房车购买了全险，包括：\n- 车损险\n- 第三者责任险\n- 司乘险\n- 盗抢险',
    categoryId: 3,
    categoryCode: 'policy',
    categoryName: '政策条款',
    tags: ['保险', '政策'],
    visibility: 'both',
    isHot: false,
    order: 70,
    viewCount: 890,
    likeCount: 67,
    helpfulCount: 92,
    isPublished: true,
    authorId: 1,
    authorName: '管理员',
    createdAt: '2025-01-01 00:00:00',
    updatedAt: '2025-10-15 10:00:00',
  },
  {
    id: 6,
    title: '客服内部操作手册',
    summary: '客服人员内部使用的操作手册，包含工单处理流程和常见问题应对方案。',
    content:
      '# 客服操作手册\n\n## 工单处理流程\n1. 接收工单\n2. 分析问题\n3. 解决方案\n4. 回复用户\n5. 关闭工单\n\n## 常见问题应对\n- 退款问题：按退款政策处理\n- 投诉问题：优先处理，及时上报',
    categoryId: 2,
    categoryCode: 'guide',
    categoryName: '使用指南',
    tags: ['客服', '内部'],
    visibility: 'admin_only',
    isHot: false,
    order: 50,
    viewCount: 320,
    likeCount: 25,
    helpfulCount: 45,
    isPublished: true,
    authorId: 1,
    authorName: '管理员',
    createdAt: '2025-02-01 00:00:00',
    updatedAt: '2025-11-01 10:00:00',
  },
  {
    id: 7,
    title: '小程序专属优惠活动',
    summary: '仅在小程序端展示的优惠活动说明，包含限时折扣和会员专享优惠。',
    content:
      '# 小程序专属优惠\n\n## 限时折扣\n- 新用户首单9折\n- 周末特惠8.5折\n\n## 会员专享\n- 银卡会员95折\n- 金卡会员9折\n- 钻石会员85折',
    categoryId: 3,
    categoryCode: 'policy',
    categoryName: '政策条款',
    tags: ['优惠', '活动'],
    visibility: 'miniprogram_only',
    isHot: true,
    order: 95,
    viewCount: 1850,
    likeCount: 203,
    helpfulCount: 312,
    isPublished: true,
    authorId: 1,
    authorName: '管理员',
    createdAt: '2025-03-01 00:00:00',
    updatedAt: '2025-12-01 10:00:00',
  },
]

// API 函数

/**
 * 获取工单列表
 */
export function getTickets(params: {
  page: number
  pageSize: number
  status?: TicketStatus
  type?: TicketType
  priority?: TicketPriority
  assigneeId?: number
  keyword?: string
}): Promise<{ list: Ticket[]; total: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockTickets]

      // 筛选
      if (params.status) {
        filteredList = filteredList.filter(item => item.status === params.status)
      }
      if (params.type) {
        filteredList = filteredList.filter(item => item.type === params.type)
      }
      if (params.priority) {
        filteredList = filteredList.filter(item => item.priority === params.priority)
      }
      if (params.assigneeId) {
        filteredList = filteredList.filter(item => item.assigneeId === params.assigneeId)
      }
      if (params.keyword) {
        filteredList = filteredList.filter(
          item =>
            item.ticketNo.includes(params.keyword!) ||
            item.title.includes(params.keyword!) ||
            item.userName.includes(params.keyword!)
        )
      }

      // 分页
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const list = filteredList.slice(start, end)

      resolve({
        list,
        total: filteredList.length,
      })
    }, 300)
  })
}

/**
 * 获取工单统计
 */
export function getTicketStats(): Promise<TicketStats> {
  return new Promise(resolve => {
    setTimeout(() => {
      const stats: TicketStats = {
        totalTickets: mockTickets.length,
        pendingTickets: mockTickets.filter(item => item.status === 'pending').length,
        processingTickets: mockTickets.filter(item => item.status === 'processing').length,
        resolvedTickets: mockTickets.filter(item => item.status === 'resolved').length,
        closedTickets: mockTickets.filter(item => item.status === 'closed').length,
        avgResponseTime: 11.6,
        avgResolveTime: 1.1,
        avgSatisfaction: 4.6,
        todayTickets: 3,
      }
      resolve(stats)
    }, 200)
  })
}

/**
 * 分配工单
 */
export function assignTicket(id: number, assigneeId: number, assigneeName: string): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockTickets.findIndex(item => item.id === id)
      if (index !== -1) {
        mockTickets[index].assigneeId = assigneeId
        mockTickets[index].assigneeName = assigneeName
        mockTickets[index].status = 'processing'
        mockTickets[index].updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      resolve()
    }, 300)
  })
}

/**
 * 更新工单状态
 */
export function updateTicketStatus(id: number, status: TicketStatus): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockTickets.findIndex(item => item.id === id)
      if (index !== -1) {
        mockTickets[index].status = status
        mockTickets[index].updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        if (status === 'resolved') {
          mockTickets[index].resolvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        } else if (status === 'closed') {
          mockTickets[index].closedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      }
      resolve()
    }, 300)
  })
}

/**
 * 获取客服人员列表
 */
export function getServiceAgents(params?: {
  status?: ServiceStatus
  skill?: ServiceSkill
}): Promise<ServiceAgent[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockServiceAgents]

      if (params?.status) {
        filteredList = filteredList.filter(item => item.status === params.status)
      }
      if (params?.skill) {
        filteredList = filteredList.filter(item => item.skills.includes(params.skill!))
      }

      resolve(filteredList)
    }, 200)
  })
}

/**
 * 更新客服状态
 */
export function updateServiceAgentStatus(id: number, status: ServiceStatus): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockServiceAgents.findIndex(item => item.id === id)
      if (index !== -1) {
        mockServiceAgents[index].status = status
      }
      resolve()
    }, 300)
  })
}

/**
 * 获取智能路由配置
 */
export function getRoutingConfig(): Promise<RoutingConfig> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockRoutingConfig)
    }, 200)
  })
}

/**
 * 更新智能路由配置
 */
export function updateRoutingConfig(data: Partial<RoutingConfig>): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      mockRoutingConfig = {
        ...mockRoutingConfig,
        ...data,
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }
      resolve()
    }, 300)
  })
}

/**
 * 获取知识库文章列表
 */
export function getKnowledgeArticles(params: {
  page: number
  pageSize: number
  categoryCode?: KnowledgeCategoryCode
  visibility?: ArticleVisibility
  isPublished?: boolean
  isHot?: boolean
  keyword?: string
}): Promise<{ list: KnowledgeArticle[]; total: number }> {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockKnowledgeArticles]

      // 分类筛选
      if (params.categoryCode) {
        filteredList = filteredList.filter(item => item.categoryCode === params.categoryCode)
      }
      // 展示范围筛选
      if (params.visibility) {
        filteredList = filteredList.filter(item => item.visibility === params.visibility)
      }
      // 发布状态筛选
      if (params.isPublished !== undefined) {
        filteredList = filteredList.filter(item => item.isPublished === params.isPublished)
      }
      // 热门筛选
      if (params.isHot !== undefined) {
        filteredList = filteredList.filter(item => item.isHot === params.isHot)
      }
      // 关键词搜索
      if (params.keyword) {
        filteredList = filteredList.filter(
          item =>
            item.title.includes(params.keyword!) ||
            item.summary.includes(params.keyword!) ||
            item.content.includes(params.keyword!)
        )
      }

      // 按排序权重和创建时间排序
      filteredList.sort(
        (a, b) =>
          b.order - a.order || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // 分页
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const list = filteredList.slice(start, end)

      resolve({
        list,
        total: filteredList.length,
      })
    }, 300)
  })
}

/**
 * 获取知识库统计
 */
export function getKnowledgeStats(): Promise<KnowledgeStats> {
  return new Promise(resolve => {
    setTimeout(() => {
      const stats: KnowledgeStats = {
        totalArticles: mockKnowledgeArticles.length,
        publishedArticles: mockKnowledgeArticles.filter(item => item.isPublished).length,
        totalViews: mockKnowledgeArticles.reduce((sum, item) => sum + item.viewCount, 0),
        totalLikes: mockKnowledgeArticles.reduce((sum, item) => sum + item.likeCount, 0),
        totalHelpful: mockKnowledgeArticles.reduce((sum, item) => sum + item.helpfulCount, 0),
        avgViewsPerArticle: Math.round(
          mockKnowledgeArticles.reduce((sum, item) => sum + item.viewCount, 0) /
            mockKnowledgeArticles.length
        ),
        hotArticles: mockKnowledgeArticles.filter(item => item.isHot).length,
        adminOnlyArticles: mockKnowledgeArticles.filter(item => item.visibility === 'admin_only')
          .length,
        miniprogramOnlyArticles: mockKnowledgeArticles.filter(
          item => item.visibility === 'miniprogram_only'
        ).length,
        bothVisibleArticles: mockKnowledgeArticles.filter(item => item.visibility === 'both')
          .length,
        topArticles: [...mockKnowledgeArticles]
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, 5)
          .map(item => ({
            id: item.id,
            title: item.title,
            viewCount: item.viewCount,
          })),
      }
      resolve(stats)
    }, 200)
  })
}

/**
 * 创建知识库文章
 */
export function createKnowledgeArticle(data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
  return new Promise(resolve => {
    setTimeout(() => {
      // 根据分类代码获取分类信息
      const category =
        mockKnowledgeCategories.find(c => c.code === data.categoryCode) ||
        mockKnowledgeCategories[4]

      const newArticle: KnowledgeArticle = {
        id: mockKnowledgeArticles.length + 1,
        title: data.title!,
        summary: data.summary || '',
        content: data.content!,
        categoryId: category.id,
        categoryCode: category.code,
        categoryName: category.name,
        tags: data.tags || [],
        visibility: data.visibility || 'both',
        isHot: data.isHot || false,
        order: data.order || 0,
        viewCount: 0,
        likeCount: 0,
        helpfulCount: 0,
        isPublished: data.isPublished ?? false,
        authorId: 1,
        authorName: '当前管理员',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }
      mockKnowledgeArticles.push(newArticle)

      // 更新分类文章数
      const categoryIndex = mockKnowledgeCategories.findIndex(c => c.id === category.id)
      if (categoryIndex !== -1) {
        mockKnowledgeCategories[categoryIndex].articleCount++
      }

      resolve(newArticle)
    }, 300)
  })
}

/**
 * 更新知识库文章
 */
export function updateKnowledgeArticle(id: number, data: Partial<KnowledgeArticle>): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockKnowledgeArticles.findIndex(item => item.id === id)
      if (index !== -1) {
        mockKnowledgeArticles[index] = {
          ...mockKnowledgeArticles[index],
          ...data,
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        }
      }
      resolve()
    }, 300)
  })
}

/**
 * 删除知识库文章
 */
export function deleteKnowledgeArticle(id: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockKnowledgeArticles.findIndex(item => item.id === id)
      if (index !== -1) {
        // 更新分类文章数
        const article = mockKnowledgeArticles[index]
        const categoryIndex = mockKnowledgeCategories.findIndex(c => c.id === article.categoryId)
        if (categoryIndex !== -1 && mockKnowledgeCategories[categoryIndex].articleCount > 0) {
          mockKnowledgeCategories[categoryIndex].articleCount--
        }
        mockKnowledgeArticles.splice(index, 1)
      }
      resolve()
    }, 300)
  })
}

/**
 * 获取知识库分类列表
 */
export function getKnowledgeCategories(params?: {
  isEnabled?: boolean
}): Promise<KnowledgeCategoryEntity[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockKnowledgeCategories]

      if (params?.isEnabled !== undefined) {
        filteredList = filteredList.filter(item => item.isEnabled === params.isEnabled)
      }

      // 按排序权重排序
      filteredList.sort((a, b) => a.order - b.order)

      resolve(filteredList)
    }, 200)
  })
}

/**
 * 更新知识库分类
 */
export function updateKnowledgeCategory(
  id: number,
  data: Partial<KnowledgeCategoryEntity>
): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const index = mockKnowledgeCategories.findIndex(item => item.id === id)
      if (index !== -1) {
        mockKnowledgeCategories[index] = {
          ...mockKnowledgeCategories[index],
          ...data,
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        }
      }
      resolve()
    }, 300)
  })
}

// Mock 对话消息数据
const mockTicketMessages: TicketMessage[] = [
  // 工单1的对话记录
  {
    id: 1,
    ticketId: 1,
    sender: 'user',
    senderName: '张三',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    type: 'text',
    content: '你好，我是新用户，想了解一下如何在小程序上预订房车，需要准备什么材料？',
    attachments: [],
    createdAt: '2025-12-03 09:00:00',
    isRead: true,
  },
  {
    id: 2,
    ticketId: 1,
    sender: 'system',
    senderName: '系统',
    senderAvatar: '',
    type: 'system',
    content: '工单已分配给客服小王',
    attachments: [],
    createdAt: '2025-12-03 09:05:00',
    isRead: true,
  },
  {
    id: 3,
    ticketId: 1,
    sender: 'agent',
    senderName: '客服小王',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent1',
    type: 'text',
    content:
      '您好！感谢您选择叨叨房车。预订房车非常简单，您只需要：\n1. 在小程序首页选择您心仪的车型\n2. 选择租赁日期和取还车地点\n3. 填写驾驶人信息（需要有效驾照）\n4. 完成支付即可',
    attachments: [],
    createdAt: '2025-12-03 09:08:00',
    isRead: true,
  },
  {
    id: 4,
    ticketId: 1,
    sender: 'user',
    senderName: '张三',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    type: 'text',
    content: '好的，那需要押金吗？',
    attachments: [],
    createdAt: '2025-12-03 09:15:00',
    isRead: true,
  },
  {
    id: 5,
    ticketId: 1,
    sender: 'agent',
    senderName: '客服小王',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent1',
    type: 'text',
    content:
      '是的，根据车型不同，押金在3000-10000元不等。押金会在还车验收无误后3个工作日内原路退回。如果您是我们的会员，还可以享受免押金服务哦！',
    attachments: [],
    createdAt: '2025-12-03 09:20:00',
    isRead: true,
  },
  {
    id: 6,
    ticketId: 1,
    sender: 'user',
    senderName: '张三',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    type: 'text',
    content: '明白了，非常感谢！',
    attachments: [],
    createdAt: '2025-12-03 09:25:00',
    isRead: true,
  },
  {
    id: 7,
    ticketId: 1,
    sender: 'system',
    senderName: '系统',
    senderAvatar: '',
    type: 'system',
    content: '工单已解决',
    attachments: [],
    createdAt: '2025-12-03 09:30:00',
    isRead: true,
  },
  // 工单2的对话记录
  {
    id: 8,
    ticketId: 2,
    sender: 'user',
    senderName: '李四',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    type: 'text',
    content: '我租的房车里有很重的烟味，影响使用体验，要求换车或退款！',
    attachments: [],
    createdAt: '2025-12-03 10:00:00',
    isRead: true,
  },
  {
    id: 9,
    ticketId: 2,
    sender: 'user',
    senderName: '李四',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    type: 'image',
    content: '这是车内的照片',
    attachments: ['https://picsum.photos/400/300?random=20'],
    createdAt: '2025-12-03 10:02:00',
    isRead: true,
  },
  {
    id: 10,
    ticketId: 2,
    sender: 'system',
    senderName: '系统',
    senderAvatar: '',
    type: 'system',
    content: '工单已分配给客服小李',
    attachments: [],
    createdAt: '2025-12-03 10:10:00',
    isRead: true,
  },
  {
    id: 11,
    ticketId: 2,
    sender: 'agent',
    senderName: '客服小李',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent2',
    type: 'text',
    content:
      '非常抱歉给您带来不好的体验！我们会立即为您安排换车，请问您现在方便到最近的门店吗？我们会为您准备一辆同款或更高配置的车辆。',
    attachments: [],
    createdAt: '2025-12-03 10:15:00',
    isRead: true,
  },
  {
    id: 12,
    ticketId: 2,
    sender: 'user',
    senderName: '李四',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    type: 'text',
    content: '好的，我现在在杭州西湖附近，最近的门店在哪里？',
    attachments: [],
    createdAt: '2025-12-03 10:20:00',
    isRead: true,
  },
  {
    id: 13,
    ticketId: 2,
    sender: 'agent',
    senderName: '客服小李',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent2',
    type: 'text',
    content:
      '西湖区有我们的旗舰店，地址是：西湖区文三路123号。我已经通知门店为您准备车辆，您到店后报您的手机号即可。另外，作为补偿，我们会赠送您一张200元的优惠券。',
    attachments: [],
    createdAt: '2025-12-03 10:25:00',
    isRead: true,
  },
  // 工单3的对话记录（待处理） - 包含订单卡片
  {
    id: 14,
    ticketId: 3,
    sender: 'user',
    senderName: '王五',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    type: 'text',
    content: '我在支付订单时一直提示"支付失败"，但是钱已经扣了',
    attachments: [],
    createdAt: '2025-12-03 11:00:00',
    isRead: false,
  },
  {
    id: 15,
    ticketId: 3,
    sender: 'user',
    senderName: '王五',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    type: 'card',
    content: '',
    attachments: [],
    cardType: 'order',
    cardData: {
      id: 1,
      orderNo: 'ORD202412030001',
      status: 'in_use',
      statusText: '使用中',
      vehicleName: '大通RV80 C型房车',
      vehicleImage: 'https://picsum.photos/200/120?random=101',
      startDate: '2025-12-01',
      endDate: '2025-12-05',
      totalAmount: 3500,
    },
    createdAt: '2025-12-03 11:01:00',
    isRead: false,
  },
  {
    id: 16,
    ticketId: 3,
    sender: 'user',
    senderName: '王五',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    type: 'image',
    content: '这是支付截图',
    attachments: ['https://picsum.photos/400/300?random=21'],
    createdAt: '2025-12-03 11:02:00',
    isRead: false,
  },
  // 工单4的对话记录 - 车辆咨询（包含车辆卡片）
  {
    id: 17,
    ticketId: 4,
    sender: 'user',
    senderName: '赵六',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
    type: 'text',
    content: '请问这辆车可以预订吗？我想了解一下具体配置',
    attachments: [],
    createdAt: '2025-12-02 14:00:00',
    isRead: true,
  },
  {
    id: 18,
    ticketId: 4,
    sender: 'user',
    senderName: '赵六',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
    type: 'card',
    content: '',
    attachments: [],
    cardType: 'vehicle',
    cardData: {
      id: 1,
      name: '大通RV80 C型房车',
      image: 'https://picsum.photos/200/120?random=102',
      plateNumber: '京A12345',
      modelName: 'RV80 C型',
      dailyPrice: 800,
      status: 'available',
      statusText: '可租',
    },
    createdAt: '2025-12-02 14:01:00',
    isRead: true,
  },
  // 工单5的对话记录 - 营地咨询（包含营地卡片）
  {
    id: 19,
    ticketId: 5,
    sender: 'user',
    senderName: '孙七',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
    type: 'text',
    content: '这个营地周末还有位置吗？设施怎么样？',
    attachments: [],
    createdAt: '2025-12-01 10:00:00',
    isRead: true,
  },
  {
    id: 20,
    ticketId: 5,
    sender: 'user',
    senderName: '孙七',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5',
    type: 'card',
    content: '',
    attachments: [],
    cardType: 'campsite',
    cardData: {
      id: 1,
      name: '千岛湖房车露营基地',
      image: 'https://picsum.photos/200/120?random=103',
      address: '浙江省杭州市淳安县千岛湖镇',
      rating: 4.8,
      price: 298,
      facilities: ['水电桩', '淋浴间', '烧烤区', 'WiFi'],
    },
    createdAt: '2025-12-01 10:01:00',
    isRead: true,
  },
  {
    id: 21,
    ticketId: 5,
    sender: 'system',
    senderName: '系统',
    senderAvatar: '',
    type: 'system',
    content: '工单已分配给客服小张',
    attachments: [],
    createdAt: '2025-12-01 10:05:00',
    isRead: true,
  },
  {
    id: 22,
    ticketId: 5,
    sender: 'agent',
    senderName: '客服小张',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent3',
    type: 'text',
    content:
      '您好！千岛湖营地周末还有少量位置，建议您尽快预订。营地设施非常完善，有独立水电桩、24小时热水淋浴、烧烤区和免费WiFi。',
    attachments: [],
    createdAt: '2025-12-01 10:10:00',
    isRead: true,
  },
]

// 消息ID计数器
let messageIdCounter = 23

/**
 * 获取工单对话消息
 */
export function getTicketMessages(ticketId: number): Promise<TicketMessage[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const messages = mockTicketMessages.filter(msg => msg.ticketId === ticketId)
      resolve(messages)
    }, 200)
  })
}

/**
 * 发送工单消息
 */
export function sendTicketMessage(data: {
  ticketId: number
  content: string
  type?: MessageType
  attachments?: string[]
}): Promise<TicketMessage> {
  return new Promise(resolve => {
    setTimeout(() => {
      const newMessage: TicketMessage = {
        id: messageIdCounter++,
        ticketId: data.ticketId,
        sender: 'agent',
        senderName: '当前客服',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentAgent',
        type: data.type || 'text',
        content: data.content,
        attachments: data.attachments || [],
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        isRead: true,
      }
      mockTicketMessages.push(newMessage)
      resolve(newMessage)
    }, 300)
  })
}

/**
 * 标记消息已读
 */
export function markMessagesAsRead(ticketId: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      mockTicketMessages.forEach(msg => {
        if (msg.ticketId === ticketId) {
          msg.isRead = true
        }
      })
      resolve()
    }, 100)
  })
}
