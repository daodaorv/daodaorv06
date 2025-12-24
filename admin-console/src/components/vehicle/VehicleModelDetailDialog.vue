<!-- 车型详情对话框 -->
<template>
  <el-dialog
    v-model="visible"
    title="车型详情"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- Tab 1: 基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <el-descriptions :column="2" border v-if="modelDetail">
            <el-descriptions-item label="车型名称">
              {{ modelDetail.modelName }}
            </el-descriptions-item>
            <el-descriptions-item label="品牌">
              {{ modelDetail.brandName }}
            </el-descriptions-item>
            <el-descriptions-item label="车辆类型">
              <el-tag size="small">
                {{ getVehicleTypeLabel(modelDetail.vehicleType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="modelDetail.status === 'active' ? 'success' : 'info'" size="small">
                {{ modelDetail.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="核载人数">
              {{ modelDetail.seats }} 人
            </el-descriptions-item>
            <el-descriptions-item label="床位数">
              {{ modelDetail.beds }} 张
            </el-descriptions-item>
            <el-descriptions-item label="车身尺寸">
              {{ modelDetail.length }}m × {{ modelDetail.width }}m × {{ modelDetail.height }}m
            </el-descriptions-item>
            <el-descriptions-item label="油箱容量">
              {{ modelDetail.fuelCapacity }} L
            </el-descriptions-item>
            <el-descriptions-item label="日租金">
              <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">
                ¥{{ modelDetail.dailyPrice }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="关联车辆数">
              {{ modelDetail.vehicleCount }} 辆
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(modelDetail.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(modelDetail.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="车型图片" :span="2">
              <el-image
                v-if="modelDetail.image"
                :src="modelDetail.image"
                :preview-src-list="[modelDetail.image]"
                fit="cover"
                style="width: 200px; height: 150px; border-radius: 4px;"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <span v-else>暂无图片</span>
            </el-descriptions-item>
            <el-descriptions-item label="车型描述" :span="2">
              <div v-html="modelDetail.description || '暂无描述'" style="max-height: 200px; overflow-y: auto;"></div>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- Tab 2: 价格历史 -->
        <el-tab-pane label="价格历史" name="priceHistory">
          <el-table
            :data="priceHistoryList"
            v-loading="priceHistoryLoading"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="changeDate" label="变更时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.changeDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="oldPrice" label="原价格" width="120">
              <template #default="{ row }">
                ¥{{ row.oldPrice }}
              </template>
            </el-table-column>
            <el-table-column prop="newPrice" label="新价格" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold;">
                  ¥{{ row.newPrice }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="priceChange" label="变更金额" width="120">
              <template #default="{ row }">
                <span :style="{ color: row.priceChange > 0 ? '#67c23a' : '#f56c6c' }">
                  {{ row.priceChange > 0 ? '+' : '' }}¥{{ row.priceChange }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="changeReason" label="变更原因" min-width="150" show-overflow-tooltip />
            <el-table-column prop="operatorName" label="操作人" width="100" />
          </el-table>
          <el-empty v-if="!priceHistoryLoading && priceHistoryList.length === 0" description="暂无价格历史记录" />
        </el-tab-pane>

        <!-- Tab 3: 关联车辆 -->
        <el-tab-pane label="关联车辆" name="relatedVehicles">
          <el-table
            :data="relatedVehiclesList"
            v-loading="relatedVehiclesLoading"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
            <el-table-column prop="ownershipType" label="所有权类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">
                  {{ getOwnershipTypeLabel(row.ownershipType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="storeName" label="所属门店" width="150" show-overflow-tooltip />
            <el-table-column prop="location" label="当前位置" min-width="150" show-overflow-tooltip />
            <el-table-column prop="dailyPrice" label="日租金" width="100">
              <template #default="{ row }">
                ¥{{ row.dailyPrice }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleViewVehicle(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!relatedVehiclesLoading && relatedVehiclesList.length === 0" description="暂无关联车辆" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="warning" @click="handleAdjustPrice">调整价格</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { useDateFormat, useErrorHandler } from '@/composables'
import { getVehicleModelDetail, getVehicles } from '@/api/vehicle'
import type { VehicleModel, Vehicle } from '@/api/vehicle'

// Props
interface Props {
  modelValue: boolean
  modelId: number | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  modelId: null,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'edit': [model: VehicleModel]
  'adjustPrice': [model: VehicleModel]
  'viewVehicle': [vehicle: Vehicle]
}>()

// Composables
const { formatDate } = useDateFormat()
const { handleApiError } = useErrorHandler()

// 响应式数据
const visible = ref(false)
const loading = ref(false)
const activeTab = ref('basic')
const modelDetail = ref<VehicleModel | null>(null)

// Tab 数据加载状态
const tabsLoaded = reactive({
  basic: false,
  priceHistory: false,
  relatedVehicles: false,
})

// 价格历史
const priceHistoryList = ref<any[]>([])
const priceHistoryLoading = ref(false)

// 关联车辆
const relatedVehiclesList = ref<Vehicle[]>([])
const relatedVehiclesLoading = ref(false)

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.modelId) {
    loadModelDetail()
  }
})

// 监听 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    // 关闭时重置数据
    resetData()
  }
})

// 加载车型详情
const loadModelDetail = async () => {
  if (!props.modelId) return

  loading.value = true
  try {
    const res = await getVehicleModelDetail(props.modelId)
    modelDetail.value = res.data
    tabsLoaded.basic = true
  } catch (error) {
    handleApiError(error, '加载车型详情失败')
  } finally {
    loading.value = false
  }
}

// Tab 切换
const handleTabChange = async (tabName: string | number) => {
  const tabNameStr = String(tabName)
  if (tabsLoaded[tabNameStr as keyof typeof tabsLoaded]) {
    return
  }

  switch (tabNameStr) {
    case 'priceHistory':
      await loadPriceHistory()
      break
    case 'relatedVehicles':
      await loadRelatedVehicles()
      break
  }
}

// 加载价格历史
const loadPriceHistory = async () => {
  if (!props.modelId) return

  priceHistoryLoading.value = true
  try {
    // Mock 数据 - 实际应该调用真实的 API
    await new Promise(resolve => setTimeout(resolve, 500))
    priceHistoryList.value = [
      {
        id: 1,
        changeDate: '2024-01-15 10:30:00',
        oldPrice: 500,
        newPrice: 550,
        priceChange: 50,
        changeReason: '市场价格调整',
        operatorName: '管理员',
      },
      {
        id: 2,
        changeDate: '2024-02-20 14:20:00',
        oldPrice: 550,
        newPrice: 600,
        priceChange: 50,
        changeReason: '旺季价格上调',
        operatorName: '管理员',
      },
    ]
    tabsLoaded.priceHistory = true
  } catch (error) {
    handleApiError(error, '加载价格历史失败')
  } finally {
    priceHistoryLoading.value = false
  }
}

// 加载关联车辆
const loadRelatedVehicles = async () => {
  if (!props.modelId) return

  relatedVehiclesLoading.value = true
  try {
    const res = await getVehicles({
      modelId: props.modelId,
      page: 1,
      pageSize: 100,
    })
    relatedVehiclesList.value = res.data.list
    tabsLoaded.relatedVehicles = true
  } catch (error) {
    handleApiError(error, '加载关联车辆失败')
  } finally {
    relatedVehiclesLoading.value = false
  }
}

// 获取车辆类型标签
const getVehicleTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    c_type: '自行式C型',
    b_type: '自行式B型',
    trailer: '拖挂式',
  }
  return typeMap[type] || type
}

// 获取所有权类型标签
const getOwnershipTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    platform: '平台自有',
    hosting: '托管',
    cooperative: '合作商',
  }
  return typeMap[type] || type
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    available: '可用',
    rented: '租用中',
    maintenance: '保养中',
    repair: '维修中',
    retired: '已退役',
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    available: 'success',
    rented: 'warning',
    maintenance: 'info',
    repair: 'danger',
    retired: 'info',
  }
  return typeMap[status] || 'info'
}

// 查看车辆详情
const handleViewVehicle = (vehicle: Vehicle) => {
  emit('viewVehicle', vehicle)
}

// 编辑
const handleEdit = () => {
  if (modelDetail.value) {
    emit('edit', modelDetail.value)
    visible.value = false
  }
}

// 调整价格
const handleAdjustPrice = () => {
  if (modelDetail.value) {
    emit('adjustPrice', modelDetail.value)
    visible.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 重置数据
const resetData = () => {
  activeTab.value = 'basic'
  modelDetail.value = null
  priceHistoryList.value = []
  relatedVehiclesList.value = []
  Object.keys(tabsLoaded).forEach(key => {
    tabsLoaded[key as keyof typeof tabsLoaded] = false
  })
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

:deep(.el-descriptions__label) {
  width: 120px;
}
</style>
