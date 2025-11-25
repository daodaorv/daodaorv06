<!--
  DIY项目管理页面
  显示所有DIY项目的列表
-->
<template>
  <div class="diy-projects">
    <div class="page-header">
      <div class="header-left">
        <h2>DIY项目管理</h2>
        <p>管理和可视化装修小程序页面</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          创建项目
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <!-- 筛选条件 -->
      <div class="filter-bar">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-input
              v-model="filters.search"
              placeholder="搜索项目名称"
              :prefix-icon="Search"
              clearable
            />
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.type" placeholder="页面类型" clearable>
              <el-option label="首页" value="home" />
              <el-option label="社区页" value="community" />
              <el-option label="众筹页" value="crowdfunding" />
              <el-option label="我的页面" value="profile" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.status" placeholder="状态" clearable>
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 项目列表 -->
      <div class="projects-grid">
        <el-row :gutter="16">
          <el-col
            v-for="project in projectList"
            :key="project.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card class="project-card" :body-style="{ padding: '0' }">
              <!-- 项目预览图 -->
              <div class="card-preview">
                <img
                  v-if="project.pageConfig?.meta?.preview"
                  :src="project.pageConfig.meta.preview"
                  :alt="project.name"
                />
                <div v-else class="preview-placeholder">
                  <el-icon size="48">
                    <Picture />
                  </el-icon>
                </div>
                <div class="preview-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :icon="Edit"
                    @click="handleEdit(project.id)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    :icon="View"
                    @click="handlePreview(project.id)"
                  >
                    预览
                  </el-button>
                </div>
              </div>

              <!-- 项目信息 -->
              <div class="card-content">
                <div class="project-title">{{ project.name }}</div>
                <div class="project-desc">{{ project.description || '暂无描述' }}</div>
                <div class="project-meta">
                  <el-tag :type="getStatusType(project.status)" size="small">
                    {{ getStatusText(project.status) }}
                  </el-tag>
                  <el-tag size="small" type="info">
                    {{ getTypeText(project.type) }}
                  </el-tag>
                </div>
                <div class="project-footer">
                  <span class="update-time">
                    {{ formatDate(project.updatedAt) }}
                  </span>
                  <el-dropdown trigger="click">
                    <el-button text :icon="MoreFilled" size="small" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleDuplicate(project.id)">
                          <el-icon><CopyDocument /></el-icon>
                          复制项目
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleExport(project.id)">
                          <el-icon><Download /></el-icon>
                          导出配置
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="handleDelete(project.id)">
                          <el-icon><Delete /></el-icon>
                          删除项目
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && projectList.length === 0"
        description="暂无项目"
        :image-size="120"
      >
        <el-button type="primary" @click="handleCreate">创建第一个项目</el-button>
      </el-empty>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  Search,
  Edit,
  View,
  Picture,
  MoreFilled,
  CopyDocument,
  Download,
  Delete
} from '@element-plus/icons-vue';

import { getDiyProjects, deleteDiyProject } from '@/api/diy';

import type { DiyProject } from '@/types/diy';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const projectList = ref<DiyProject[]>([]);
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);

const filters = reactive({
  search: '',
  type: '',
  status: ''
});

// 方法
const loadProjects = async () => {
  loading.value = true;
  try {
    const response = await getDiyProjects({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: filters.search,
      pageType: filters.type,
      status: filters.status
    });

    if (response.code === 0) {
      projectList.value = response.data;
      total.value = response.meta?.pagination?.total || 0;
    }
  } catch (error: any) {
    ElMessage.error('加载项目列表失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadProjects();
};

const handleReset = () => {
  filters.search = '';
  filters.type = '';
  filters.status = '';
  currentPage.value = 1;
  loadProjects();
};

const handleCreate = () => {
  router.push('/diy/projects/new');
};

const handleEdit = (projectId: string) => {
  router.push(`/diy/projects/${projectId}/edit`);
};

const handlePreview = (projectId: string) => {
  // 打开预览窗口
  const previewUrl = `/diy/preview/${projectId}`;
  window.open(previewUrl, '_blank');
};

const handleDuplicate = async (projectId: string) => {
  // 实现项目复制逻辑
  ElMessage.info('复制功能开发中...');
};

const handleExport = async (projectId: string) => {
  // 实现项目导出逻辑
  ElMessage.info('导出功能开发中...');
};

const handleDelete = async (projectId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？删除后无法恢复。', '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    });

    await deleteDiyProject(projectId);
    ElMessage.success('项目删除成功');
    loadProjects();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除项目失败: ' + error.message);
    }
  }
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadProjects();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadProjects();
};

// 辅助方法
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  };
  return textMap[status] || status;
};

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    home: '首页',
    community: '社区页',
    crowdfunding: '众筹页',
    profile: '我的页面'
  };
  return textMap[type] || type;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString();
  }
};

onMounted(() => {
  loadProjects();
});
</script>

<style lang="scss" scoped>
.diy-projects {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
}

.page-header {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.filter-bar {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.projects-grid {
  margin-bottom: 24px;
}

.project-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
}

.card-preview {
  position: relative;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-placeholder);
  }

  .preview-actions {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .preview-actions {
    opacity: 1;
  }
}

.card-content {
  padding: 16px;
}

.project-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.project-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .update-time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}
</style>