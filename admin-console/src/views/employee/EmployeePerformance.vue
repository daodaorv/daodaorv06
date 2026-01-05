<!-- 员工绩效管理页面 -->
<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <PageHeader title="绩效管理" description="管理员工绩效考核和奖金发放" />

    <!-- 统计卡片 -->
    <StatsCard :stats="statsCards" />

    <!-- 搜索表单 -->
    <SearchForm
      v-model="searchParams"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable
      :columns="tableColumns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :actions-width="120"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #score="{ row }">
        <el-progress :percentage="row.score" :color="getScoreColor(row.score)" :stroke-width="20" />
      </template>

      <template #rank="{ row }">
        <el-tag v-if="row.rank === 1" type="danger">第{{ row.rank }}名</el-tag>
        <el-tag v-else-if="row.rank <= 3" type="warning">第{{ row.rank }}名</el-tag>
        <el-tag v-else type="info">第{{ row.rank }}名</el-tag>
      </template>

      <template #actions="{ row }">
        <el-button link type="primary" size="small" @click="handleView(row)">查看详情</el-button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, TrendCharts, Money, Trophy } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import type { SearchField } from '@/components/common/SearchForm.vue'
import type { TableColumn } from '@/components/common/DataTable.vue'

// 绩效数据类型
interface EmployeePerformance {
  id: number
  employeeName: string
  department: string
  month: string
  orderCount: number
  totalRevenue: number
  customerSatisfaction: string
  attendanceRate: string
  score: number
  rank: number
  bonus: number
}

// Mock 统计数据
const stats = ref({
  totalEmployees: 15,
  avgScore: 85.6,
  avgBonus: 3200,
  topPerformer: '张三',
})

// 统计卡片数据
const statsCards = computed(() => [
  {
    label: '考核员工数',
    value: stats.value.totalEmployees,
    icon: User,
    color: '#409eff',
    format: 'number' as const,
  },
  {
    label: '平均绩效分',
    value: stats.value.avgScore.toFixed(1),
    icon: TrendCharts,
    color: '#67c23a',
  },
  {
    label: '平均奖金',
    value: stats.value.avgBonus,
    icon: Money,
    color: '#e6a23c',
    format: 'currency' as const,
  },
  {
    label: '本月最佳',
    value: stats.value.topPerformer,
    icon: Trophy,
    color: '#f56c6c',
  },
])

const searchFields: SearchField[] = [
  {
    type: 'date',
    prop: 'month',
    label: '月份',
    placeholder: '请选择月份',
  },
  {
    type: 'input',
    prop: 'employeeId',
    label: '员工ID',
    placeholder: '请输入员工ID',
  },
]

const tableColumns: TableColumn[] = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'employeeName', label: '员工姓名', width: 120 },
  { prop: 'department', label: '部门', width: 120 },
  { prop: 'month', label: '月份', width: 100 },
  { prop: 'orderCount', label: '订单数', width: 100 },
  { prop: 'totalRevenue', label: '总营收(元)', width: 130 },
  { prop: 'customerSatisfaction', label: '客户满意度', width: 120 },
  { prop: 'attendanceRate', label: '出勤率', width: 100 },
  { prop: 'score', label: '综合评分', width: 150, slot: 'score' },
  { prop: 'rank', label: '排名', width: 100, slot: 'rank' },
  { prop: 'bonus', label: '奖金(元)', width: 120 },
  { prop: 'actions', label: '操作', width: 120, slot: 'actions', fixed: 'right' as const },
]

// Mock 表格数据
const tableData = ref<EmployeePerformance[]>([
  {
    id: 1,
    employeeName: '张三',
    department: '技术部',
    month: '2024-12',
    orderCount: 45,
    totalRevenue: 125000,
    customerSatisfaction: '98%',
    attendanceRate: '100%',
    score: 95,
    rank: 1,
    bonus: 5000,
  },
  {
    id: 2,
    employeeName: '李四',
    department: '运营部',
    month: '2024-12',
    orderCount: 38,
    totalRevenue: 98000,
    customerSatisfaction: '95%',
    attendanceRate: '98%',
    score: 88,
    rank: 2,
    bonus: 4000,
  },
  {
    id: 3,
    employeeName: '王五',
    department: '客服部',
    month: '2024-12',
    orderCount: 52,
    totalRevenue: 85000,
    customerSatisfaction: '92%',
    attendanceRate: '96%',
    score: 85,
    rank: 3,
    bonus: 3500,
  },
])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3,
})

const searchParams = reactive({
  month: '',
  employeeId: undefined as number | undefined,
})

const getScoreColor = (score: number) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#e6a23c'
  if (score >= 60) return '#409eff'
  return '#f56c6c'
}

const handleSearch = () => {
  pagination.page = 1
  ElMessage.success('搜索功能开发中...')
}

const handleReset = () => {
  Object.assign(searchParams, {
    month: '',
    employeeId: undefined,
  })
  pagination.page = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleView = (row: EmployeePerformance) => {
  ElMessage.info(`查看详情: ${row.employeeName}`)
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-description {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
</style>
