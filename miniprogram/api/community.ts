/**
 * 社区互动模块 API
 * 包含内容发布、详情、点赞、评论、收藏、关注等功能
 */

// ==================== TypeScript 类型定义 ====================

/**
 * 内容类型枚举
 */
export enum PostType {
  GUIDE = 'GUIDE',           // 攻略
  EXPERIENCE = 'EXPERIENCE', // 体验
  ACTIVITY = 'ACTIVITY',     // 活动
  QA = 'QA'                  // 问答
}

/**
 * 内容状态枚举
 */
export enum PostStatus {
  PENDING = 'PENDING',       // 待审核
  PUBLISHED = 'PUBLISHED',   // 已发布
  REJECTED = 'REJECTED'      // 已拒绝
}

/**
 * 社区帖子接口
 */
export interface CommunityPost {
  id: string
  userId: string
  userName: string
  userAvatar: string
  type: PostType
  title: string
  content: string
  images: string[]
  tags: string[]
  location?: string
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
  isLiked: boolean
  isFavorited: boolean
  status: PostStatus
  createdAt: string
}

/**
 * 关联产品信息
 */
export interface RelatedProduct {
  id: string
  type: 'campsite' | 'travel' | 'rental'
  name: string
}

/**
 * 发布内容请求参数
 */
export interface CreatePostParams extends Record<string, unknown> {
  type: PostType
  title: string
  content: string
  images: string[]
  tags: string[]
  location?: string
  relatedProduct?: RelatedProduct
}

/**
 * 评论接口
 */
export interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  replyToId?: string
  replyToUserId?: string
  replyToUserName?: string
  likeCount: number
  replyCount?: number
  isLiked?: boolean
  createdAt: string
  replies?: Comment[]
}

/**
 * 评论请求参数
 */
export interface CommentParams extends Record<string, unknown> {
  content: string
  replyToId?: string
  replyToUserId?: string
}

/**
 * 用户主页接口
 */
export interface UserProfile {
  id: string
  userName: string
  avatar: string
  bio: string
  postCount: number
  followerCount: number
  followingCount: number
  likeCount: number
  isFollowing: boolean
  posts: CommunityPost[]
}

// ==================== Mock 数据 ====================

/**
 * Mock 社区帖子数据
 */
const mockPosts: CommunityPost[] = [
  {
    id: 'post_001',
    userId: 'user_001',
    userName: '房车旅行家',
    userAvatar: '/static/images/default-avatar.png',
    type: PostType.GUIDE,
    title: '川西秘境·稻城亚丁房车自驾攻略',
    content: '# 川西秘境·稻城亚丁房车自驾攻略\n\n## 路线规划\n成都 → 雅安 → 康定 → 新都桥 → 稻城 → 亚丁\n\n## 注意事项\n1. 高原反应预防\n2. 路况信息\n3. 加油站分布\n\n详细攻略内容...',
    images: [
      '/static/images/post1.jpg',
      '/static/images/post2.jpg',
      '/static/images/post3.jpg'
    ],
    tags: ['川西', '稻城亚丁', '自驾攻略', '高原旅行'],
    location: '四川省甘孜藏族自治州',
    viewCount: 1250,
    likeCount: 89,
    commentCount: 23,
    favoriteCount: 45,
    isLiked: false,
    isFavorited: false,
    status: PostStatus.PUBLISHED,
    createdAt: '2025-11-25T10:00:00+08:00'
  },
  {
    id: 'post_002',
    userId: 'user_002',
    userName: '旅行达人',
    userAvatar: '/static/images/default-avatar.png',
    type: PostType.EXPERIENCE,
    title: '我的第一次房车旅行体验',
    content: '分享我第一次房车旅行的真实体验，从租车到还车的全过程...',
    images: ['/static/images/post4.jpg'],
    tags: ['房车体验', '新手指南'],
    location: '浙江省杭州市',
    viewCount: 856,
    likeCount: 67,
    commentCount: 15,
    favoriteCount: 32,
    isLiked: false,
    isFavorited: false,
    status: PostStatus.PUBLISHED,
    createdAt: '2025-11-26T14:30:00+08:00'
  }
]

/**
 * Mock 评论数据
 */
const mockComments: Comment[] = [
  {
    id: 'comment_001',
    postId: 'post_001',
    userId: 'user_002',
    userName: '旅行达人',
    userAvatar: '/static/images/default-avatar.png',
    content: '很棒的攻略！收藏了，准备下个月去',
    likeCount: 5,
    replyCount: 2,
    createdAt: '2025-11-26T10:00:00+08:00',
    replies: [
      {
        id: 'comment_002',
        postId: 'post_001',
        userId: 'user_001',
        userName: '房车旅行家',
        userAvatar: '/static/images/default-avatar.png',
        content: '谢谢支持！有问题随时问我',
        replyToId: 'comment_001',
        replyToUserId: 'user_002',
        replyToUserName: '旅行达人',
        likeCount: 2,
        createdAt: '2025-11-26T10:05:00+08:00'
      }
    ]
  }
]

/**
 * Mock 用户主页数据
 */
const mockUserProfile: UserProfile = {
  id: 'user_001',
  userName: '房车旅行家',
  avatar: '/static/images/default-avatar.png',
  bio: '热爱房车旅行，分享旅途故事和攻略',
  postCount: 25,
  followerCount: 1250,
  followingCount: 320,
  likeCount: 5680,
  isFollowing: false,
  posts: mockPosts
}

// ==================== API 函数 ====================

/**
 * 发布内容
 * @status 联调中 - 使用真实API
 */
export const createPost = async (params: CreatePostParams): Promise<CommunityPost> => {
  const { request } = await import('@/utils/request')
  const response = await request<CommunityPost>({
    url: '/community/posts',
    method: 'POST',
    data: params
  })
  return response.data
}

/**
 * 获取内容详情
 * @status 联调中 - 使用真实API
 */
export const getPostDetail = async (id: string): Promise<CommunityPost> => {
  const { request } = await import('@/utils/request')
  const response = await request<CommunityPost>({
    url: `/community/posts/${id}`,
    method: 'GET'
  })
  return response.data
}

/**
 * 点赞内容
 * @status 联调中 - 使用真实API
 */
export const likePost = async (id: string): Promise<{ isLiked: boolean; likeCount: number }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ isLiked: boolean; likeCount: number }>({
    url: `/community/posts/${id}/like`,
    method: 'POST'
  })
  return response.data
}

/**
 * 取消点赞
 * @status 联调中 - 使用真实API
 */
export const unlikePost = async (id: string): Promise<{ isLiked: boolean; likeCount: number }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ isLiked: boolean; likeCount: number }>({
    url: `/community/posts/${id}/unlike`,
    method: 'POST'
  })
  return response.data
}

/**
 * 评论内容
 * @status 联调中 - 使用真实API
 */
export const commentPost = async (id: string, params: CommentParams): Promise<Comment> => {
  const { request } = await import('@/utils/request')
  const response = await request<Comment>({
    url: `/community/posts/${id}/comments`,
    method: 'POST',
    data: params
  })
  return response.data
}

/**
 * 获取评论列表
 * @status 联调中 - 使用真实API
 */
export const getComments = async (
  id: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<{ list: Comment[]; total: number; hasMore: boolean }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ list: Comment[]; total: number; hasMore: boolean }>({
    url: `/community/posts/${id}/comments`,
    method: 'GET',
    data: params
  })
  return response.data
}

/**
 * 收藏内容
 * @status 联调中 - 使用真实API
 */
export const favoritePost = async (id: string): Promise<{ isFavorited: boolean; favoriteCount: number }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ isFavorited: boolean; favoriteCount: number }>({
    url: `/community/posts/${id}/favorite`,
    method: 'POST'
  })
  return response.data
}

/**
 * 取消收藏
 * @status 联调中 - 使用真实API
 */
export const unfavoritePost = async (id: string): Promise<{ isFavorited: boolean; favoriteCount: number }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ isFavorited: boolean; favoriteCount: number }>({
    url: `/community/posts/${id}/unfavorite`,
    method: 'POST'
  })
  return response.data
}

/**
 * 获取用户主页
 * @status 联调中 - 使用真实API
 */
export const getUserProfile = async (id: string): Promise<UserProfile> => {
  const { request } = await import('@/utils/request')
  const response = await request<UserProfile>({
    url: `/community/users/${id}/profile`,
    method: 'GET'
  })
  return response.data
}

/**
 * 关注用户
 * @status 联调中 - 使用真实API
 */
export const followUser = async (id: string): Promise<{ isFollowing: boolean; followerCount: number }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ isFollowing: boolean; followerCount: number }>({
    url: `/community/users/${id}/follow`,
    method: 'POST'
  })
  return response.data
}

/**
 * 取消关注
 * @status 联调中 - 使用真实API
 */
export const unfollowUser = async (id: string): Promise<{ isFollowing: boolean; followerCount: number }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ isFollowing: boolean; followerCount: number }>({
    url: `/community/users/${id}/unfollow`,
    method: 'POST'
  })
  return response.data
}

/**
 * 上传图片
 * @status 联调中 - 使用真实API
 */
export const uploadImage = async (filePath: string): Promise<{ url: string; thumbnail: string }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ url: string; thumbnail: string }>({
    url: '/community/upload/image',
    method: 'POST',
    data: { filePath }
  })
  return response.data
}

/**
 * 获取帖子列表（用于社区首页）
 * @status 联调中 - 使用真实API
 */
export const getPosts = async (params: {
  type?: PostType
  page?: number
  pageSize?: number
}): Promise<{ list: CommunityPost[]; total: number; hasMore: boolean }> => {
  const { request } = await import('@/utils/request')
  const response = await request<{ list: CommunityPost[]; total: number; hasMore: boolean }>({
    url: '/community/posts',
    method: 'GET',
    data: params
  })
  return response.data
}

/**
 * Mock 获取帖子列表（用于社区首页）
 * @deprecated 已切换为真实API,保留供参考
 */
export const mockGetPosts = async (params: {
  type?: PostType
  page?: number
  pageSize?: number
}): Promise<{ list: CommunityPost[]; total: number; hasMore: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredPosts = mockPosts
      if (params.type) {
        filteredPosts = mockPosts.filter(p => p.type === params.type)
      }
      resolve({
        list: filteredPosts,
        total: filteredPosts.length,
        hasMore: false
      })
    }, 300)
  })
}
