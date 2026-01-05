# PC 管理端 UI 规范总览

**文档版本**: v1.0.0 | **创建时间**: 2026-01-03 | **维护者**: 叨叨房车技术团队

---

## 📋 文档说明

本文档是叨叨房车 PC 管理端 UI 设计规范的总览和快速入口，整合了所有设计规范文档。

---

## 📚 规范文档体系

### 1. 核心规范文档

| 文档名称 | 说明 | 链接 |
|---------|------|------|
| **UI 设计规范** | 设计系统基础（颜色、字体、间距、圆角、阴影） | [查看文档](./UI设计规范.md) |
| **Element Plus 组件使用规范** | 基于 Element Plus 的组件标准用法 | [查看文档](./Element-Plus组件使用规范.md) |
| **布局与交互规范** | 页面布局、响应式设计、交互规范 | [查看文档](./布局与交互规范.md) |

### 2. 标准页面模板

| 模板名称 | 说明 | 文件路径 |
|---------|------|---------|
| **列表页面模板** | 标准的数据列表页面（筛选+表格+分页） | [templates/ListPageTemplate.vue](./templates/ListPageTemplate.vue) |
| **表单页面模板** | 标准的表单页面（新增/编辑） | [templates/FormPageTemplate.vue](./templates/FormPageTemplate.vue) |

---

## 🎨 设计系统快速参考

### 颜色系统

```scss
// 主色
$primary: #409EFF;
$success: #67C23A;
$warning: #E6A23C;
$danger: #F56C6C;
$info: #909399;

// 文本颜色
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$text-placeholder: #C0C4CC;

// 背景颜色
$bg-white: #FFFFFF;
$bg-page: #F5F7FA;
```text

### 字体系统

```scss
// 字号
$font-size-h1: 24px;  // 页面主标题
$font-size-h2: 20px;  // 区块标题
$font-size-h3: 18px;  // 卡片标题
$font-size-base: 14px; // 基础字号

// 字重
$font-weight-regular: 400;  // 常规
$font-weight-medium: 500;   // 中等
$font-weight-bold: 600;     // 粗体
```text

### 间距系统

```scss
// 基础间距（8px 栅格系统）
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```text

---

## 🔧 组件使用快速参考

### 按钮规范

```vue
<!-- 主要操作 -->
<el-button type="primary">新增</el-button>

<!-- 次要操作 -->
<el-button>取消</el-button>

<!-- 危险操作 -->
<el-button type="danger">删除</el-button>

<!-- 表格内操作 -->
<el-button size="small" link>编辑</el-button>
```text

### 表单规范

```vue
<el-form
  ref="formRef"
  :model="form"
  :rules="rules"
  label-width="120px"
>
  <el-form-item label="用户名" prop="username">
    <el-input
      v-model="form.username"
      placeholder="请输入用户名"
      clearable
    />
  </el-form-item>
</el-form>
```text

### 表格规范

```vue
<el-table
  :data="tableData"
  border
  stripe
  v-loading="loading"
>
  <el-table-column type="index" label="序号" width="60" />
  <el-table-column prop="name" label="姓名" />
  <el-table-column label="操作" width="180" fixed="right">
    <template #default="{ row }">
      <el-button size="small" link>编辑</el-button>
    </template>
  </el-table-column>
</el-table>
```text

---

## 📐 页面布局标准

### 标准页面结构

```vue
<template>
  <div class="page-container">
    <!-- 1. 页面标题区 -->
    <div class="page-header">
      <div class="page-title">
        <h2>页面标题</h2>
        <p class="page-description">页面描述</p>
      </div>
      <div class="page-actions">
        <el-button type="primary">主要操作</el-button>
      </div>
    </div>

    <!-- 2. 筛选条件区（可选） -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline>
        <!-- 筛选项 -->
      </el-form>
    </el-card>

    <!-- 3. 数据内容区 -->
    <el-card shadow="never" class="content-card">
      <!-- 表格或其他内容 -->
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>
```text

---

## ✅ 开发检查清单

### 代码质量检查

- [ ] 遵循 Element Plus 组件使用规范
- [ ] 使用标准的颜色、字体、间距
- [ ] 表单包含完整的验证规则
- [ ] 表格包含 border 和 stripe 属性
- [ ] 所有输入框包含 placeholder 和 clearable
- [ ] 按钮使用正确的 type 和 size
- [ ] 操作包含加载状态和错误处理
- [ ] 页面包含空状态处理

### UI 一致性检查

- [ ] 页面标题使用 20px 字号，600 字重
- [ ] 卡片使用 6px 圆角，never 阴影
- [ ] 页面内边距统一为 20px
- [ ] 卡片之间间距为 20px
- [ ] 表单 label-width 为 120px
- [ ] 表格操作列固定在右侧
- [ ] 分页器位于表格下方右对齐

---

## 🚀 快速开始

### 1. 创建新页面

```bash
# 复制标准模板
cp docs/templates/ListPageTemplate.vue src/views/your-module/YourPage.vue
```text

### 2. 修改页面内容

- 修改页面标题和描述
- 调整筛选条件
- 修改表格列定义
- 实现 API 调用逻辑

### 3. 运行质量检查

```bash
npm run lint
npm run type-check
```text

---

## 📞 技术支持

### 遇到问题？

1. **查看规范文档**：先查看对应的规范文档
2. **参考标准模板**：查看 templates 目录下的标准模板
3. **调用工具**：使用 `vibe-coding-master` 或 `ui-ux-pro-max` 工具

### 规范更新

- 规范文档持续更新，请定期查看最新版本
- 如有建议或问题，请联系技术团队

---

**最后更新**: 2026-01-03 | **下次审核**: 2026-02-03
