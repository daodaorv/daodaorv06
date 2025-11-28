# 🚀 小程序端AI助手GitHub仓库管理资料

## 📋 必须提供的Git仓库信息

### 1. 基础仓库信息
```bash
# 远程仓库地址
Origin: https://github.com/daodaorv/daodao05.git

# 当前分支
当前分支: ui-optimization-phase1
主分支: main

# 最近提交
001021da docs: 添加文档重组方案和任务完成报告
3db21185 feat: 完成独立开发架构重组和文档体系建设
```

### 2. 当前Git状态
```bash
# 修改状态
M CLAUDE.md                    # 根级AI上下文文件已更新
M backend/src/index.ts         # 后端入口文件已修改

# 删除状态 (大量文件已删除)
D admin-console/docs/development/*    # 开发文档已删除
D backend/docs/development/*          # 开发文档已删除
D miniprogram/*                        # 小程序端文件已清空
D mobile-admin/*                      # 移动管理端文件已清空
```

## 🎯 小程序端开发GitHub管理规范

### 📝 强制提交规范 (Always)

#### 1. 提交前必须执行的步骤
```markdown
# 在每次提交前，必须确认：
1. 已阅读 miniprogram/docs/小程序端技术栈文档
2. 已阅读 miniprogram/docs/小程序端产品需求文档
3. 已更新 miniprogram/docs/实施计划
4. 已更新 miniprogram/docs/小程序端API.md 并记录状态
5. 代码通过基本测试
6. 符合项目规范
```

#### 2. 提交信息格式 (Conventional Commits)
```bash
# 类型(范围): 简短描述 (必须遵循)

# 示例：
feat(miniprogram): 添加首页轮播图组件
fix(miniprogram): 修复车辆列表页面显示问题
docs(miniprogram): 更新API文档状态
refactor(miniprogram): 重构车辆详情页面结构
test(miniprogram): 添加用户认证单元测试
chore(miniprogram): 更新依赖包版本
```

#### 3. 小程序��开发状态跟踪
```markdown
# 在提交信息中必须包含开发状态：
# 状态选项：未开发 | 已开发 | 待后端开发 | 待联调 | 联调结果

# 示例：
feat(miniprogram): 添加用户登录页面 [已开发]
feat(miniprogram): 实现车辆搜索功能 [待后端开发]
fix(miniprogram): 修复订单提交问题 [联调结果]
```

## 🔄 分支管理策略

### 当前分支策略
```bash
# 主分支
main                    # 生产环境代码，不接受直接提交

# 开发分支
ui-optimization-phase1  # 当前UI优化阶段分支
小程序开发建议在此分支进行

# 功能分支 (推荐)
feat/miniprogram-auth           # 认证功能开发
feat/miniprogram-vehicles       # 车辆功能开发
feat/miniprogram-orders         # 订单功能开发
```

### 分支操作命令
```bash
# 创建新功能分支
git checkout -b feat/miniprogram-auth

# 切换分支
git checkout ui-optimization-phase1

# 合并分支
git checkout ui-optimization-phase1
git merge feat/miniprogram-auth

# 推送分支
git push -u origin feat/miniprogram-auth
```

## 📊 小程序端开发进度追踪

### API状态管理表
```markdown
# 在 miniprogram/docs/小程序端API.md 中维护：

| 模块 | 接口 | 状态 | 备注 |
|------|------|------|------|
| 用户认证 | /api/auth/login | 未开发 | 用户登录接口 |
| 车辆管理 | /api/vehicles/list | 已开发 | 使用Mock数据 |
| 订单管理 | /api/orders/create | 待后端开发 | 创建订单 |
```

### 实施计划更新
```markdown
# 在 miniprogram/docs/实施计划 中维护：

## Phase 1: 基础页面重构 (当前周)
- [x] 项目架构初始化
- [ ] 首页开发 [进行中]
- [ ] 登录注册页面
- [ ] 车辆列表页面

## Phase 2: 核心功能开发 (下周)
- [ ] 车辆详情页面
- [ ] 订单管理功能
- [ ] 用户中心功能
```

## 🚨 Git操作注意事项

### 1. 危险操作确认
```bash
# 以下操作需要二次确认：
git push --force              # 强制推送
git reset --hard HEAD~3       # 硬重置
git clean -fd                 # 删除未跟踪文件
git branch -D branch_name     # 强制删除分支
```

### 2. 文件忽略规则
```gitignore
# 小程序端特定忽略
miniprogram/unpackage/
miniprogram/node_modules/
miniprogram/.hbuilderx/
mobile-admin/unpackage/
mobile-admin/node_modules/
mobile-admin/.hbuilderx/

# 开发工具文件
*.log
.DS_Store
Thumbs.db
```

## 🔧 开发工作流

### 标准开发流程
```bash
# 1. 开始开发前
git checkout ui-optimization-phase1
git pull origin ui-optimization-phase1

# 2. 创建功能分支
git checkout -b feat/miniprogram-[功能名]

# 3. 开发过程中
git add .
git commit -m "feat(miniprogram): 开发描述 [状态]"
git push -u origin feat/miniprogram-[功能名]

# 4. 功能完成后
git checkout ui-optimization-phase1
git merge feat/miniprogram-[功能名]
git push origin ui-optimization-phase1

# 5. 更新文档
# 手动更新API文档和实施计划
git add miniprogram/docs/
git commit -m "docs(miniprogram): 更新开发进度文档"
git push origin ui-optimization-phase1
```

### 常用Git命令
```bash
# 查看状态
git status

# 查看差异
git diff
git diff --staged

# 查看历史
git log --oneline -10
git log --graph --oneline --all

# 撤销操作
git checkout -- file.txt      # 撤销文件修改
git reset HEAD file.txt       # 撤销暂存
git reset --soft HEAD~1       # 撤销最后一次提交(保留修改)
git reset --hard HEAD~1       # 撤销最后一次提交(丢弃修改)
```

## 📈 质量保证

### 提交前检查清单
```markdown
□ 已阅读相关技术栈文档和需求文档
□ 已更新实施计划和API文档
□ 代码通过基本功能测试
□ 提交信息符合Conventional Commits规范
□ 包含正确的开发状态标记
□ 没有敏感信息提交
□ 文件编码正确(UTF-8)
```

### 代码审查要点
```markdown
□ 代码结构清晰，符合Vue 3 + uni-app规范
□ 组件命名符合规范
□ API调用正确处理错误情况
□ Mock数据与后端API结构一致
□ 样式符合设计规范
□ 性能考虑(避免不必要的重渲染)
```

---

**重要提醒**: 所有GitHub操作必须遵循强制开发规则，确保文档同步更新和状态准确记录！