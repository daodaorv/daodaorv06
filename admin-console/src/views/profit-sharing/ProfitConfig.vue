<template>
  <div class="profit-config-container">
    <el-page-header @back="$router.back()" class="page-header">
      <template #content>
        <span class="page-title">分润配置管理</span>
      </template>
    </el-page-header>

    <el-alert title="配置说明" type="info" :closable="false" style="margin-bottom: 20px">
      <p>统一管理所有产品类型的分润配置，包括推广分润、托管分润、营地分润和旅游分润</p>
    </el-alert>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 推广分润配置 -->
      <el-tab-pane label="推广分润配置" name="promotion">
        <el-table :data="promotionConfigs" v-loading="loading" border stripe>
          <el-table-column prop="productType" label="产品类型" width="150">
            <template #default="{ row }">
              <el-tag :type="getProductTypeTag(row.productType)">
                {{ getProductTypeName(row.productType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level1Ratio" label="一级推广比例" width="130" align="right">
            <template #default="{ row }">{{ row.level1Ratio }}%</template>
          </el-table-column>
          <el-table-column prop="level2Ratio" label="二级推广比例" width="130" align="right">
            <template #default="{ row }">{{ row.level2Ratio }}%</template>
          </el-table-column>
          <el-table-column
            prop="plusMemberDirectReward"
            label="PLUS直推奖励"
            width="140"
            align="right"
          >
            <template #default="{ row }">¥{{ row.plusMemberDirectReward }}</template>
          </el-table-column>
          <el-table-column
            prop="plusMemberAssistReward"
            label="PLUS助力奖励"
            width="140"
            align="right"
          >
            <template #default="{ row }">¥{{ row.plusMemberAssistReward }}</template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" @change="handlePromotionStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="160" />
        </el-table>
      </el-tab-pane>

      <!-- 托管分润配置 -->
      <el-tab-pane label="托管分润配置" name="hosting">
        <el-table :data="hostingConfigs" v-loading="loading" border stripe>
          <el-table-column prop="hostingType" label="托管类型" width="150">
            <template #default="{ row }">
              <el-tag :type="getHostingTypeTag(row.hostingType)">
                {{ getHostingTypeName(row.hostingType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="baseRatio" label="基础比例" width="120" align="right">
            <template #default="{ row }">{{ row.baseRatio }}%</template>
          </el-table-column>
          <el-table-column prop="performanceBonus" label="绩效加成" min-width="300">
            <template #default="{ row }">
              <el-tag
                v-for="(bonus, index) in row.performanceBonus"
                :key="index"
                size="small"
                style="margin-right: 5px"
              >
                {{ bonus.metric }}>={{ bonus.threshold }}: +{{ bonus.bonusRatio }}%
              </el-tag>
              <span v-if="row.performanceBonus.length === 0">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" @change="handleHostingStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="160" />
        </el-table>
      </el-tab-pane>

      <!-- 营地分润配置 -->
      <el-tab-pane label="营地分润配置" name="campsite">
        <el-table :data="campsiteConfigs" v-loading="loading" border stripe>
          <el-table-column prop="cooperationType" label="合作类型" width="150">
            <template #default="{ row }">
              <el-tag>{{ getCooperationTypeName(row.cooperationType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="baseRatio" label="基础比例" width="120" align="right">
            <template #default="{ row }">{{ row.baseRatio }}%</template>
          </el-table-column>
          <el-table-column prop="bundleBonus" label="捆绑加成" width="120" align="right">
            <template #default="{ row }">{{ row.bundleBonus }}%</template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" @change="handleCampsiteStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="160" />
        </el-table>
      </el-tab-pane>

      <!-- 旅游分润配置 -->
      <el-tab-pane label="旅游分润配置" name="tour">
        <el-table :data="tourConfigs" v-loading="loading" border stripe>
          <el-table-column prop="productType" label="产品类型" width="150">
            <template #default="{ row }">
              <el-tag>{{ getTourProductTypeName(row.productType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="baseRatio" label="基础比例" width="120" align="right">
            <template #default="{ row }">{{ row.baseRatio }}%</template>
          </el-table-column>
          <el-table-column prop="crowdfundingRatio" label="众筹比例" width="120" align="right">
            <template #default="{ row }">{{ row.crowdfundingRatio }}%</template>
          </el-table-column>
          <el-table-column prop="satisfactionBonus" label="满意度加成" min-width="200">
            <template #default="{ row }">
              <el-tag
                v-for="(bonus, index) in row.satisfactionBonus"
                :key="index"
                size="small"
                style="margin-right: 5px"
              >
                评分≥{{ bonus.minRating }}: +{{ bonus.bonusRatio }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" @change="handleTourStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="160" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type {
  PromotionProfitConfig,
  HostingProfitConfig,
  CampsiteProfitConfig,
  TourProfitConfig,
  ProductType,
  HostingType,
  CampsiteCooperationType,
  TourProductType,
} from '@/types/profit'
import {
  getPromotionProfitConfigs,
  updatePromotionProfitConfig,
  getHostingProfitConfigs,
  updateHostingProfitConfig,
  getCampsiteProfitConfigs,
  updateCampsiteProfitConfig,
  getTourProfitConfigs,
  updateTourProfitConfig,
} from '@/api/profit'

const activeTab = ref('promotion')
const loading = ref(false)

const promotionConfigs = ref<PromotionProfitConfig[]>([])
const hostingConfigs = ref<HostingProfitConfig[]>([])
const campsiteConfigs = ref<CampsiteProfitConfig[]>([])
const tourConfigs = ref<TourProfitConfig[]>([])

const fetchAllConfigs = async () => {
  loading.value = true
  try {
    const [promotionRes, hostingRes, campsiteRes, tourRes] = await Promise.all([
      getPromotionProfitConfigs(),
      getHostingProfitConfigs(),
      getCampsiteProfitConfigs(),
      getTourProfitConfigs(),
    ])
    promotionConfigs.value = promotionRes.data
    hostingConfigs.value = hostingRes.data
    campsiteConfigs.value = campsiteRes.data
    tourConfigs.value = tourRes.data
  } catch (error) {
    console.error('获取配置失败:', error)
    ElMessage.error('获取配置失败')
  } finally {
    loading.value = false
  }
}

const handlePromotionStatusChange = async (row: PromotionProfitConfig) => {
  try {
    await updatePromotionProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const handleHostingStatusChange = async (row: HostingProfitConfig) => {
  try {
    await updateHostingProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const handleCampsiteStatusChange = async (row: CampsiteProfitConfig) => {
  try {
    await updateCampsiteProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const handleTourStatusChange = async (row: TourProfitConfig) => {
  try {
    await updateTourProfitConfig(row.id, { enabled: row.enabled })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.enabled = !row.enabled
  }
}

const getProductTypeName = (type: ProductType) => {
  const map: Record<ProductType, string> = {
    vehicle_rental: '房车租赁',
    campsite: '营地产品',
    tour: '房车旅游',
  }
  return map[type] || type
}

const getProductTypeTag = (type: ProductType) => {
  const map: Record<ProductType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    vehicle_rental: 'primary',
    campsite: 'success',
    tour: 'warning',
  }
  return map[type] || ''
}

const getHostingTypeName = (type: HostingType) => {
  const map: Record<HostingType, string> = {
    own_car: '自有车托管',
    new_car: '购车托管',
    crowdfunding: '众筹托管',
  }
  return map[type] || type
}

const getHostingTypeTag = (type: HostingType) => {
  const map: Record<HostingType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    own_car: 'primary',
    new_car: 'success',
    crowdfunding: 'warning',
  }
  return map[type] || ''
}

const getCooperationTypeName = (type: CampsiteCooperationType) => {
  const map: Record<CampsiteCooperationType, string> = {
    ground_cooperation: '地面合作',
    venue_rental: '场地租赁',
  }
  return map[type] || type
}

const getTourProductTypeName = (type: TourProductType) => {
  const map: Record<TourProductType, string> = {
    self_drive: '自驾线路',
    butler_route: '管家路线',
  }
  return map[type] || type
}

onMounted(() => {
  fetchAllConfigs()
})
</script>

<style scoped lang="scss">
.profit-config-container {
  padding: 20px;

  }
}
</style>
