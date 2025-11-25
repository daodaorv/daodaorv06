<!--
  创建DIY项目页面
-->
<template>
  <div class="diy-project-create">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/diy' }">DIY项目管理</el-breadcrumb-item>
          <el-breadcrumb-item>创建项目</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">创建DIY项目</h1>
        <p class="page-description">创建新的可视化页面装修项目</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 创建表单 -->
    <div class="form-container">
      <el-form
        ref="createFormRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="create-form"
      >
        <!-- 基本信息 -->
        <el-card class="form-section">
          <template #header>
            <span class="section-title">
              <el-icon><Document /></el-icon>
              基本信息
            </span>
          </template>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="项目名称" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入项目名称"
                  :maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目类型" prop="type">
                <el-select v-model="formData.type" placeholder="请选择项目类型">
                  <el-option label="首页装修" value="home" />
                  <el-option label="详情页装修" value="detail" />
                  <el-option label="活动页面" value="activity" />
                  <el-option label="自定义页面" value="custom" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="项目描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入项目描述"
              :maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="页面标题" prop="pageTitle">
                <el-input
                  v-model="formData.pageTitle"
                  placeholder="请输入页面标题"
                  :maxlength="60"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="页面路径" prop="pagePath">
                <el-input
                  v-model="formData.pagePath"
                  placeholder="请输入页面路径"
                  :maxlength="100"
                />
                <div class="form-tip">
                  如：/custom-page 或 /activity/sale
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 项目配置 -->
        <el-card class="form-section">
          <template #header>
            <span class="section-title">
              <el-icon><Setting /></el-icon>
              项目配置
            </span>
          </template>

          <el-form-item label="页面尺寸">
            <el-radio-group v-model="formData.device">
              <el-radio label="mobile">移动端</el-radio>
              <el-radio label="pc">PC端</el-radio>
              <el-radio label="both">响应式</el-radio>
            </el-radio-group>
            <div class="form-tip">
              选择页面适配的设备类型，响应式将同时适配移动端和PC端
            </div>
          </el-form-item>

          <el-form-item label="基础模板">
            <el-select v-model="formData.templateId" placeholder="选择基础模板（可选）" clearable>
              <el-option
                v-for="template in templates"
                :key="template.id"
                :label="template.name"
                :value="template.id"
              >
                <div class="template-option">
                  <span>{{ template.name }}</span>
                  <span class="template-category">{{ template.category }}</span>
                </div>
              </el-option>
            </el-select>
            <div class="form-tip">
              选择一个基础模板可以快速开始，后续可以在编辑器中修改
            </div>
          </el-form-item>

          <el-form-item label="页面标签">
            <el-select
              v-model="formData.tags"
              multiple
              filterable
              allow-create
              placeholder="请选择或输入标签"
              style="width: 100%"
            >
              <el-option label="营销活动" value="marketing" />
              <el-option label="品牌展示" value="brand" />
              <el-option label="产品推广" value="product" />
              <el-option label="活动专题" value="activity" />
              <el-option label="首页装修" value="home" />
            </el-select>
          </el-form-item>
        </el-card>

        <!-- SEO设置 -->
        <el-card class="form-section">
          <template #header>
            <span class="section-title">
              <el-icon><Search /></el-icon>
              SEO设置
            </span>
          </template>

          <el-form-item label="页面关键词" prop="keywords">
            <el-input
              v-model="formData.seoKeywords"
              placeholder="请输入页面关键词，多个用逗号分隔"
              :maxlength="200"
            />
          </el-form-item>

          <el-form-item label="页面描述" prop="seoDescription">
            <el-input
              v-model="formData.seoDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入页面描述"
              :maxlength="300"
              show-word-limit
            />
          </el-form-item>
        </el-card>

        <!-- 高级设置 -->
        <el-card class="form-section">
          <template #header>
            <span class="section-title">
              <el-icon><Tools /></el-icon>
              高级设置
            </span>
          </template>

          <el-form-item label="项目权限">
            <el-radio-group v-model="formData.accessType">
              <el-radio label="public">公开</el-radio>
              <el-radio label="private">私有</el-radio>
              <el-radio label="password">密码访问</el-radio>
            </el-radio-group>
            <el-input
              v-if="formData.accessType === 'password'"
              v-model="formData.accessPassword"
              type="password"
              placeholder="请输入访问密码"
              style="margin-top: 12px; max-width: 300px;"
              :maxlength="20"
            />
          </el-form-item>

          <el-form-item label="发布设置">
            <el-checkbox v-model="formData.autoPublish">
              创建后自动发布
            </el-checkbox>
            <div class="form-tip">
              勾选后，项目创建完成将直接发布，无需手动操作
            </div>
          </el-form-item>
        </el-card>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button size="large" @click="goBack">取消</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="creating"
            @click="handleCreate"
          >
            创建项目
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ArrowLeft,
  Document,
  Setting,
  Search,
  Tools
} from '@element-plus/icons-vue'
import { diyApi } from '@/api/diy'

const router = useRouter()

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  type: '',
  pageTitle: '',
  pagePath: '',
  device: 'mobile',
  templateId: '',
  tags: [],
  seoKeywords: '',
  seoDescription: '',
  accessType: 'public',
  accessPassword: '',
  autoPublish: false
})

// 模板列表
const templates = ref<any[]>([])

// 状态
const creating = ref(false)
const createFormRef = ref<FormInstance>()

// 表单校验规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  pageTitle: [
    { required: true, message: '请输入页面标题', trigger: 'blur' },
    { min: 2, max: 60, message: '长度在 2 到 60 个字符', trigger: 'blur' }
  ],
  pagePath: [
    { required: true, message: '请输入页面路径', trigger: 'blur' },
    { pattern: /^[\/][a-zA-Z0-9\-_\/]*$/, message: '请输入有效的页面路径，以/开头', trigger: 'blur' }
  ]
}

// 加载模板列表
const loadTemplates = async () => {
  try {
    const response = await diyApi.getTemplates({ status: 'published' })
    templates.value = response.data.items
  } catch (error) {
    console.error('加载模板列表失败:', error)
  }
}

// 返回列表
const goBack = () => {
  router.push('/diy')
}

// 创建项目
const handleCreate = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    creating.value = true

    const projectData = {
      ...formData,
      config: {
        components: [],
        kingKong: {
          enabled: true,
          items: []
        },
        backgroundColor: '#ffffff',
        backgroundType: 'color'
      }
    }

    const response = await diyApi.createProject(projectData)

    ElMessage.success('项目创建成功')

    // 如果选择了模板，复制模板配置
    if (formData.templateId) {
      try {
        await diyApi.createFromTemplate(formData.templateId, {
          projectId: response.data.id,
          ...projectData
        })
      } catch (error) {
        console.error('应用模板失败:', error)
      }
    }

    // 跳转到编辑器
    router.push(`/diy/projects/${response.data.id}/edit`)
  } catch (error) {
    console.error('创建项目失败:', error)
    ElMessage.error('创建项目失败')
  } finally {
    creating.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTemplates()
})
</script>

<style lang="scss" scoped>
.diy-project-create {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .header-content {
      .page-title {
        margin: 8px 0 4px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .page-description {
        margin: 0 0 16px 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .form-container {
    max-width: 800px;
    margin: 0 auto;

    .create-form {
      .form-section {
        margin-bottom: 24px;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--el-text-color-primary);

          .el-icon {
            font-size: 16px;
          }
        }

        .template-option {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .template-category {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            background: var(--el-fill-color-light);
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
      }

      .form-tip {
        margin-top: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        line-height: 1.4;
      }

      .form-actions {
        margin-top: 32px;
        text-align: center;

        .el-button {
          min-width: 120px;
        }
      }
    }
  }
}
</style>