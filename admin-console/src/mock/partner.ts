/**
 * 合作商管理 Mock 数据
 */

// ==================== 门店分润配置 Mock 数据 ====================

/**
 * Mock: 门店分润配置列表数据
 */
export const mockStoreProfitConfigs = [
  {
    id: 1,
    configType: 'global',
    configName: '全局默认分润配置',
    storeProfitRatio: 30,
    platformProfitRatio: 70,
    enabled: true,
    effectiveDate: '2025-01-01',
    description: '适用于所有合作商订单的默认分润比例',
    priority: 1,
    createdBy: '系统管理员',
    createdAt: '2025-01-01 10:00:00',
  },
  {
    id: 2,
    configType: 'store',
    targetId: 1,
    targetName: '杭州西湖门店',
    configName: '杭州西湖门店专属配置',
    storeProfitRatio: 35,
    platformProfitRatio: 65,
    enabled: true,
    effectiveDate: '2025-01-01',
    description: '杭州西湖门店的特殊分润比例',
    priority: 10,
    createdBy: '系统管理员',
    createdAt: '2025-01-01 10:00:00',
  },
]
