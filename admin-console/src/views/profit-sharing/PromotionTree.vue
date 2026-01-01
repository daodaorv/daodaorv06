<template>
  <div class="promotion-tree-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">推广关系树</span>
      </template>
    </el-page-header>

    <el-card class="main-card">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户">
            <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID或姓名"
              clearable
              style="width: 250px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计信息 -->
      <div v-if="treeData.length > 0" class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">总推广人数</div>
              <div class="stat-value">{{ statistics.totalCount }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">一级推广</div>
              <div class="stat-value">{{ statistics.level1Count }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">二级推广</div>
              <div class="stat-value">{{ statistics.level2Count }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">累计分润</div>
              <div class="stat-value profit">¥{{ formatNumber(statistics.totalProfit) }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 树形结构 -->
      <div v-if="treeData.length > 0" class="tree-section">
        <el-tree
          :data="treeData"
          :props="treeProps"
          :default-expand-all="false"
          node-key="id"
          class="promotion-tree"
        >
          <template #default="{ data }">
            <div class="tree-node">
              <div class="node-info">
                <el-avatar :size="32" class="node-avatar">
                  {{ data.userName?.charAt(0) || 'U' }}
                </el-avatar>
                <div class="node-details">
                  <div class="node-name">
                    {{ data.userName }}
                    <el-tag v-if="data.level === 1" type="primary" size="small">一级</el-tag>
                    <el-tag v-else-if="data.level === 2" type="success" size="small">二级</el-tag>
                    <el-tag v-else type="info" size="small">根节点</el-tag>
                  </div>
                  <div class="node-meta">
                    <span>ID: {{ data.userId }}</span>
                    <span v-if="data.profitAmount"
                      >分润: ¥{{ formatNumber(data.profitAmount) }}</span
                    >
                    <span v-if="data.createdAt">加入: {{ data.createdAt }}</span>
                  </div>
                </div>
              </div>
              <div class="node-actions">
                <el-button link type="primary" size="small" @click="handleViewUser(data)">
                  查看详情
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="请输入用户信息查询推广关系树" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { PromotionRelation } from '@/types/profit'
import { getPromotionTree } from '@/api/profit'

interface TreeNode {
  id: string
  userId: string
  userName: string
  level: number
  profitAmount?: number
  createdAt?: string
  children?: TreeNode[]
}

const loading = ref(false)

const searchForm = reactive({
  userId: '',
})

const treeData = ref<TreeNode[]>([])
const rawData = ref<PromotionRelation[]>([])

const treeProps = {
  children: 'children',
  label: 'userName',
}

const statistics = computed(() => {
  const level1Count = rawData.value.filter(item => item.level1PromoterUserId).length
  const level2Count = rawData.value.filter(item => item.level2PromoterUserId).length
  const totalProfit = rawData.value.reduce((sum, item) => sum + (item.profitAmount || 0), 0)

  return {
    totalCount: rawData.value.length,
    level1Count,
    level2Count,
    totalProfit,
  }
})

const buildTree = (relations: PromotionRelation[], rootUserId: string): TreeNode[] => {
  const level1Users = relations.filter(r => r.level1PromoterUserId === rootUserId)

  return level1Users.map(user => {
    const level2Users = relations.filter(r => r.level2PromoterUserId === user.userId)

    return {
      id: user.id,
      userId: user.userId,
      userName: user.userName,
      level: 1,
      profitAmount: user.profitAmount,
      createdAt: user.createdAt,
      children: level2Users.map(child => ({
        id: child.id,
        userId: child.userId,
        userName: child.userName,
        level: 2,
        profitAmount: child.profitAmount,
        createdAt: child.createdAt,
      })),
    }
  })
}

const handleSearch = async () => {
  if (!searchForm.userId.trim()) {
    ElMessage.warning('请输入用户ID或姓名')
    return
  }

  loading.value = true
  try {
    const res = await getPromotionTree(searchForm.userId)
    rawData.value = res.data
    treeData.value = buildTree(res.data, searchForm.userId)

    if (treeData.value.length === 0) {
      ElMessage.info('该用户暂无推广关系')
    }
  } catch (error) {
    console.error('获取推广关系树失败:', error)
    ElMessage.error('获取推广关系树失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.userId = ''
  treeData.value = []
  rawData.value = []
}

const handleViewUser = (data: TreeNode) => {
  ElMessage.info(`查看用户详情: ${data.userName}`)
}

const formatNumber = (num: number) => num.toFixed(2)
</script>

<style scoped lang="scss">
.promotion-tree-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    background: #fff;
    padding: 16px 20px;
    border-radius: 4px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .main-card {
    .search-section {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;
    }

    .stats-section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 4px;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;

          &.profit {
            color: #f56c6c;
          }
        }
      }
    }

    .tree-section {
      .promotion-tree {
        :deep(.el-tree-node__content) {
          height: auto;
          padding: 8px 0;
        }

        .tree-node {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.3s;

          &:hover {
            background-color: #f5f7fa;
          }

          .node-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;

            .node-avatar {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #fff;
              font-weight: 600;
            }

            .node-details {
              flex: 1;

              .node-name {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .node-meta {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 12px;
                color: #909399;

                span {
                  display: flex;
                  align-items: center;
                }
              }
            }
          }

          .node-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }
}
</style>
