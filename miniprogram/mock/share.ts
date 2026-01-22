/**
 * 分享相关Mock数据
 */

import type { ShareAchievement, ShareStats } from '@/types/share'

// Mock 分享统计数据
export const mockShareStats: ShareStats = {
  totalShares: 128,
  totalViews: 1024,
  totalConversions: 56,
  todayShares: 5,
  todayViews: 42,
  weekShares: 28,
  weekViews: 256
}

// Mock 分享成就数据
export const mockShareAchievements: ShareAchievement[] = [
  {
    id: 'first_share',
    name: '初次分享',
    description: '完成第一次分享',
    icon: '🎯',
    unlocked: true,
    progress: 1,
    target: 1,
    unlockTime: '2025-01-15T10:30:00Z',
    reward: 10
  },
  {
    id: 'share_10',
    name: '分享达人',
    description: '累计分享10次',
    icon: '⭐',
    unlocked: true,
    progress: 10,
    target: 10,
    unlockTime: '2025-01-18T14:20:00Z',
    reward: 50
  },
  {
    id: 'share_50',
    name: '分享专家',
    description: '累计分享50次',
    icon: '🌟',
    unlocked: true,
    progress: 50,
    target: 50,
    unlockTime: '2025-01-20T09:15:00Z',
    reward: 200
  },
  {
    id: 'share_100',
    name: '分享大师',
    description: '累计分享100次',
    icon: '💫',
    unlocked: true,
    progress: 100,
    target: 100,
    unlockTime: '2025-01-21T08:00:00Z',
    reward: 500
  },
  {
    id: 'share_500',
    name: '分享王者',
    description: '累计分享500次',
    icon: '👑',
    unlocked: false,
    progress: 128,
    target: 500,
    reward: 2000
  },
  {
    id: 'conversion_10',
    name: '转化新星',
    description: '成功转化10位用户',
    icon: '🔥',
    unlocked: true,
    progress: 10,
    target: 10,
    unlockTime: '2025-01-19T16:45:00Z',
    reward: 100
  },
  {
    id: 'conversion_50',
    name: '转化高手',
    description: '成功转化50位用户',
    icon: '💎',
    unlocked: true,
    progress: 50,
    target: 50,
    unlockTime: '2025-01-20T20:30:00Z',
    reward: 500
  },
  {
    id: 'conversion_100',
    name: '转化大师',
    description: '成功转化100位用户',
    icon: '🏆',
    unlocked: false,
    progress: 56,
    target: 100,
    reward: 1000
  },
  {
    id: 'view_1000',
    name: '千人浏览',
    description: '分享内容被浏览1000次',
    icon: '👀',
    unlocked: true,
    progress: 1000,
    target: 1000,
    unlockTime: '2025-01-20T12:00:00Z',
    reward: 300
  },
  {
    id: 'view_10000',
    name: '万人围观',
    description: '分享内容被浏览10000次',
    icon: '🎪',
    unlocked: false,
    progress: 1024,
    target: 10000,
    reward: 2000
  }
]

// Mock 邀请记录
export const mockInviteRecords = [
  {
    id: 'inv_001',
    inviteeId: 'user_101',
    inviteeName: '张**',
    inviteeAvatar: 'https://picsum.photos/100/100?random=101',
    inviteTime: '2025-01-20T15:30:00Z',
    status: 'registered',
    reward: 10
  },
  {
    id: 'inv_002',
    inviteeId: 'user_102',
    inviteeName: '李**',
    inviteeAvatar: 'https://picsum.photos/100/100?random=102',
    inviteTime: '2025-01-19T10:20:00Z',
    status: 'ordered',
    reward: 50
  },
  {
    id: 'inv_003',
    inviteeId: 'user_103',
    inviteeName: '王**',
    inviteeAvatar: 'https://picsum.photos/100/100?random=103',
    inviteTime: '2025-01-18T08:45:00Z',
    status: 'ordered',
    reward: 50
  }
]

// Mock 邀请统计
export const mockInviteStats = {
  totalInvites: 56,
  registeredCount: 42,
  orderedCount: 28,
  totalReward: 1580,
  todayInvites: 3,
  weekInvites: 12
}
