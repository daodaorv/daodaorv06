# Element Plus 组件使用规范

**文档版本**: v1.0.0 | **创建时间**: 2026-01-03 | **维护者**: 叨叨房车技术团队

---

## 📋 文档说明

本文档定义了基于 Element Plus 的组件使用规范，包括常用组件的标准用法、最佳实践和禁止模式。所有开发人员必须严格遵循本规范。

---

## 📋 目录

1. [按钮组件](#1-按钮组件)
2. [表单组件](#2-表单组件)
3. [表格组件](#3-表格组件)
4. [布局组件](#4-布局组件)
5. [反馈组件](#5-反馈组件)
6. [导航组件](#6-导航组件)

---

## 1. 按钮组件

### 1.1 按钮类型

```vue
<!-- ✅ 正确：主要操作使用 primary -->
<el-button type="primary">新增</el-button>
<el-button type="primary">保存</el-button>

<!-- ✅ 正确：次要操作使用 default -->
<el-button>取消</el-button>
<el-button>返回</el-button>

<!-- ✅ 正确：危险操作使用 danger -->
<el-button type="danger">删除</el-button>

<!-- ✅ 正确：成功操作使用 success -->
<el-button type="success">审核通过</el-button>

<!-- ✅ 正确：警告操作使用 warning -->
<el-button type="warning">暂停</el-button>

<!-- ❌ 错误：不要滥用 primary -->
<el-button type="primary">取消</el-button>
<el-button type="primary">返回</el-button>
```text

### 1.2 按钮尺寸

```vue
<!-- ✅ 正确：默认尺寸用于常规场景 -->
<el-button>默认按钮</el-button>

<!-- ✅ 正确：large 用于重要操作 -->
<el-button size="large" type="primary">提交订单</el-button>

<!-- ✅ 正确：small 用于表格内操作 -->
<el-button size="small" link>编辑</el-button>
<el-button size="small" link type="danger">删除</el-button>

<!-- ❌ 错误：不要在同一行混用不同尺寸 -->
<el-button size="large">保存</el-button>
<el-button size="small">取消</el-button>
```text

### 1.3 按钮组合

```vue
<!-- ✅ 正确：操作按钮组 -->
<el-space>
  <el-button type="primary">保存</el-button>
  <el-button>取消</el-button>
</el-space>

<!-- ✅ 正确：表格操作按钮 -->
<el-space>
  <el-button size="small" link>查看</el-button>
  <el-button size="small" link type="primary">编辑</el-button>
  <el-button size="small" link type="danger">删除</el-button>
</el-space>

<!-- ❌ 错误：不要使用过多按钮 -->
<el-space>
  <el-button type="primary">按钮1</el-button>
  <el-button type="primary">按钮2</el-button>
  <el-button type="primary">按钮3</el-button>
  <el-button type="primary">按钮4</el-button>
  <el-button type="primary">按钮5</el-button>
</el-space>
```text

### 1.4 按钮图标

```vue
<!-- ✅ 正确：图标 + 文字 -->
<el-button type="primary" :icon="Plus">新增</el-button>
<el-button :icon="Search">搜索</el-button>
<el-button :icon="Download">导出</el-button>

<!-- ✅ 正确：纯图标按钮（需要 tooltip） -->
<el-tooltip content="刷新">
  <el-button :icon="Refresh" circle />
</el-tooltip>

<!-- ❌ 错误：不要使用纯图标按钮而不加提示 -->
<el-button :icon="Refresh" circle />
```text

---

## 2. 表单组件

### 2.1 表单布局

```vue
<!-- ✅ 正确：标准表单布局 -->
<el-form
  ref="formRef"
  :model="form"
  :rules="rules"
  label-width="100px"
  label-position="right"
>
  <el-form-item label="用户名" prop="username">
    <el-input v-model="form.username" placeholder="请输入用户名" />
  </el-form-item>

  <el-form-item label="手机号" prop="phone">
    <el-input v-model="form.phone" placeholder="请输入手机号" />
  </el-form-item>

  <el-form-item>
    <el-button type="primary" @click="handleSubmit">提交</el-button>
    <el-button @click="handleReset">重置</el-button>
  </el-form-item>
</el-form>

<!-- ❌ 错误：不要省略 label-width -->
<el-form :model="form">
  <el-form-item label="用户名">
    <el-input v-model="form.username" />
  </el-form-item>
</el-form>
```text

### 2.2 表单验证

```typescript
// ✅ 正确：完整的验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

// ❌ 错误：不要省略验证规则
const rules = {
  username: [{ required: true }]
}
```text

### 2.3 输入框规范

```vue
<!-- ✅ 正确：带 placeholder 和 clearable -->
<el-input
  v-model="form.username"
  placeholder="请输入用户名"
  clearable
/>

<!-- ✅ 正确：数字输入框 -->
<el-input-number
  v-model="form.age"
  :min="0"
  :max="150"
  controls-position="right"
/>

<!-- ✅ 正确：密码输入框 -->
<el-input
  v-model="form.password"
  type="password"
  placeholder="请输入密码"
  show-password
/>

<!-- ❌ 错误：不要省略 placeholder -->
<el-input v-model="form.username" />
```text

### 2.4 选择器规范

```vue
<!-- ✅ 正确：下拉选择器 -->
<el-select
  v-model="form.status"
  placeholder="请选择状态"
  clearable
>
  <el-option label="启用" value="active" />
  <el-option label="禁用" value="inactive" />
</el-select>

<!-- ✅ 正确：日期选择器 -->
<el-date-picker
  v-model="form.date"
  type="date"
  placeholder="请选择日期"
  value-format="YYYY-MM-DD"
/>

<!-- ✅ 正确：日期范围选择器 -->
<el-date-picker
  v-model="form.dateRange"
  type="daterange"
  range-separator="至"
  start-placeholder="开始日期"
  end-placeholder="结束日期"
  value-format="YYYY-MM-DD"
/>

<!-- ❌ 错误：不要省略 value-format -->
<el-date-picker v-model="form.date" type="date" />
```text

---

## 3. 表格组件

### 3.1 基础表格

```vue
<!-- ✅ 正确：标准表格 -->
<el-table
  :data="tableData"
  border
  stripe
  style="width: 100%"
>
  <el-table-column type="index" label="序号" width="60" />
  <el-table-column prop="name" label="姓名" width="120" />
  <el-table-column prop="phone" label="手机号" width="140" />
  <el-table-column prop="email" label="邮箱" min-width="180" />
  <el-table-column label="操作" width="180" fixed="right">
    <template #default="{ row }">
      <el-button size="small" link>查看</el-button>
      <el-button size="small" link type="primary">编辑</el-button>
      <el-button size="small" link type="danger">删除</el-button>
    </template>
  </el-table-column>
</el-table>

<!-- ❌ 错误：不要省略 border 和 stripe -->
<el-table :data="tableData">
  <el-table-column prop="name" label="姓名" />
</el-table>
```text

### 3.2 表格分页

```vue
<!-- ✅ 正确：标准分页 -->
<el-pagination
  v-model:current-page="pagination.page"
  v-model:page-size="pagination.size"
  :total="pagination.total"
  :page-sizes="[10, 20, 50, 100]"
  layout="total, sizes, prev, pager, next, jumper"
  @size-change="handleSizeChange"
  @current-change="handlePageChange"
/>

<!-- ❌ 错误：不要省略 page-sizes -->
<el-pagination
  v-model:current-page="pagination.page"
  :total="pagination.total"
/>
```text

### 3.3 表格操作栏

```vue
<!-- ✅ 正确：表格上方操作栏 -->
<div class="table-toolbar">
  <div class="toolbar-left">
    <el-button type="primary" :icon="Plus">新增</el-button>
    <el-button :icon="Download">导出</el-button>
  </div>
  <div class="toolbar-right">
    <el-input
      v-model="searchKeyword"
      placeholder="请输入关键词搜索"
      clearable
      style="width: 240px"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>
  </div>
</div>

<style scoped>
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
```text

---

## 4. 布局组件

### 4.1 卡片布局

```vue
<!-- ✅ 正确：标准卡片 -->
<el-card shadow="never">
  <template #header>
    <div class="card-header">
      <span>用户列表</span>
      <el-button type="primary" :icon="Plus">新增</el-button>
    </div>
  </template>

  <!-- 卡片内容 -->
  <el-table :data="tableData" />
</el-card>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<!-- ❌ 错误：不要使用过深的阴影 -->
<el-card shadow="always">
  <!-- 内容 -->
</el-card>
```text

### 4.2 栅格布局

```vue
<!-- ✅ 正确：响应式栅格 -->
<el-row :gutter="16">
  <el-col :xs="24" :sm="12" :md="8" :lg="6">
    <el-card>卡片1</el-card>
  </el-col>
  <el-col :xs="24" :sm="12" :md="8" :lg="6">
    <el-card>卡片2</el-card>
  </el-col>
  <el-col :xs="24" :sm="12" :md="8" :lg="6">
    <el-card>卡片3</el-card>
  </el-col>
  <el-col :xs="24" :sm="12" :md="8" :lg="6">
    <el-card>卡片4</el-card>
  </el-col>
</el-row>

<!-- ❌ 错误：不要省略 gutter -->
<el-row>
  <el-col :span="6">卡片1</el-col>
  <el-col :span="6">卡片2</el-col>
</el-row>
```text

---

## 5. 反馈组件

### 5.1 消息提示

```typescript
// ✅ 正确：成功提示
ElMessage.success('操作成功')

// ✅ 正确：错误提示
ElMessage.error('操作失败，请重试')

// ✅ 正确：警告提示
ElMessage.warning('请先选择要操作的数据')

// ✅ 正确：信息提示
ElMessage.info('数据加载中...')

// ❌ 错误：不要使用过长的提示文本
ElMessage.success('操作成功，数据已保存到数据库，您可以在列表中查看最新数据')
```text

### 5.2 确认对话框

```typescript
// ✅ 正确：删除确认
ElMessageBox.confirm(
  '此操作将永久删除该数据，是否继续？',
  '提示',
  {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }
).then(() => {
  // 确认操作
}).catch(() => {
  // 取消操作
})

// ❌ 错误：不要省略提示类型
ElMessageBox.confirm('是否删除？')
```text

---

**下一部分将继续：导航组件、数据展示组件**
