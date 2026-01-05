<template>
  <div class="promotion-relations">
    <!-- 搜索筛选 -->
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="用户">
        <el-input
          v-model="queryForm.userId"
          placeholder="请输入用户ID或姓名"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="一级推广者">
        <el-input
          v-model="queryForm.level1PromoterUserId"
          placeholder="请输入推广者ID或姓名"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="relationList" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column prop="userId" label="用户ID" width="150" />
      <el-table-column prop="level1PromoterUserName" label="一级推广者" width="120" />
      <el-table-column prop="level1PromoterUserId" label="一级推广者ID" width="150" />
      <el-table-column prop="level2PromoterUserName" label="二级推广者" width="120" />
      <el-table-column prop="level2PromoterUserId" label="二级推广者ID" width="150" />
      <el-table-column prop="createdAt" label="建立时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewTree(row)">
            查看关系树
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { PromotionRelation } from '@/types/profit'
import { getPromotionRelations } from '@/api/profit'
import { useRouter } from 'vue-router'

const router = useRouter()

// 加载状态
const loading = ref(false)

// 查询表单
const queryForm = reactive({
  userId: '',
  level1PromoterUserId: '',
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 关系列表
const relationList = ref<PromotionRelation[]>([])

// 获取关系列表
const fetchRelations = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
    if (queryForm.userId) {
      params.userId = queryForm.userId
    }
    if (queryForm.level1PromoterUserId) {
      params.level1PromoterUserId = queryForm.level1PromoterUserId
    }
    const res = await getPromotionRelations(params)
    relationList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取关系列表失败:', error)
    ElMessage.error('获取关系列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRelations()
}

// 重置
const handleReset = () => {
  queryForm.userId = ''
  queryForm.level1PromoterUserId = ''
  pagination.page = 1
  fetchRelations()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.page = 1
  fetchRelations()
}

// 页码改变
const handlePageChange = () => {
  fetchRelations()
}

// 查看关系树
const handleViewTree = (row: PromotionRelation) => {
  router.push({
    name: 'PromotionTree',
    query: { userId: row.userId },
  })
}

// 初始化
onMounted(() => {
  fetchRelations()
})
</script>

<style scoped lang="scss">
.promotion-relations {
  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
