<!-- 车辆详情对话框 -->
<template>
  <el-dialog
    v-model="visible"
    title="车辆详情"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- Tab 1: 基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <el-descriptions :column="2" border v-if="vehicleDetail">
            <el-descriptions-item label="车牌号">
              <span style="font-weight: bold; font-size: 16px;">
                {{ vehicleDetail.vehicleNumber }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="车型">
              {{ vehicleDetail.modelName }}
            </el-descriptions-item>
            <el-descriptions-item label="所有权类型">
              <el-tag size="small">
                {{ getOwnershipTypeLabel(vehicleDetail.ownershipType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="车辆状态">
              <el-tag :type="getStatusTagType(vehicleDetail.status)" size="small">
                {{ getStatusLabel(vehicleDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所属门店">
              {{ vehicleDetail.storeName }}
            </el-descriptions-item>
            <el-descriptions-item label="当前位置">
              {{ vehicleDetail.location || '暂无' }}
            </el-descriptions-item>
            <el-descriptions-item label="购入日期">
              {{ formatDate(vehicleDetail.purchaseDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="购入价格">
              <span style="color: #909399;">
                ¥{{ vehicleDetail.purchasePrice?.toLocaleString() }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="当前里程">
              {{ vehicleDetail.currentMileage?.toLocaleString() }} km
            </el-descriptions-item>
            <el-descriptions-item label="车况评级">
              <el-tag :type="getConditionGradeTagType(vehicleDetail.conditionGrade)" size="small">
                {{ vehicleDetail.conditionGrade }}级
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="日租金">
              <span style="color: #f56c6c; font-weight: bold; font-size: 18px;">
                ¥{{ vehicleDetail.dailyPrice }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="价格来源">
              <el-tag size="small">
                {{ getPriceSourceLabel(vehicleDetail.priceSource) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(vehicleDetail.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(vehicleDetail.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="车辆图片" :span="2">
              <el-carousel v-if="vehicleDetail.images && vehicleDetail.images.length > 0" height="200px" indicator-position="outside">
                <el-carousel-item v-for="(image, index) in vehicleDetail.images" :key="index">
                  <el-image
                    :src="image"
                    :preview-src-list="vehicleDetail.images"
                    :initial-index="index"
                    fit="contain"
                    style="width: 100%; height: 200px;"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </el-carousel-item>
              </el-carousel>
              <span v-else>暂无图片</span>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ vehicleDetail.remark || '暂无备注' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- Tab 2: 价格历史 -->
        <el-tab-pane label="价格历史" name="priceHistory">
          <VehiclePriceHistory
            v-if="tabsLoaded.priceHistory && props.vehicleId !== null"
            :vehicle-id="props.vehicleId"
            :vehicle-number="vehicleDetail?.vehicleNumber"
          />
        </el-tab-pane>

        <!-- Tab 3: 保险信息 -->
        <el-tab-pane label="保险信息" name="insurance">
          <div v-if="tabsLoaded.insurance" v-loading="insuranceLoading">
            <!-- 统计卡片 -->
            <InsuranceSummaryCard
              :active-count="insuranceStats.activeCount"
              :expiring-count="insuranceStats.expiringCount"
              :expired-count="insuranceStats.expiredCount"
            />

            <!-- 保险记录表格 -->
            <el-table
              :data="insuranceList"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column prop="insuranceType" label="保险类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getInsuranceTypeTag(row.insuranceType)" size="small">
                    {{ getInsuranceTypeLabel(row.insuranceType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="insuranceCompany" label="保险公司" width="150" show-overflow-tooltip />
              <el-table-column prop="policyNumber" label="保单号" width="150" show-overflow-tooltip />
              <el-table-column prop="startDate" label="生效日期" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.startDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="endDate" label="到期日期" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.endDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="premium" label="保费" width="100">
                <template #default="{ row }">
                  ¥{{ row.premium.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getInsuranceStatusTag(row.status)" size="small">
                    {{ getInsuranceStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleViewInsurance(row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <el-empty v-if="insuranceList.length === 0" description="暂无保险记录" />

            <!-- 跳转按钮 -->
            <div style="margin-top: 16px; text-align: right;">
              <el-button type="primary" @click="handleJumpToInsurance">
                跳转到保险管理
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 4: 维保记录 -->
        <el-tab-pane label="维保记录" name="maintenance">
          <div v-if="tabsLoaded.maintenance" v-loading="maintenanceLoading">
            <!-- 统计卡片 -->
            <MaintenanceSummaryCard
              :planned-count="maintenanceStats.plannedCount"
              :in-progress-count="maintenanceStats.inProgressCount"
              :completed-count="maintenanceStats.completedCount"
            />

            <!-- 维保记录表格 -->
            <el-table
              :data="maintenanceList"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column prop="type" label="维保类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getMaintenanceTypeTag(row.type)" size="small">
                    {{ getMaintenanceTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="维保内容" min-width="150" show-overflow-tooltip />
              <el-table-column prop="serviceProvider" label="服务商" width="150" show-overflow-tooltip />
              <el-table-column prop="maintenanceDate" label="计划日期" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.maintenanceDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="completionDate" label="完成日期" width="120">
                <template #default="{ row }">
                  {{ row.completionDate ? formatDate(row.completionDate) : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="cost" label="费用" width="100">
                <template #default="{ row }">
                  ¥{{ row.totalCost.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getMaintenanceStatusTag(row.status)" size="small">
                    {{ getMaintenanceStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleViewMaintenance(row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <el-empty v-if="maintenanceList.length === 0" description="暂无维保记录" />

            <!-- 跳转按钮 -->
            <div style="margin-top: 16px; text-align: right;">
              <el-button type="primary" @click="handleJumpToMaintenance">
                跳转到维保管理
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 5: 违章记录 -->
        <el-tab-pane label="违章记录" name="violation">
          <div v-if="tabsLoaded.violation" v-loading="violationLoading">
            <!-- 统计卡片 -->
            <ViolationSummaryCard
              :pending-count="violationStats.pendingCount"
              :processing-count="violationStats.processingCount"
              :paid-count="violationStats.paidCount"
            />

            <!-- 违章记录表格 -->
            <el-table
              :data="violationList"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column prop="violationType" label="违章类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getViolationTypeTag(row.violationType)" size="small">
                    {{ getViolationTypeLabel(row.violationType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="violationDate" label="违章日期" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.violationDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="violationLocation" label="违章地点" min-width="150" show-overflow-tooltip />
              <el-table-column prop="penaltyPoints" label="扣分" width="80">
                <template #default="{ row }">
                  {{ row.penaltyPoints }} 分
                </template>
              </el-table-column>
              <el-table-column prop="fineAmount" label="罚款" width="100">
                <template #default="{ row }">
                  ¥{{ row.fineAmount.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getViolationStatusTag(row.status)" size="small">
                    {{ getViolationStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleViewViolation(row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <el-empty v-if="violationList.length === 0" description="暂无违章记录" />

            <!-- 跳转按钮 -->
            <div style="margin-top: 16px; text-align: right;">
              <el-button type="primary" @click="handleJumpToViolation">
                跳转到违章管理
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 保险详情子对话框 -->
  <el-dialog
    v-model="insuranceDetailDialogVisible"
    title="保险记录详情"
    width="800px"
    append-to-body
  >
    <el-descriptions :column="2" border v-if="currentInsuranceRecord">
      <el-descriptions-item label="车牌号">
        {{ vehicleDetail?.vehicleNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="车型">
        {{ vehicleDetail?.modelName }}
      </el-descriptions-item>
      <el-descriptions-item label="保险类型">
        <el-tag :type="getInsuranceTypeTag(currentInsuranceRecord.insuranceType)" size="small">
          {{ getInsuranceTypeLabel(currentInsuranceRecord.insuranceType) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="保险状态">
        <el-tag :type="getInsuranceStatusTag(currentInsuranceRecord.status)" size="small">
          {{ getInsuranceStatusLabel(currentInsuranceRecord.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="保险公司">
        {{ currentInsuranceRecord.insuranceCompany }}
      </el-descriptions-item>
      <el-descriptions-item label="保单号">
        {{ currentInsuranceRecord.policyNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="生效日期">
        {{ formatDate(currentInsuranceRecord.startDate) }}
      </el-descriptions-item>
      <el-descriptions-item label="到期日期">
        {{ formatDate(currentInsuranceRecord.endDate) }}
      </el-descriptions-item>
      <el-descriptions-item label="保费">
        ¥{{ currentInsuranceRecord.premium.toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="保险金额">
        ¥{{ currentInsuranceRecord.insuranceAmount.toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="保险项目" :span="2">
        {{ currentInsuranceRecord.coverageItems.map(item => item.name).join('、') }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ currentInsuranceRecord.remark || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <!-- 维保详情子对话框 -->
  <el-dialog
    v-model="maintenanceDetailDialogVisible"
    title="维保记录详情"
    width="800px"
    append-to-body
  >
    <el-descriptions :column="2" border v-if="currentMaintenanceRecord">
      <el-descriptions-item label="车牌号">
        {{ vehicleDetail?.vehicleNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="车型">
        {{ vehicleDetail?.modelName }}
      </el-descriptions-item>
      <el-descriptions-item label="维保类型">
        <el-tag :type="getMaintenanceTypeTag(currentMaintenanceRecord.type)" size="small">
          {{ getMaintenanceTypeLabel(currentMaintenanceRecord.type) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="维保状态">
        <el-tag :type="getMaintenanceStatusTag(currentMaintenanceRecord.status)" size="small">
          {{ getMaintenanceStatusLabel(currentMaintenanceRecord.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="维保内容" :span="2">
        {{ currentMaintenanceRecord.description }}
      </el-descriptions-item>
      <el-descriptions-item label="服务商">
        {{ currentMaintenanceRecord.serviceProvider }}
      </el-descriptions-item>
      <el-descriptions-item label="服务地点">
        {{ currentMaintenanceRecord.serviceLocation || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="计划日期">
        {{ formatDate(currentMaintenanceRecord.maintenanceDate) }}
      </el-descriptions-item>
      <el-descriptions-item label="完成日期">
        {{ currentMaintenanceRecord.completionDate ? formatDate(currentMaintenanceRecord.completionDate) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="工时费">
        ¥{{ currentMaintenanceRecord.laborCost.toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="配件费">
        ¥{{ currentMaintenanceRecord.partsCost.toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="总费用">
        ¥{{ currentMaintenanceRecord.totalCost.toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="当前里程">
        {{ currentMaintenanceRecord.mileage }} km
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ currentMaintenanceRecord.remark || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <!-- 违章详情子对话框 -->
  <el-dialog
    v-model="violationDetailDialogVisible"
    title="违章记录详情"
    width="800px"
    append-to-body
  >
    <el-descriptions :column="2" border v-if="currentViolationRecord">
      <el-descriptions-item label="车牌号">
        {{ vehicleDetail?.vehicleNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="车型">
        {{ vehicleDetail?.modelName }}
      </el-descriptions-item>
      <el-descriptions-item label="违章类型">
        <el-tag :type="getViolationTypeTag(currentViolationRecord.violationType)" size="small">
          {{ getViolationTypeLabel(currentViolationRecord.violationType) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="违章状态">
        <el-tag :type="getViolationStatusTag(currentViolationRecord.status)" size="small">
          {{ getViolationStatusLabel(currentViolationRecord.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="违章代码">
        {{ currentViolationRecord.violationCode }}
      </el-descriptions-item>
      <el-descriptions-item label="违章日期">
        {{ formatDate(currentViolationRecord.violationDate) }}
      </el-descriptions-item>
      <el-descriptions-item label="违章地点" :span="2">
        {{ currentViolationRecord.violationLocation }}
      </el-descriptions-item>
      <el-descriptions-item label="违章描述" :span="2">
        {{ currentViolationRecord.violationDescription }}
      </el-descriptions-item>
      <el-descriptions-item label="扣分">
        {{ currentViolationRecord.penaltyPoints }} 分
      </el-descriptions-item>
      <el-descriptions-item label="罚款金额">
        ¥{{ currentViolationRecord.fineAmount.toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="驾驶员">
        {{ currentViolationRecord.driverName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="驾驶证号">
        {{ currentViolationRecord.driverLicense || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="处理日期">
        {{ currentViolationRecord.processDate ? formatDate(currentViolationRecord.processDate) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="缴款日期">
        {{ currentViolationRecord.paymentDate ? formatDate(currentViolationRecord.paymentDate) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="缴款方式">
        {{ currentViolationRecord.paymentMethod || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="处理人">
        {{ currentViolationRecord.handler || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ currentViolationRecord.remark || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useDateFormat, useErrorHandler } from '@/composables'
import {
  getVehicleDetail,
  deleteVehicle,
  getInsuranceRecords,
  getMaintenanceRecords,
  getViolationRecords,
  type InsuranceRecord,
  type MaintenanceRecord,
  type ViolationRecord,
} from '@/api/vehicle'
import type { Vehicle } from '@/api/vehicle'
import VehiclePriceHistory from './VehiclePriceHistory.vue'
import InsuranceSummaryCard from './InsuranceSummaryCard.vue'
import MaintenanceSummaryCard from './MaintenanceSummaryCard.vue'
import ViolationSummaryCard from './ViolationSummaryCard.vue'

// Router
const router = useRouter()

// Props
interface Props {
  modelValue: boolean
  vehicleId: number | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  vehicleId: null,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'edit': [vehicle: Vehicle]
  'refresh': []
}>()

// Composables
const { formatDate } = useDateFormat()
const { handleApiError } = useErrorHandler()

// 响应式数据
const visible = ref(false)
const loading = ref(false)
const activeTab = ref('basic')
const vehicleDetail = ref<Vehicle | null>(null)

// Tab 数据加载状态
const tabsLoaded = reactive({
  basic: false,
  priceHistory: false,
  insurance: false,
  maintenance: false,
  violation: false,
})

// 保险信息数据
const insuranceList = ref<InsuranceRecord[]>([])
const insuranceLoading = ref(false)
const insuranceStats = reactive({
  activeCount: 0,
  expiringCount: 0,
  expiredCount: 0,
})
const insuranceDetailDialogVisible = ref(false)
const currentInsuranceRecord = ref<InsuranceRecord | null>(null)

// 维保记录数据
const maintenanceList = ref<MaintenanceRecord[]>([])
const maintenanceLoading = ref(false)
const maintenanceStats = reactive({
  plannedCount: 0,
  inProgressCount: 0,
  completedCount: 0,
})
const maintenanceDetailDialogVisible = ref(false)
const currentMaintenanceRecord = ref<MaintenanceRecord | null>(null)

// 违章记录数据
const violationList = ref<ViolationRecord[]>([])
const violationLoading = ref(false)
const violationStats = reactive({
  pendingCount: 0,
  processingCount: 0,
  paidCount: 0,
})
const violationDetailDialogVisible = ref(false)
const currentViolationRecord = ref<ViolationRecord | null>(null)

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.vehicleId) {
    loadVehicleDetail()
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

// 加载车辆详情
const loadVehicleDetail = async () => {
  if (!props.vehicleId) return

  loading.value = true
  try {
    const res = await getVehicleDetail(props.vehicleId)
    vehicleDetail.value = res.data
    tabsLoaded.basic = true
  } catch (error) {
    handleApiError(error, '加载车辆详情失败')
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
      tabsLoaded.priceHistory = true
      break
    case 'insurance':
      await loadInsuranceInfo()
      break
    case 'maintenance':
      await loadMaintenanceInfo()
      break
    case 'violation':
      await loadViolationInfo()
      break
  }
}

// 加载保险信息
const loadInsuranceInfo = async () => {
  if (!props.vehicleId) return

  insuranceLoading.value = true
  try {
    const res = await getInsuranceRecords({
      vehicleId: props.vehicleId,
      page: 1,
      pageSize: 100,
    })
    insuranceList.value = res.data.list

    // 计算统计数据
    const now = new Date()
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    insuranceStats.activeCount = 0
    insuranceStats.expiringCount = 0
    insuranceStats.expiredCount = 0

    insuranceList.value.forEach(item => {
      const endDate = new Date(item.endDate)
      if (endDate < now) {
        insuranceStats.expiredCount++
      } else if (endDate <= thirtyDaysLater) {
        insuranceStats.expiringCount++
      } else {
        insuranceStats.activeCount++
      }
    })

    tabsLoaded.insurance = true
  } catch (error) {
    handleApiError(error, '加载保险信息失败')
  } finally {
    insuranceLoading.value = false
  }
}

// 加载维保记录
const loadMaintenanceInfo = async () => {
  if (!props.vehicleId) return

  maintenanceLoading.value = true
  try {
    const res = await getMaintenanceRecords({
      vehicleId: props.vehicleId,
      page: 1,
      pageSize: 100,
    })
    maintenanceList.value = res.data.list

    // 计算统计数据
    maintenanceStats.plannedCount = 0
    maintenanceStats.inProgressCount = 0
    maintenanceStats.completedCount = 0

    maintenanceList.value.forEach(item => {
      if (item.status === 'pending') {
        maintenanceStats.plannedCount++
      } else if (item.status === 'in_progress') {
        maintenanceStats.inProgressCount++
      } else if (item.status === 'completed') {
        maintenanceStats.completedCount++
      }
    })

    tabsLoaded.maintenance = true
  } catch (error) {
    handleApiError(error, '加载维保记录失败')
  } finally {
    maintenanceLoading.value = false
  }
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

// 获取车况评级标签类型
const getConditionGradeTagType = (grade: string): 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    A: 'success',
    B: 'success',
    C: 'warning',
    D: 'danger',
  }
  return typeMap[grade] || 'info'
}

// 获取价格来源标签
const getPriceSourceLabel = (source: string) => {
  const sourceMap: Record<string, string> = {
    calculated: '计算器计算',
    manual: '手动设置',
    inherited: '继承车型',
  }
  return sourceMap[source] || source
}

// 保险相关辅助函数
const getInsuranceTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    compulsory: '交强险',
    commercial: '商业险',
    combined: '组合险',
  }
  return labelMap[type] || type
}

const getInsuranceTypeTag = (type: string): 'danger' | 'primary' | 'success' | 'info' => {
  const tagMap: Record<string, 'danger' | 'primary' | 'success' | 'info'> = {
    compulsory: 'danger',
    commercial: 'primary',
    combined: 'success',
  }
  return tagMap[type] || 'info'
}

const getInsuranceStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '有效',
    expired: '已过期',
    cancelled: '已取消',
  }
  return labelMap[status] || status
}

const getInsuranceStatusTag = (status: string): 'success' | 'danger' | 'info' => {
  const tagMap: Record<string, 'success' | 'danger' | 'info'> = {
    active: 'success',
    expired: 'danger',
    cancelled: 'info',
  }
  return tagMap[status] || 'info'
}

// 查看保险详情
const handleViewInsurance = (record: InsuranceRecord) => {
  currentInsuranceRecord.value = record
  insuranceDetailDialogVisible.value = true
}

// 跳转到保险管理页面
const handleJumpToInsurance = () => {
  if (!vehicleDetail.value) return
  router.push({
    name: 'VehicleInsurance',
    query: {
      vehicleId: vehicleDetail.value.id,
      vehicleNumber: vehicleDetail.value.vehicleNumber,
    },
  })
  visible.value = false
}

// 维保相关辅助函数
const getMaintenanceTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    regular: '定期保养',
    repair: '维修',
    inspection: '检查',
    emergency: '紧急维修',
  }
  return labelMap[type] || type
}

const getMaintenanceTypeTag = (type: string): 'primary' | 'warning' | 'success' | 'danger' | 'info' => {
  const tagMap: Record<string, 'primary' | 'warning' | 'success' | 'danger' | 'info'> = {
    regular: 'primary',
    repair: 'warning',
    inspection: 'success',
    emergency: 'danger',
  }
  return tagMap[type] || 'info'
}

const getMaintenanceStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    planned: '计划中',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return labelMap[status] || status
}

const getMaintenanceStatusTag = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const tagMap: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return tagMap[status] || 'info'
}

// 查看维保详情
const handleViewMaintenance = (record: MaintenanceRecord) => {
  currentMaintenanceRecord.value = record
  maintenanceDetailDialogVisible.value = true
}

// 跳转到维保管理页面
const handleJumpToMaintenance = () => {
  if (!vehicleDetail.value) return
  router.push({
    name: 'VehicleMaintenance',
    query: {
      vehicleId: vehicleDetail.value.id,
      vehicleNumber: vehicleDetail.value.vehicleNumber,
    },
  })
  visible.value = false
}

// 加载违章记录
const loadViolationInfo = async () => {
  if (!props.vehicleId) return

  violationLoading.value = true
  try {
    const res = await getViolationRecords({
      vehicleId: props.vehicleId,
      page: 1,
      pageSize: 100,
    })
    violationList.value = res.data.list

    // 计算统计数据
    violationStats.pendingCount = 0
    violationStats.processingCount = 0
    violationStats.paidCount = 0

    violationList.value.forEach(item => {
      if (item.status === 'pending') {
        violationStats.pendingCount++
      } else if (item.status === 'processing') {
        violationStats.processingCount++
      } else if (item.status === 'paid') {
        violationStats.paidCount++
      }
    })

    tabsLoaded.violation = true
  } catch (error) {
    handleApiError(error, '加载违章记录失败')
  } finally {
    violationLoading.value = false
  }
}

// 违章相关辅助函数
const getViolationTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    speeding: '超速',
    illegal_parking: '违章停车',
    running_red_light: '闯红灯',
    illegal_lane_change: '违章变道',
    drunk_driving: '酒驾',
    other: '其他',
  }
  return labelMap[type] || type
}

const getViolationTypeTag = (type: string): 'danger' | 'warning' | 'primary' | 'info' => {
  const tagMap: Record<string, 'danger' | 'warning' | 'primary' | 'info'> = {
    speeding: 'warning',
    illegal_parking: 'primary',
    running_red_light: 'danger',
    illegal_lane_change: 'warning',
    drunk_driving: 'danger',
    other: 'info',
  }
  return tagMap[type] || 'info'
}

const getViolationStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    paid: '已缴款',
    appealing: '申诉中',
    cancelled: '已取消',
  }
  return labelMap[status] || status
}

const getViolationStatusTag = (status: string): 'warning' | 'primary' | 'success' | 'info' | 'danger' => {
  const tagMap: Record<string, 'warning' | 'primary' | 'success' | 'info' | 'danger'> = {
    pending: 'warning',
    processing: 'primary',
    paid: 'success',
    appealing: 'info',
    cancelled: 'danger',
  }
  return tagMap[status] || 'info'
}

// 查看违章详情
const handleViewViolation = (record: ViolationRecord) => {
  currentViolationRecord.value = record
  violationDetailDialogVisible.value = true
}

// 跳转到违章管理页面
const handleJumpToViolation = () => {
  if (!vehicleDetail.value) return
  router.push({
    name: 'VehicleViolations',
    query: {
      vehicleId: vehicleDetail.value.id,
      vehicleNumber: vehicleDetail.value.vehicleNumber,
    },
  })
  visible.value = false
}

// 编辑
const handleEdit = () => {
  if (vehicleDetail.value) {
    emit('edit', vehicleDetail.value)
    visible.value = false
  }
}

// 删除
const handleDelete = async () => {
  if (!vehicleDetail.value) return

  try {
    await ElMessageBox.confirm(
      `确定要删除车辆 "${vehicleDetail.value.vehicleNumber}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteVehicle(vehicleDetail.value.id)
    ElMessage.success('删除成功')
    visible.value = false
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 重置数据
const resetData = () => {
  activeTab.value = 'basic'
  vehicleDetail.value = null
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

:deep(.el-carousel__item) {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
</style>
