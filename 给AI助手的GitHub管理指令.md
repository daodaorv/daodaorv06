# 📋 给小程序端AI助手的GitHub管理指令模板

## 🎯 直接提供给AI助手的指令

```
请按照以下规范管理GitHub仓库：

### 📚 必读文档 (开发前)
1. miniprogram/docs/小程序端技术栈文档
2. miniprogram/docs/小程序端产品需求文档

### 🔄 进度更新要求 (每次提交后)
1. 更新 miniprogram/docs/实施计划
2. 更新 miniprogram/docs/小程序端API.md，记录状态：未开发|已开发|待后端开发|待联调|联调结果

### 📝 Git仓库信息
- 远程仓库: https://github.com/daodaorv/daodao05.git
- 当前分支: ui-optimization-phase1
- 主分支: main

### ✅ 提交规范
格式: 类型(miniprogram): 描述 [状态]
类型: feat, fix, docs, refactor, test, chore
状态: 未开发, 已开发, 待后端开发, 待联调, 联调结果

### 🚨 当前仓库状态
- 小程序端和移动管理端已清空，只保留docs目录
- 大量开发文档已删除
- 需要在ui-optimization-phase1分支开发
- 遵循现有的项目架构和规范

详细操作指南请参考: 小程序端AI助手GitHub管理资料.md
```

## 🔧 快速复制指令给AI助手

您可以直接将以下内容复制给负责小程序端开发的AI助手：

---
**给小程序端AI助手的GitHub管理指令：**

请严格按照以下要求管理GitHub仓库：

**仓库信息：**
- 远程：https://github.com/daodaorv/daodao05.git
- 当前分支：ui-optimization-phase1
- 注意：小程序端已清空重构，只保留docs目录

**强制规则：**
1. **开发前必须阅读**：miniprogram/docs/小程序端技术栈文档 和 小程序端产品需求文档
2. **每次提交后必须更新**：
   - miniprogram/docs/实施计划
   - miniprogram/docs/小程序端API.md (记录开发状态)

**提交格式：**
`类型(miniprogram): 描述 [状态]`
- 状态选项：未开发、已开发、待后端开发、待联调、联调结果
- 类型：feat、fix、docs、refactor、test、chore

**示例：**
- `feat(miniprogram): 添加用户登录页面 [已开发]`
- `fix(miniprogram): 修复车辆列表显示问题 [联调结果]`

详细操作请参考仓库中的完整管理文档。
---