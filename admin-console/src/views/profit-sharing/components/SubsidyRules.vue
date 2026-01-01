<template>
  <div class="subsidy-rules">
    <el-alert title="补贴规则说明" type="info" :closable="false" style="margin-bottom: 20px">
      <p>配置淡季补贴和保底分润规则，确保车主收益稳定</p>
    </el-alert>

    <!-- 补贴规则列表 -->
    <el-table :data="subsidyList" v-loading="loading" border stripe>
      <el-table-column prop="hostingType" label="托管类型" width="150">
        <template #default="{ row }">
          <el-tag :type="getHostingTypeTag(row.hostingType)">
            {{ getHostingTypeName(row.hostingType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column prop="minMonthlyProfit" label="最低月分润" width="130" align="right">
        <template #default="{ row }"> ¥{{ row.minMonthlyProfit }} </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="300" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { HostingType, SubsidyRule } from '@/types/profit'
import { getHostingProfitConfigs } from '@/api/profit'

const loading = ref(false)
const subsidyList = ref<SubsidyRule[]>([])

const fetchSubsidyRules = async () => {
  loading.value = true
  try {
    const res = await getHostingProfitConfigs()
    const allRules: SubsidyRule[] = []
    res.data.forEach((config: any) => {
      allRules.push(...config.subsidyRules)
    })
    subsidyList.value = allRules
  } catch (error) {
    console.error('获取补贴规则失败:', error)
    ElMessage.error('获取补贴规则失败')
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  fetchSubsidyRules()
})
</script>
