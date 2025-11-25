# PC管理后台开发环境搭建指南

本文档指导开发者快速搭建叨叨房车PC管理后台的开发环境。

## 系统要求

- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: 18.18.0 LTS 或更高版本
- **npm**: 9.0+ 或 yarn 1.22+
- **Git**: 2.20+
- **VSCode**: 1.80+ (推荐)

## 快速开始

### 1. 获取代码

```bash
git clone <repository-url>
cd daodao/admin-console
```

### 2. 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn install
```

### 3. 启动开发服务

```bash
# 开发模式启动
npm run dev

# 服务启动后访问: http://localhost:5173
```

### 4. 环境配置

```bash
# 复制环境变量文件
cp .env.development .env.local

# 根据需要修改环境变量
vim .env.local
```

**环境变量配置：**
```env
# API接口地址
VITE_API_BASE_URL=http://localhost:3001

# 应用配置
VITE_APP_TITLE=叨叨房车管理系统
VITE_APP_VERSION=1.0.0

# 开发配置
VITE_MOCK=true
VITE_DEV_TOOLS=true
```

## 技术栈

### 核心框架
- **Vue 3.5.0**: 渐进式JavaScript框架
- **TypeScript 5.1.6**: JavaScript超集
- **Vite 4.4.9**: 现代前端构建工具
- **Element Plus 2.11.7**: Vue 3组件库

### 开发工具
- **Vue Router 4**: 路由管理
- **Pinia**: 状态管理
- **VueUse**: Vue组合式API工具集
- **ESLint**: 代码检查
- **Prettier**: 代码格式化

### 构建工具
- **Vite**: 构建工具
- **TypeScript**: 类型检查
- **Sass**: CSS预处理器

## 项目结构

```
admin-console/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   ├── assets/            # 静态资源
│   ├── components/        # 公���组件
│   │   └── diy/           # DIY编辑器组件
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia状态
│   ├── styles/            # 样式文件
│   ├── types/             # TypeScript类型
│   ├── utils/             # 工具函数
│   └── views/             # 页面组件
├── docs/                  # 项目文档
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 开发工作流

### 创建新页面

1. **创建页面组件**
   ```vue
   <!-- src/views/Example/index.vue -->
   <template>
     <div class="example-page">
       <el-card>
         <template #header>
           <h3>示例页面</h3>
         </template>
         <p>这是一个示例页面</p>
       </el-card>
     </div>
   </template>

   <script setup lang="ts">
   import { ref, onMounted } from 'vue'

   // 页面逻辑
   onMounted(() => {
     console.log('页面加载完成')
   })
   </script>

   <style scoped>
   .example-page {
     padding: 20px;
   }
   </style>
   ```

2. **添加路由配置**
   ```typescript
   // src/router/index.ts
   import Example from '@/views/Example/index.vue'

   const routes = [
     {
       path: '/example',
       name: 'Example',
       component: Example,
       meta: {
         title: '示例页面',
         requiresAuth: true
       }
     }
   ]
   ```

3. **添加菜单项**
   ```vue
   <!-- 在对应的菜单组件中添加 -->
   <el-menu-item index="/example">
     <el-icon><Document /></el-icon>
     <span>示例页面</span>
   </el-menu-item>
   ```

### API接口调用

```typescript
// src/api/example.ts
import request from '@/utils/request'

export interface ExampleData {
  id: number
  name: string
  createdAt: string
}

export const exampleApi = {
  // 获取列表
  getList: (params?: any) => {
    return request({
      url: '/api/v1/examples',
      method: 'GET',
      params
    })
  },

  // 获取详情
  getDetail: (id: number) => {
    return request({
      url: `/api/v1/examples/${id}`,
      method: 'GET'
    })
  },

  // 创建
  create: (data: Partial<ExampleData>) => {
    return request({
      url: '/api/v1/examples',
      method: 'POST',
      data
    })
  },

  // 更新
  update: (id: number, data: Partial<ExampleData>) => {
    return request({
      url: `/api/v1/examples/${id}`,
      method: 'PUT',
      data
    })
  },

  // 删除
  delete: (id: number) => {
    return request({
      url: `/api/v1/examples/${id}`,
      method: 'DELETE'
    })
  }
}
```

### 状态管理

```typescript
// src/stores/example.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExampleData } from '@/api/example'
import { exampleApi } from '@/api/example'

export const useExampleStore = defineStore('example', () => {
  // 状态
  const list = ref<ExampleData[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 计算属性
  const isEmpty = computed(() => list.value.length === 0)

  // 方法
  const fetchList = async (params?: any) => {
    loading.value = true
    try {
      const res = await exampleApi.getList(params)
      if (res.code === 0) {
        list.value = res.data.list
        total.value = res.data.pagination.total
      }
    } finally {
      loading.value = false
    }
  }

  const createItem = async (data: Partial<ExampleData>) => {
    const res = await exampleApi.create(data)
    if (res.code === 0) {
      await fetchList()
      return true
    }
    return false
  }

  return {
    list,
    loading,
    total,
    isEmpty,
    fetchList,
    createItem
  }
})
```

### 组件开发

**表单组件示例：**
```vue
<!-- src/components/ExampleForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="名称" prop="name">
      <el-input
        v-model="formData.name"
        placeholder="请输入名称"
        clearable
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        保存
      </el-button>
      <el-button @click="handleReset">
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useExampleStore } from '@/stores/example'

// 接口定义
interface FormData {
  name: string
}

// 响应式数据
const formRef = ref<FormInstance>()
const exampleStore = useExampleStore()

const formData = reactive<FormData>({
  name: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      const success = await exampleStore.createItem(formData)
      if (success) {
        ElMessage.success('创建成功')
        handleReset()
      }
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
```

## 开发规范

### Vue 3 最佳实践

**组件命名：**
```typescript
// ✅ 正确：使用PascalCase
export default defineComponent({
  name: 'UserProfile'
})

// ❌ 错误：使用kebab-case
export default defineComponent({
  name: 'user-profile'
})
```

**Composition API使用：**
```vue
<!-- ✅ 正确：使用setup语法糖 -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>

<!-- ❌ 错误：使用Options API -->
<script>
export default {
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  }
}
</script>
```

### TypeScript规范

```typescript
// ✅ 正确：定义接口类型
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

// ✅ 正确：使用泛型
const fetchData = <T>(url: string): Promise<T> => {
  return request({ url })
}

// ❌ 错误：使用any类型
const fetchData = (url: string): Promise<any> => {
  return request({ url })
}
```

### 样式规范

```scss
// ✅ 正确：使用SCSS变量
@use '@/styles/variables' as *;

.container {
  padding: $spacing-md;
  background-color: $background-color;

  &__header {
    height: 60px;
    border-bottom: 1px solid $border-color;
  }
}

// ✅ 正确：使用scoped样式
<style scoped>
.component {
  /* 组件专属样式 */
}
</style>
```

## 开发工具配置

### VSCode配置

**推荐安装的插件：**
- Vue Language Features (Volar)
- TypeScript Importer
- ESLint
- Prettier
- Auto Rename Tag
- GitLens

**设置文件 (.vscode/settings.json)：**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "vue": "html"
  }
}
```

### Vite配置优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
})
```

## 调试和测试

### 开发调试

1. **浏览器DevTools**
   - Vue DevTools扩展
   - 控制台日志查看
   - 网络请求监控

2. **VSCode调试**
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Launch Chrome",
         "request": "launch",
         "type": "chrome",
         "url": "http://localhost:5173",
         "webRoot": "${workspaceFolder}/src"
       }
     ]
   }
   ```

### 代码质量检查

```bash
# ESLint检查
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format

# 类型检查
npm run type-check
```

## 常见问题

### Q: 端口5173被占用
A: 修改端口配置：
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 8080  // 修改为其他端口
  }
})
```

### Q: API请求失败
A: 检查步骤：
1. 确认后端服务或Mock服务已启动
2. 检查proxy配置是否正确
3. 查看浏览器Network面板

### Q: TypeScript类型错误
A: 解决方案：
```bash
# 重新生成类型声明
npm run type-check

# 清理缓存
rm -rf node_modules/.vite
```

### Q: Element Plus组件样式问题
A: 检查要点：
1. 确保已正确导入Element Plus样式
2. 检查SCSS变量覆盖
3. 确认样式优先级

## 性能优化

### 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'utils': ['lodash-es', 'dayjs']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 运行时优化

```vue
<!-- 组件懒加载 -->
<script setup lang="ts">
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<!-- 图片懒加载 -->
<el-image
  :src="imageUrl"
  :lazy="true"
  fit="cover"
/>
```

## 发布流程

### 1. 代码检查
```bash
npm run lint
npm run type-check
npm run test
```

### 2. 构建生产版本
```bash
npm run build
```

### 3. 预览构建结果
```bash
npm run preview
```

### 4. 部署到服务器
```bash
# 上传dist目录到服务器
# 配置Nginx反向代理
```

## 开发资源

### 官方文档
- [Vue 3](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

### 学习资源
- [Vue 3 最佳实践](https://vuejs.org/guide/best-practices/)
- [Element Plus组件库](https://element-plus.org/)
- [Pinia状态管理](https://pinia.vuejs.org/)

## 获取帮助

- **项目文档**: `../../shared/docs/`
- **组件库文档**: [Element Plus](https://element-plus.org/)
- **问题反馈**: 提交Issue到项目仓库
- **技术支持**: 联系项目维护者

---

**提示**: 开发前建议先阅读项目根目录的 `CLAUDE.md` 了解整体架构和开发规范。