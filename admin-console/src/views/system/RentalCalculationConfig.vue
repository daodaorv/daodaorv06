<template>
  <div class="rental-calculation-config">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>租金计算参数配置</span>
          <el-button type="danger" :icon="RefreshLeft" @click="handleResetAll">
            全部重置为默认值
          </el-button>
        </div>
      </template>

      <el-alert title="参数说明" type="info" :closable="false" style="margin-bottom: 20px">
        <p>这些参数用于车辆基础租金计算器。修改后将影响所有新的租金计算建议。</p>
        <p>已保存的车辆租金不会自动更新，需要重新使用计算器计算。</p>
      </el-alert>

      <!-- 财务参数 -->
      <el-divider content-position="left">
        <el-icon><Money /></el-icon>
        财务参数
      </el-divider>
      <el-table :data="financialConfigs" border style="margin-bottom: 30px">
        <el-table-column prop="configName" label="参数名称" width="200" />
        <el-table-column prop="description" label="说明" min-width="250" />
        <el-table-column label="当前值" width="200" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.configValue"
              :min="getMinValue(row.configKey)"
              :max="getMaxValue(row.configKey)"
              :step="getStep(row.configKey)"
              :precision="getPrecision(row.configKey)"
              :disabled="!row.isEditable"
              size="small"
              style="width: 150px"
              @change="handleValueChange(row)"
            />
            <span style="margin-left: 8px">{{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最后更新" width="180" align="center">
          <template #default="{ row }">
            <div style="font-size: 12px; color: #909399">
              <div>{{ formatDate(row.updatedAt) }}</div>
              <div>{{ row.updatedBy }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="Check"
              @click="handleSave(row)"
              :disabled="!row.isEditable"
            >
              保存
            </el-button>
            <el-button
              type="warning"
              link
              :icon="RefreshLeft"
              @click="handleReset(row)"
              :disabled="!row.isEditable"
            >
              重置
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 运营参数 -->
      <el-divider content-position="left">
        <el-icon><Operation /></el-icon>
        运营参数
      </el-divider>
      <el-table :data="operationalConfigs" border>
        <el-table-column prop="configName" label="参数名称" width="200" />
        <el-table-column prop="description" label="说明" min-width="250" />
        <el-table-column label="当前值" width="200" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.configValue"
              :min="getMinValue(row.configKey)"
              :max="getMaxValue(row.configKey)"
              :step="getStep(row.configKey)"
              :precision="getPrecision(row.configKey)"
              :disabled="!row.isEditable"
              size="small"
              style="width: 150px"
              @change="handleValueChange(row)"
            />
            <span style="margin-left: 8px">{{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最后更新" width="180" align="center">
          <template #default="{ row }">
            <div style="font-size: 12px; color: #909399">
              <div>{{ formatDate(row.updatedAt) }}</div>
              <div>{{ row.updatedBy }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :icon="Check"
              @click="handleSave(row)"
              :disabled="!row.isEditable"
            >
              保存
            </el-button>
            <el-button
              type="warning"
              link
              :icon="RefreshLeft"
              @click="handleReset(row)"
              :disabled="!row.isEditable"
            >
              重置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Money, Operation, RefreshLeft, Check } from '@element-plus/icons-vue'
import {
  getCalculationConfigs,
  updateCalculationConfig,
  resetCalculationConfig,
  resetAllCalculationConfigs,
} from '@/api/systemConfig'
import type { BaseRentalCalculationConfig } from '@/types/system'

// 配置数据
const allConfigs = ref<BaseRentalCalculationConfig[]>([])

// 按类别分组
const financialConfigs = computed(() => allConfigs.value.filter(c => c.category === 'financial'))
const operationalConfigs = computed(() =>
  allConfigs.value.filter(c => c.category === 'operational')
)

// 加载配置
const loadConfigs = async () => {
  try {
    const data = await getCalculationConfigs()
    allConfigs.value = data
  } catch (error) {
    ElMessage.error('加载配置失败')
    console.error(error)
  }
}

// 获取参数的最小值
const getMinValue = (configKey: string): number => {
  const minMap: Record<string, number> = {
    TARGET_ANNUAL_RETURN: 0.01,
    INVESTMENT_PERIOD: 1,
    RESIDUAL_VALUE_RATE: 0.1,
    ANNUAL_OPERATING_RATE: 0.1,
    OPERATING_COST_RATE: 0.1,
  }
  return minMap[configKey] || 0
}

// 获取参数的最大值
const getMaxValue = (configKey: string): number => {
  const maxMap: Record<string, number> = {
    TARGET_ANNUAL_RETURN: 0.5,
    INVESTMENT_PERIOD: 20,
    RESIDUAL_VALUE_RATE: 0.8,
    ANNUAL_OPERATING_RATE: 1.0,
    OPERATING_COST_RATE: 0.9,
  }
  return maxMap[configKey] || 100
}

// 获取步长
const getStep = (configKey: string): number => {
  if (configKey === 'INVESTMENT_PERIOD') {
    return 1
  }
  return 0.01
}

// 获取精度
const getPrecision = (configKey: string): number => {
  if (configKey === 'INVESTMENT_PERIOD') {
    return 0
  }
  return 2
}

// 值变化处理（仅用于实时验证）
const handleValueChange = (row: BaseRentalCalculationConfig) => {
  // 可以在这里添加实时验证逻辑
  console.log('Value changed:', row.configKey, row.configValue)
}

// 保存单个配置
const handleSave = async (row: BaseRentalCalculationConfig) => {
  try {
    await updateCalculationConfig(row.id, {
      configValue: row.configValue,
      updatedBy: '管理员', // TODO: 从用户上下文获取
    })
    ElMessage.success('保存成功')
    await loadConfigs() // 重新加载以获取更新时间
  } catch (error: unknown) {
    if (error instanceof Error) {
      ElMessage.error(error.message || '保存失败')
    } else {
      ElMessage.error('保存失败')
    }
    console.error(error)
  }
}

// 重置单个配置
const handleReset = async (row: BaseRentalCalculationConfig) => {
  try {
    await ElMessageBox.confirm(`确定要将"${row.configName}"重置为默认值吗？`, '确认重置', {
      type: 'warning',
    })

    await resetCalculationConfig(row.id)
    ElMessage.success('重置成功')
    await loadConfigs()
  } catch (error: unknown) {
    if (error === 'cancel') {
      return
    }
    if (error instanceof Error) {
      ElMessage.error(error.message || '重置失败')
    } else {
      ElMessage.error('重置失败')
    }
    console.error(error)
  }
}

// 重置所有配置
const handleResetAll = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有参数重置为默认值吗？此操作不可撤销！', '确认重置全部', {
      type: 'warning',
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
    })

    await resetAllCalculationConfigs()
    ElMessage.success('全部重置成功')
    await loadConfigs()
  } catch (error: unknown) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error('重置失败')
    console.error(error)
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 初始化
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped lang="scss">
.rental-calculation-config {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :deep(.el-divider__text) {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
