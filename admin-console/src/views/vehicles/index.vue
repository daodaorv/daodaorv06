<!--
  车辆管理主页面
-->
<template>
  <div class="vehicles-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">车辆管理</h1>
        <p class="page-description">管理房车车辆信息、状态和维护记录</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          添加车辆
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in statsData" :key="stat.key">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :class="stat.color">
                <el-icon size="24"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="车辆搜索">
            <el-input
              v-model="filterForm.search"
              placeholder="搜索车牌号、品牌、型号"
              clearable
              @keyup.enter="handleSearch"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="车辆类型">
            <el-select v-model="filterForm.type" placeholder="请选择" clearable style="width: 150px">
              <el-option label="房车" value="rv_motorhome" />
              <el-option label="露营车" value="rv_camper" />
              <el-option label="拖挂式房车" value="rv_trailer" />
              <el-option label="A型房车" value="rv_class_a" />
              <el-option label="B型房车" value="rv_class_b" />
              <el-option label="C型房车" value="rv_class_c" />
              <el-option label="皮卡房车" value="rv_truck_camper" />
            </el-select>
          </el-form-item>
          <el-form-item label="车辆状态">
            <el-select v-model="filterForm.status" placeholder="请选择" clearable style="width: 120px">
              <el-option label="可用" value="available" />
              <el-option label="已租出" value="rented" />
              <el-option label="维护中" value="maintenance" />
              <el-option label="损坏" value="damaged" />
              <el-option label="退役" value="retired" />
              <el-option label="未激活" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item label="品牌">
            <el-select
              v-model="filterForm.brand"
              placeholder="请选择品牌"
              filterable
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="brand in brands"
                :key="brand.brand"
                :label="brand.brand"
                :value="brand.brand"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="位置">
            <el-select v-model="filterForm.location" placeholder="请选择" clearable style="width: 150px">
              <el-option
                v-for="location in locations"
                :key="location.location"
                :label="location.location"
                :value="location.location"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleResetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 车辆列表 -->
    <div class="vehicles-table">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>车辆列表</span>
            <div class="table-actions">
              <el-button-group>
                <el-button :type="viewMode === 'grid' ? 'primary' : ''" @click="viewMode = 'grid'">
                  <el-icon><Grid /></el-icon>
                </el-button>
                <el-button :type="viewMode === 'table' ? 'primary' : ''" @click="viewMode = 'table'">
                  <el-icon><List /></el-icon>
                </el-button>
              </el-button-group>
              <el-dropdown @command="handleBatchAction" v-if="selectedVehicles.length > 0">
                <el-button>
                  批量操作 ({{ selectedVehicles.length }})
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="available">设为可用</el-dropdown-item>
                    <el-dropdown-item command="maintenance">设为维护中</el-dropdown-item>
                    <el-dropdown-item command="inactive">设为未激活</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <!-- 表格视图 -->
        <el-table
          v-if="viewMode === 'table'"
          v-loading="loading"
          :data="vehicles"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="车辆信息" min-width="200">
            <template #default="{ row }">
              <div class="vehicle-info">
                <el-image
                  :src="getMainImage(row.images)"
                  :alt="row.brand + ' ' + row.model"
                  class="vehicle-thumb"
                  fit="cover"
                  lazy
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="vehicle-basic">
                  <div class="vehicle-brand-model">{{ row.brand }} {{ row.model }}</div>
                  <div class="vehicle-license">{{ row.licensePlate }}</div>
                  <div class="vehicle-vin">VIN: {{ row.vin }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ getVehicleTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="位置" width="120" />
          <el-table-column label="价格" width="150">
            <template #default="{ row }">
              <div class="price-info">
                <div>¥{{ row.dailyRate }}/天</div>
                <div class="text-xs text-gray-500">¥{{ row.weeklyRate }}/周</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="mileage" label="里程" width="100">
            <template #default="{ row }">
              {{ row.mileage.toLocaleString() }} km
            </template>
          </el-table-column>
          <el-table-column prop="year" label="年份" width="80" />
          <el-table-column label="评分" width="80">
            <template #default="{ row }">
              <div class="rating">
                <el-rate
                  :model-value="row.averageRating || 0"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-dropdown trigger="click" @command="(action) => handleAction(action, row)">
                  <el-button size="small">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="availability">可用性</el-dropdown-item>
                      <el-dropdown-item command="maintenance">维护</el-dropdown-item>
                      <el-dropdown-item command="bookings">预约</el-dropdown-item>
                      <el-dropdown-item command="reviews">评价</el-dropdown-item>
                      <el-dropdown-item command="duplicate">复制</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 网格视图 -->
        <div v-else class="vehicles-grid">
          <el-row :gutter="20">
            <el-col
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card class="vehicle-card" :body-style="{ padding: '0px' }">
                <div class="vehicle-image">
                  <el-image
                    :src="getMainImage(vehicle.images)"
                    :alt="vehicle.brand + ' ' + vehicle.model"
                    class="vehicle-photo"
                    fit="cover"
                    lazy
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="vehicle-status">
                    <el-tag :type="getStatusType(vehicle.status)" size="small">
                      {{ getStatusText(vehicle.status) }}
                    </el-tag>
                  </div>
                </div>
                <div class="vehicle-content">
                  <h3 class="vehicle-title">{{ vehicle.brand }} {{ vehicle.model }}</h3>
                  <p class="vehicle-meta">
                    <span>{{ vehicle.licensePlate }}</span>
                    <span>{{ vehicle.year }}年</span>
                    <span>{{ vehicle.mileage.toLocaleString() }}km</span>
                  </p>
                  <div class="vehicle-price">
                    <span class="price">¥{{ vehicle.dailyRate }}</span>
                    <span class="unit">/天</span>
                  </div>
                  <div class="vehicle-actions">
                    <el-button size="small" @click="handleView(vehicle)">查看</el-button>
                    <el-button size="small" type="primary" @click="handleEdit(vehicle)">编辑</el-button>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="vehicles.length === 0 && !loading"
          description="暂无车辆数据"
        >
          <el-button type="primary" @click="handleCreate">
            添加第一辆车
          </el-button>
        </el-empty>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 车辆详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="车辆详情"
      width="80%"
      :destroy-on-close="true"
    >
      <div v-if="currentVehicle" class="vehicle-detail">
        <!-- 车辆基本信息 -->
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="品牌">{{ currentVehicle.brand }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ currentVehicle.model }}</el-descriptions-item>
          <el-descriptions-item label="年份">{{ currentVehicle.year }}</el-descriptions-item>
          <el-descriptions-item label="车牌号">{{ currentVehicle.licensePlate }}</el-descriptions-item>
          <el-descriptions-item label="VIN码">{{ currentVehicle.vin }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag>{{ getVehicleTypeText(currentVehicle.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentVehicle.status)">
              {{ getStatusText(currentVehicle.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="位置">{{ currentVehicle.location }}</el-descriptions-item>
          <el-descriptions-item label="里程">{{ currentVehicle.mileage.toLocaleString() }} km</el-descriptions-item>
        </el-descriptions>

        <!-- 价格信息 -->
        <el-descriptions title="价格信息" :column="3" border style="margin-top: 20px">
          <el-descriptions-item label="日租金">¥{{ currentVehicle.dailyRate }}</el-descriptions-item>
          <el-descriptions-item label="周租金">¥{{ currentVehicle.weeklyRate }}</el-descriptions-item>
          <el-descriptions-item label="月租金">¥{{ currentVehicle.monthlyRate }}</el-descriptions-item>
          <el-descriptions-item label="押金">¥{{ currentVehicle.deposit }}</el-descriptions-item>
        </el-descriptions>

        <!-- 规格信息 -->
        <el-descriptions title="规格信息" :column="3" border style="margin-top: 20px">
          <el-descriptions-item label="长度">{{ currentVehicle.specifications.length }}米</el-descriptions-item>
          <el-descriptions-item label="宽度">{{ currentVehicle.specifications.width }}米</el-descriptions-item>
          <el-descriptions-item label="高度">{{ currentVehicle.specifications.height }}米</el-descriptions-item>
          <el-descriptions-item label="座位数">{{ currentVehicle.specifications.seats }}个</el-descriptions-item>
          <el-descriptions-item label="床位数">{{ currentVehicle.specifications.beds }}个</el-descriptions-item>
          <el-descriptions-item label="载重">{{ currentVehicle.specifications.payload }}kg</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  Grid,
  List,
  ArrowDown,
  View,
  Edit,
  MoreFilled,
  Picture,
  Truck,
  Tools,
  User,
  TrendCharts
} from '@element-plus/icons-vue'
import { vehicleApi } from '@/api/vehicle'
import type { Vehicle, VehicleStats, VehicleListParams } from '@/types/vehicle'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const vehicles = ref<Vehicle[]>([])
const total = ref(0)
const brands = ref<{ brand: string; count: number }[]>([])
const locations = ref<{ location: string; count: number }[]>([])
const statsData = ref<any[]>([])
const viewMode = ref<'table' | 'grid'>('table')
const detailVisible = ref(false)
const currentVehicle = ref<Vehicle | null>(null)
const selectedVehicles = ref<string[]>([])

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 筛选表单
const filterForm = reactive<VehicleListParams>({
  search: '',
  type: undefined,
  status: undefined,
  brand: '',
  location: ''
})

// 统计数据
const stats = ref<VehicleStats>({
  total: 0,
  available: 0,
  rented: 0,
  maintenance: 0,
  damaged: 0,
  retired: 0,
  inactive: 0,
  byType: {} as any,
  averageDailyRate: 0,
  totalMileage: 0
})

// 状态类型映射
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    available: 'success',
    rented: 'warning',
    maintenance: 'info',
    damaged: 'danger',
    retired: 'info',
    inactive: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    available: '可用',
    rented: '已租出',
    maintenance: '维护中',
    damaged: '损坏',
    retired: '退役',
    inactive: '未激活'
  }
  return textMap[status] || '未知'
}

const getVehicleTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    rv_motorhome: '房车',
    rv_camper: '露营车',
    rv_trailer: '拖挂式房车',
    rv_class_a: 'A型房车',
    rv_class_b: 'B型房车',
    rv_class_c: 'C型房车',
    rv_truck_camper: '皮卡房车'
  }
  return typeMap[type] || '其他'
}

// 获取主图片
const getMainImage = (images: Vehicle['images']) => {
  const mainImage = images.find(img => img.isMain)
  return mainImage?.url || images[0]?.url || ''
}

// 加载车辆列表
const loadVehicles = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }
    const response = await vehicleApi.getVehicles(params)
    vehicles.value = response.data
    total.value = response.meta?.total || 0
  } catch (error) {
    console.error('加载车辆列表失败:', error)
    ElMessage.error('加载车辆列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await vehicleApi.getVehicleStats()
    stats.value = response.data

    // 转换为卡片数据
    statsData.value = [
      {
        key: 'total',
        label: '总车辆',
        value: stats.value.total,
        icon: 'Truck',
        color: 'blue'
      },
      {
        key: 'available',
        label: '可用',
        value: stats.value.available,
        icon: 'User',
        color: 'green'
      },
      {
        key: 'rented',
        label: '已租出',
        value: stats.value.rented,
        icon: 'TrendCharts',
        color: 'orange'
      },
      {
        key: 'maintenance',
        label: '维护中',
        value: stats.value.maintenance,
        icon: 'Tools',
        color: 'red'
      }
    ]
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载品牌列表
const loadBrands = async () => {
  try {
    const response = await vehicleApi.getVehicleBrands()
    brands.value = response.data
  } catch (error) {
    console.error('加载品牌列表失败:', error)
  }
}

// 加载位置列表
const loadLocations = async () => {
  try {
    const response = await vehicleApi.getVehicleLocations()
    locations.value = response.data
  } catch (error) {
    console.error('加载位置列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadVehicles()
}

// 重置筛选
const handleResetFilter = () => {
  Object.assign(filterForm, {
    search: '',
    type: undefined,
    status: undefined,
    brand: '',
    location: ''
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadVehicles()
  loadStats()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadVehicles()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadVehicles()
}

// 选择变更
const handleSelectionChange = (selected: Vehicle[]) => {
  selectedVehicles.value = selected.map(item => item.id)
}

// 创建车辆
const handleCreate = () => {
  router.push('/vehicles/create')
}

// 查看车辆
const handleView = (vehicle: Vehicle) => {
  currentVehicle.value = vehicle
  detailVisible.value = true
}

// 编辑车辆
const handleEdit = (vehicle: Vehicle) => {
  router.push(`/vehicles/${vehicle.id}/edit`)
}

// 批量操作
const handleBatchAction = async (action: string) => {
  if (selectedVehicles.value.length === 0) {
    ElMessage.warning('请选择要操作的车辆')
    return
  }

  try {
    switch (action) {
      case 'available':
      case 'maintenance':
      case 'inactive':
        await vehicleApi.batchUpdateStatus(selectedVehicles.value, action as any)
        ElMessage.success('批量更新状态成功')
        break
      case 'delete':
        await ElMessageBox.confirm('确定要删除选中的车辆吗？此操作不可恢复。', '确认删除', {
          type: 'warning'
        })
        await vehicleApi.batchDelete(selectedVehicles.value)
        ElMessage.success('批量删除成功')
        break
    }
    loadVehicles()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量操作失败:', error)
      ElMessage.error('批量操作失败')
    }
  }
}

// 单个操作
const handleAction = async (action: string, vehicle: Vehicle) => {
  switch (action) {
    case 'availability':
      router.push(`/vehicles/${vehicle.id}/availability`)
      break
    case 'maintenance':
      router.push(`/vehicles/${vehicle.id}/maintenance`)
      break
    case 'bookings':
      router.push(`/vehicles/${vehicle.id}/bookings`)
      break
    case 'reviews':
      router.push(`/vehicles/${vehicle.id}/reviews`)
      break
    case 'duplicate':
      // TODO: 实现复制车辆功能
      ElMessage.info('功能开发中')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(`确定要删除车辆"${vehicle.brand} ${vehicle.model}"吗？`, '确认删除', {
          type: 'warning'
        })
        await vehicleApi.deleteVehicle(vehicle.id)
        ElMessage.success('删除成功')
        loadVehicles()
        loadStats()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除车辆失败:', error)
          ElMessage.error('删除车辆失败')
        }
      }
      break
  }
}

// 生命周期
onMounted(() => {
  loadVehicles()
  loadStats()
  loadBrands()
  loadLocations()
})
</script>

<style lang="scss" scoped>
.vehicles-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .header-content {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .page-description {
        margin: 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          &.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          &.green { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          &.orange { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
          &.red { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
          }
        }
      }
    }
  }

  .filter-section {
    margin-bottom: 20px;
  }

  .vehicles-table {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .table-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .vehicle-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .vehicle-thumb {
        width: 60px;
        height: 45px;
        border-radius: 6px;
        overflow: hidden;

        .image-error {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--el-fill-color-light);
          color: var(--el-text-color-placeholder);
        }
      }

      .vehicle-basic {
        .vehicle-brand-model {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .vehicle-license,
        .vehicle-vin {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .price-info {
      .text-xs {
        font-size: 12px;
      }
    }

    .vehicles-grid {
      margin-top: 20px;

      .vehicle-card {
        margin-bottom: 20px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .vehicle-image {
          position: relative;
          height: 200px;
          overflow: hidden;

          .vehicle-photo {
            width: 100%;
            height: 100%;
          }

          .image-error {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--el-fill-color-light);
            color: var(--el-text-color-placeholder);
          }

          .vehicle-status {
            position: absolute;
            top: 12px;
            right: 12px;
          }
        }

        .vehicle-content {
          padding: 16px;

          .vehicle-title {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          .vehicle-meta {
            margin: 0 0 12px 0;
            font-size: 13px;
            color: var(--el-text-color-secondary);
            display: flex;
            gap: 12px;
          }

          .vehicle-price {
            margin-bottom: 16px;

            .price {
              font-size: 20px;
              font-weight: 600;
              color: var(--el-color-primary);
            }

            .unit {
              font-size: 14px;
              color: var(--el-text-color-secondary);
            }
          }

          .vehicle-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .vehicle-detail {
    .text-xs {
      font-size: 12px;
    }
  }
}
</style>