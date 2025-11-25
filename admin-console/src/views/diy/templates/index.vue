<!--
  DIY模板管理页面
-->
<template>
  <div class="diy-templates">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">DIY模板管理</h1>
        <p class="page-description">管理和配置可视化页面模板</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateTemplate">
          <el-icon><Plus /></el-icon>
          新建模板
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="模板名称">
            <el-input
              v-model="filterForm.name"
              placeholder="请输入模板名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="模板分类">
            <el-select v-model="filterForm.category" placeholder="请选择分类" clearable>
              <el-option label="首页模板" value="home" />
              <el-option label="详情页模板" value="detail" />
              <el-option label="列表页模板" value="list" />
              <el-option label="专题页模板" value="special" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已归档" value="archived" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleResetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 模板列表 -->
    <div class="templates-grid">
      <el-row :gutter="20">
        <el-col
          v-for="template in templates"
          :key="template.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="template-card" :body-style="{ padding: '0px' }">
            <!-- 模板预览图 -->
            <div class="template-preview">
              <img
                v-if="template.previewImage"
                :src="template.previewImage"
                :alt="template.name"
                class="preview-image"
                @error="handleImageError"
              />
              <div v-else class="preview-placeholder">
                <el-icon size="48"><Document /></el-icon>
                <span>暂无预览</span>
              </div>
              <div class="template-status">
                <el-tag
                  :type="getStatusType(template.status)"
                  size="small"
                >
                  {{ getStatusText(template.status) }}
                </el-tag>
              </div>
            </div>

            <!-- 模板信息 -->
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              <p class="template-description">{{ template.description }}</p>
              <div class="template-meta">
                <span class="meta-item">
                  <el-icon><FolderOpened /></el-icon>
                  {{ getCategoryText(template.category) }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(template.updatedAt) }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="template-actions">
              <el-button-group>
                <el-button size="small" @click="handlePreviewTemplate(template)">
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
                <el-button size="small" @click="handleUseTemplate(template)">
                  <el-icon><CopyDocument /></el-icon>
                  使用
                </el-button>
                <el-dropdown trigger="click" @command="handleTemplateAction">
                  <el-button size="small">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{action: 'edit', template}">
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'copy', template}">
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'export', template}">
                        导出
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="{action: 'delete', template}"
                        divided
                      >
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-button-group>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty
        v-if="templates.length === 0 && !loading"
        description="暂无模板数据"
      >
        <el-button type="primary" @click="handleCreateTemplate">
          创建第一个模板
        </el-button>
      </el-empty>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="模板预览"
      width="80%"
      :destroy-on-close="true"
    >
      <div v-if="currentTemplate" class="preview-container">
        <div class="preview-header">
          <h3>{{ currentTemplate.name }}</h3>
          <p>{{ currentTemplate.description }}</p>
        </div>
        <div class="preview-content">
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
          />
          <div v-else class="preview-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在生成预览...</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 创建/编辑模板对话框 -->
    <el-dialog
      v-model="templateFormVisible"
      :title="isEdit ? '编辑模板' : '新建模板'"
      width="600px"
      :destroy-on-close="true"
    >
      <el-form
        ref="templateFormRef"
        :model="templateForm"
        :rules="templateFormRules"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板分类" prop="category">
          <el-select v-model="templateForm.category" placeholder="请选择模板分类">
            <el-option label="首页模板" value="home" />
            <el-option label="详情页模板" value="detail" />
            <el-option label="列表页模板" value="list" />
            <el-option label="专题页模板" value="special" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="模板标签" prop="tags">
          <el-select
            v-model="templateForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
          >
            <el-option label="响应式" value="responsive" />
            <el-option label="移动优先" value="mobile-first" />
            <el-option label="简约风格" value="minimal" />
            <el-option label="商务风格" value="business" />
            <el-option label="创意设计" value="creative" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="templateForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">已发布</el-radio>
            <el-radio label="archived">已归档</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="templateFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTemplate" :loading="saving">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Refresh,
  Document,
  FolderOpened,
  Clock,
  View,
  CopyDocument,
  MoreFilled,
  Loading
} from '@element-plus/icons-vue'
import { diyApi } from '@/api/diy'

// 接口定义
interface Template {
  id: string
  name: string
  description: string
  category: string
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  previewImage?: string
  config: any
  createdAt: string
  updatedAt: string
}

interface FilterForm {
  name: string
  category: string
  status: string
}

interface TemplateForm {
  name: string
  description: string
  category: string
  status: string
  tags: string[]
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const templates = ref<Template[]>([])
const total = ref(0)
const previewVisible = ref(false)
const templateFormVisible = ref(false)
const isEdit = ref(false)
const currentTemplate = ref<Template | null>(null)
const previewUrl = ref('')

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 12
})

// 筛选表单
const filterForm = reactive<FilterForm>({
  name: '',
  category: '',
  status: ''
})

// 模板表单
const templateForm = reactive<TemplateForm>({
  name: '',
  description: '',
  category: '',
  status: 'draft',
  tags: []
})

// 表单校验规则
const templateFormRules: FormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择模板分类', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

const templateFormRef = ref<FormInstance>()

// 状态类型映射
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[status] || '未知'
}

const getCategoryText = (category: string) => {
  const textMap: Record<string, string> = {
    home: '首页模板',
    detail: '详情页模板',
    list: '列表页模板',
    special: '专题页模板'
  }
  return textMap[category] || '其他'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 加载模板列表
const loadTemplates = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }
    const response = await diyApi.getTemplates(params)
    templates.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    console.error('加载模板列表失败:', error)
    ElMessage.error('加载模板列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadTemplates()
}

// 重置筛选
const handleResetFilter = () => {
  Object.assign(filterForm, {
    name: '',
    category: '',
    status: ''
  })
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadTemplates()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadTemplates()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadTemplates()
}

// 创建模板
const handleCreateTemplate = () => {
  isEdit.value = false
  Object.assign(templateForm, {
    name: '',
    description: '',
    category: '',
    status: 'draft',
    tags: []
  })
  templateFormVisible.value = true
}

// 编辑模板
const handleEditTemplate = (template: Template) => {
  isEdit.value = true
  Object.assign(templateForm, {
    name: template.name,
    description: template.description,
    category: template.category,
    status: template.status,
    tags: template.tags
  })
  currentTemplate.value = template
  templateFormVisible.value = true
}

// 保存模板
const handleSaveTemplate = async () => {
  if (!templateFormRef.value) return

  try {
    await templateFormRef.value.validate()
    saving.value = true

    if (isEdit.value && currentTemplate.value) {
      await diyApi.updateTemplate(currentTemplate.value.id, templateForm)
      ElMessage.success('模板更新成功')
    } else {
      await diyApi.createTemplate(templateForm)
      ElMessage.success('模板创建成功')
    }

    templateFormVisible.value = false
    loadTemplates()
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error('保存模板失败')
  } finally {
    saving.value = false
  }
}

// 预览模板
const handlePreviewTemplate = (template: Template) => {
  currentTemplate.value = template
  previewUrl.value = `/diy/templates/${template.id}/preview`
  previewVisible.value = true
}

// 使用模板
const handleUseTemplate = async (template: Template) => {
  try {
    await ElMessageBox.confirm(
      `确定要使用模板"${template.name}"创建新项目吗？`,
      '确认使用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const response = await diyApi.createFromTemplate(template.id, {
      name: `${template.name} - 副本`,
      description: `基于模板"${template.name}"创建`
    })

    ElMessage.success('项目创建成功')
    // 跳转到编辑器
    // router.push(`/diy/projects/${response.data.id}/edit`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('使用模板失败:', error)
      ElMessage.error('使用模板失败')
    }
  }
}

// 模板操作处理
const handleTemplateAction = async ({ action, template }: { action: string; template: Template }) => {
  switch (action) {
    case 'edit':
      handleEditTemplate(template)
      break
    case 'copy':
      await handleCopyTemplate(template)
      break
    case 'export':
      await handleExportTemplate(template)
      break
    case 'delete':
      await handleDeleteTemplate(template)
      break
  }
}

// 复制模板
const handleCopyTemplate = async (template: Template) => {
  try {
    await diyApi.copyTemplate(template.id, {
      name: `${template.name} - 副本`
    })
    ElMessage.success('模板复制成功')
    loadTemplates()
  } catch (error) {
    console.error('复制模板失败:', error)
    ElMessage.error('复制模板失败')
  }
}

// 导出模板
const handleExportTemplate = async (template: Template) => {
  try {
    const response = await diyApi.exportTemplate(template.id)
    // 创建下载链接
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('模板导出成功')
  } catch (error) {
    console.error('导出模板失败:', error)
    ElMessage.error('导出模板失败')
  }
}

// 删除模板
const handleDeleteTemplate = async (template: Template) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板"${template.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await diyApi.deleteTemplate(template.id)
    ElMessage.success('模板删除成功')
    loadTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模板失败:', error)
      ElMessage.error('删除模板失败')
    }
  }
}

// 图片加载失败处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// 生命周期
onMounted(() => {
  loadTemplates()
})
</script>

<style lang="scss" scoped>
.diy-templates {
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

  .filter-section {
    margin-bottom: 20px;
  }

  .templates-grid {
    margin-bottom: 20px;

    .template-card {
      margin-bottom: 20px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .template-preview {
        position: relative;
        height: 200px;
        background: var(--el-fill-color-light);
        overflow: hidden;

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--el-text-color-placeholder);

          .el-icon {
            margin-bottom: 8px;
          }
        }

        .template-status {
          position: absolute;
          top: 12px;
          right: 12px;
        }
      }

      .template-info {
        padding: 16px;

        .template-name {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .template-description {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--el-text-color-regular);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .template-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;

            .el-icon {
              font-size: 14px;
            }
          }
        }
      }

      .template-actions {
        padding: 0 16px 16px;
        border-top: 1px solid var(--el-border-color-lighter);
        padding-top: 12px;
      }
    }
  }

  .loading-container {
    margin: 20px 0;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }

  .preview-container {
    .preview-header {
      margin-bottom: 20px;

      h3 {
        margin: 0 0 8px 0;
      }

      p {
        margin: 0;
        color: var(--el-text-color-regular);
      }
    }

    .preview-content {
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      overflow: hidden;

      .preview-iframe {
        width: 100%;
        height: 600px;
      }

      .preview-loading {
        height: 600px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-secondary);

        .el-icon {
          margin-bottom: 12px;
          font-size: 32px;
        }
      }
    }
  }
}
</style>