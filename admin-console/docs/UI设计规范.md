# 叨叨房车 PC 管理端 UI 设计规范

**文档版本**: v1.0.0 | **创建时间**: 2026-01-03 | **维护者**: 叨叨房车技术团队

---

## 📋 文档说明

本文档定义了叨叨房车 PC 管理端的完整 UI 设计规范，包括设计系统、组件规范、布局规范和交互规范。所有开发人员和设计师必须严格遵循本规范，确保产品视觉和交互的一致性。

### 规范目标

- ✅ **一致性**：统一的视觉语言和交互模式
- ✅ **专业性**：符合企业级管理系统的专业形象
- ✅ **易用性**：清晰的信息层级和高效的操作流程
- ✅ **可维护性**：标准化的组件和样式，降低维护成本

---

## 📋 目录

1. [设计系统](#1-设计系统)
   - 1.1 [颜色系统](#11-颜色系统)
   - 1.2 [字体系统](#12-字体系统)
   - 1.3 [间距系统](#13-间距系统)
   - 1.4 [圆角与阴影](#14-圆角与阴影)
2. [组件规范](#2-组件规范)
3. [布局规范](#3-布局规范)
4. [交互规范](#4-交互规范)
5. [响应式设计](#5-响应式设计)

---

## 1. 设计系统

### 1.1 颜色系统

#### 主色调（Primary Colors）

**品牌主色 - 蓝色系**

```scss
// 主色
$primary: #409EFF;           // 主要操作、链接、选中状态
$primary-light-3: #79BBFF;   // 悬停状态
$primary-light-5: #A0CFFF;   // 按下状态
$primary-light-7: #C6E2FF;   // 禁用状态
$primary-light-9: #ECF5FF;   // 背景色

$primary-dark-2: #337ECC;    // 深色主题
```text

**使用场景：**

- ✅ 主要操作按钮（新增、保存、确认）
- ✅ 重要链接和导航激活状态
- ✅ 进度条、加载状态
- ✅ 选中状态（复选框、单选框、开关）

#### 功能色（Functional Colors）

```scss
// 成功 - 绿色
$success: #67C23A;
$success-light: #95D475;
$success-lighter: #E1F3D8;

// 警告 - 橙色
$warning: #E6A23C;
$warning-light: #EEBC6C;
$warning-lighter: #FAECD8;

// 危险 - 红色
$danger: #F56C6C;
$danger-light: #F89898;
$danger-lighter: #FDE2E2;

// 信息 - 灰色
$info: #909399;
$info-light: #B1B3B8;
$info-lighter: #E9E9EB;
```text

**使用场景：**

- ✅ **成功**：操作成功提示、成功状态标签、完成状态
- ✅ **警告**：需要注意的信息、待处理状态
- ✅ **危险**：删除操作、错误提示、失败状态
- ✅ **信息**：中性信息、禁用状态、次要文本

#### 中性色（Neutral Colors）

```scss
// 文本颜色
$text-primary: #303133;      // 主要文本
$text-regular: #606266;      // 常规文本
$text-secondary: #909399;    // 次要文本
$text-placeholder: #C0C4CC;  // 占位文本

// 边框颜色
$border-base: #DCDFE6;       // 基础边框
$border-light: #E4E7ED;      // 浅色边框
$border-lighter: #EBEEF5;    // 更浅边框
$border-extra-light: #F2F6FC; // 极浅边框

// 背景颜色
$bg-white: #FFFFFF;          // 白色背景
$bg-page: #F5F7FA;           // 页面背景
$bg-hover: #F5F7FA;          // 悬停背景
$bg-disabled: #F5F7FA;       // 禁用背景
```text

#### 颜色使用原则

**1. 对比度要求**

- 正文文本与背景对比度 ≥ 4.5:1
- 大号文本（18px+）与背景对比度 ≥ 3:1
- 交互元素与背景对比度 ≥ 3:1

**2. 颜色语义化**

- 🔴 红色：危险、删除、错误、失败
- 🟢 绿色：成功、完成、正常、通过
- 🟡 橙色：警告、待处理、需注意
- 🔵 蓝色：主要操作、链接、信息
- ⚫ 灰色：禁用、次要、中性

**3. 颜色层级**

- 主要信息：使用主色或深色文本
- 次要信息：使用灰色文本
- 辅助信息：使用浅灰色文本

---

### 1.2 字体系统

#### 字体家族

```scss
$font-family: 'Helvetica Neue', Helvetica, 'PingFang SC',
              'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
              Arial, sans-serif;
```text

**字体选择原则：**

- ✅ 优先使用系统字体，避免加载外部字体
- ✅ 中文优先使用苹方（PingFang SC）和微软雅黑
- ✅ 英文优先使用 Helvetica Neue
- ✅ 确保跨平台一致性

#### 字体大小

```scss
// 标题字号
$font-size-h1: 24px;  // 页面主标题
$font-size-h2: 20px;  // 区块标题
$font-size-h3: 18px;  // 卡片标题
$font-size-h4: 16px;  // 小标题

// 正文字号
$font-size-base: 14px;    // 基础字号（默认）
$font-size-medium: 13px;  // 中等字号
$font-size-small: 12px;   // 小字号
$font-size-mini: 11px;    // 极小字号（谨慎使用）
```text

#### 字重（Font Weight）

```scss
$font-weight-light: 300;    // 细体（极少使用）
$font-weight-regular: 400;  // 常规（正文）
$font-weight-medium: 500;   // 中等（强调）
$font-weight-bold: 600;     // 粗体（标题）
$font-weight-bolder: 700;   // 更粗（特殊强调）
```text

#### 行高（Line Height）

```scss
$line-height-base: 1.5;     // 正文行高
$line-height-title: 1.2;    // 标题行高
$line-height-compact: 1.3;  // 紧凑行高（表格）
```text

#### 字体使用规范

| 场景 | 字号 | 字重 | 颜色 | 行高 |
|------|------|------|------|------|
| 页面主标题 | 24px | 600 | #303133 | 1.2 |
| 区块标题 | 20px | 600 | #303133 | 1.2 |
| 卡片标题 | 18px | 500 | #303133 | 1.2 |
| 小标题 | 16px | 500 | #303133 | 1.2 |
| 正文 | 14px | 400 | #606266 | 1.5 |
| 次要文本 | 14px | 400 | #909399 | 1.5 |
| 辅助文本 | 12px | 400 | #909399 | 1.5 |
| 表格内容 | 14px | 400 | #606266 | 1.3 |
| 按钮文字 | 14px | 400 | - | 1 |
| 标签文字 | 12px | 400 | - | 1 |

---

### 1.3 间距系统

#### 基础间距单位

采用 **8px 栅格系统**，所有间距都是 8 的倍数。

```scss
$spacing-xs: 4px;    // 极小间距
$spacing-sm: 8px;    // 小间距
$spacing-md: 16px;   // 中等间距（默认）
$spacing-lg: 24px;   // 大间距
$spacing-xl: 32px;   // 超大间距
$spacing-xxl: 48px;  // 极大间距
```text

#### 间距使用规范

**1. 组件内部间距（Padding）**

| 组件类型 | 内边距 | 说明 |
|---------|--------|------|
| 按钮 | 12px 20px | 上下12px，左右20px |
| 输入框 | 8px 12px | 上下8px，左右12px |
| 卡片 | 20px | 四周20px |
| 表格单元格 | 12px 16px | 上下12px，左右16px |
| 对话框 | 20px | 四周20px |
| 抽屉 | 24px | 四周24px |

**2. 组件外部间距（Margin）**

| 场景 | 间距 | 说明 |
|------|------|------|
| 页面内容区 | 20px | 页面四周留白 |
| 卡片之间 | 20px | 垂直间距 |
| 表单项之间 | 16px | 垂直间距 |
| 按钮之间 | 8px | 水平间距 |
| 标签之间 | 8px | 水平间距 |
| 区块之间 | 24px | 大区块间距 |

**3. 布局间距**

```scss
// 页面布局
$layout-padding: 20px;        // 页面内边距
$layout-gap: 20px;            // 布局间隙

// 栅格间距
$grid-gutter: 16px;           // 栅格列间距

// 区块间距
$section-margin: 24px;        // 区块间距
```text

---

### 1.4 圆角与阴影

#### 圆角（Border Radius）

```scss
$radius-none: 0;              // 无圆角
$radius-sm: 2px;              // 小圆角（标签）
$radius-base: 4px;            // 基础圆角（按钮、输入框）
$radius-md: 6px;              // 中等圆角（卡片）
$radius-lg: 8px;              // 大圆角（对话框）
$radius-xl: 12px;             // 超大圆角（特殊卡片）
$radius-round: 50%;           // 圆形（头像）
```text

**使用规范：**

- 按钮、输入框：4px
- 卡片、面板：6px
- 对话框、抽屉：8px
- 头像、徽章：50%（圆形）

#### 阴影（Box Shadow）

```scss
// 基础阴影
$shadow-base: 0 2px 4px rgba(0, 0, 0, 0.12),
              0 0 6px rgba(0, 0, 0, 0.04);

// 浅色阴影
$shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

// 深色阴影
$shadow-dark: 0 2px 16px 0 rgba(0, 0, 0, 0.12);

// 悬浮阴影
$shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
```text

**使用场景：**

- 卡片：`$shadow-base`
- 下拉菜单：`$shadow-light`
- 对话框：`$shadow-dark`
- 悬浮效果：`$shadow-hover`

---

**下一部分将继续：组件规范、布局规范、交互规范**
