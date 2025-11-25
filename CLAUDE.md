# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

叨叨房车是一个全面的房车租赁管理平台，连接客户、车主和管理员，支持多个平台。

**当前状态**: ✅ 基础框架完成，核心业务模块已开发，包含完整的前后端架构和数据库设计

**项目进度**:
- 后端API: 90% (基础架构、认证、DIY系统完成)
- 小程序端: 70% (33个页面、基础功能完成)
- PC管理后台: 60% (29个组件、DIY编辑器完成)
- 移动管理端: 30% (基础结构完成)

## 系统架构

### 多平台结构
- **C端微信小程序** (`miniprogram/`): 面向客户的租赁平台，33个页面，支持完整的预订流程
- **B端PC管理后台** (`admin-console/`): 行政管理系统，包含DIY页面编辑器
- **B端移动管理** (`mobile-admin/`): 现场移动管理应用，基础功能已实现
- **后端API服务** (`backend/`): 服务所有平台的统一RESTful API，65个TS文件

### 技术栈

#### 前端技术栈
- **小程序和移动管理**: uni-app 3.0.0 + Vue 3.5.0 + TypeScript 5.1.6
- **PC管理后台**: Vue 3.5.0 + Vite 4.4.9 + Element Plus 2.11.7 + TypeScript 5.1.6
- **状态管理**: Vue 3 Composition API + Pinia
- **开发工具**: HBuilderX (uni-app), VS Code (PC后台)

#### 后端技术栈
- **运行时**: Node.js 18.18.0 LTS
- **框架**: Express.js 4.18.2 + TypeScript 5.1.6
- **数据库**: MySQL 8.0.35 (Docker) + Redis 7.2.3 (Docker)
- **ORM**: Sequelize 6.32.1
- **身份认证**: JWT (jsonwebtoken 9.0.2)

#### 核心依赖版本
- Vue: 3.5.0 (全端统一)
- TypeScript: 5.1.6 (全端统一)
- Element Plus: 2.11.7 (PC端)
- uni-ui: 1.4.28 (小程序端)
- Express.js: 4.18.2 (后��)
- MySQL: 8.0.35 (数据库)
- Node.js: 18.18.0 LTS (运行环境)

## 核心工作流程

**重要：每个任务必须遵循此流程**

### 0. uni-app开发强制要求（小程序端、移动管理端）
- **强制阅读**：开始任何小程序端或移动管理端开发前，**必须**完整阅读 `Docs/uni-app开发指导文档.md`
- **组件优先级**：严格遵循 内置组件 > uni-ui组件 > 自定义组件 的选择顺序
- **禁止重复造轮子**：严禁开发与uni-ui功能重复的基础组件
- **开发前检查**：使用easycom自动引入，确保pages.json配置正确
- **规范遵循**：所有组件开发必须遵循Vue 3 + TypeScript + uni-app最佳实践

### 1. 研究阶段（RESEARCH）
- 检查现有代码库中的类似实现
- 使用 Glob/Grep 搜索相关代码
- 理解项目架构和依赖关系
- **uni-app任务：查阅 `Docs/uni-app开发指导文档.md` 确认组件使用规范**
- **不确定时：联网搜索最新文档和最佳实践**

### 2. 计划阶段（PLAN）
- 列出要修改/创建的文件清单
- 说明实现方案和关键步骤
- 识别潜在风险和边缘情况
- **重要：获得用户确认后再开始编码**

### 3. 实现阶段（IMPLEMENT）
- 遵循项目现有代码风格
- 完整的错误处理（绝不跳过）
- 编写时同步添加测试
- 运行 linter/formatter/type-checker

**复杂架构问题：先深度思考再提出方案**

---

## 项目结构详解

### 后端架构 (`backend/`)
```
backend/
├── src/
│   ├── controllers/         # 控制器层 (14个文件)
│   │   ├── auth.controller.ts
│   │   ├── VehicleController.ts
│   │   ├── order*.ts (多个订单相关控制器)
│   │   └── DIY相关控制器
│   ├── routes/              # 路由定义 (14个路由文件)
│   │   ├── auth.routes.ts
│   │   ├── vehicles.ts
│   │   ├── orders.ts
│   │   └── diy.*.ts (DIY系统路由)
│   ├── models/              # 数据模型层
│   │   ├── User.ts + UserProfile.ts
│   │   ├── diy.models.ts (DIY系统模型)
│   │   └── VerificationCode.ts
│   ├── middleware/          # 中间件
│   │   ├── auth.ts + errorHandler.ts
│   │   └── validation.ts
│   ├── services/            # 业务服务层
│   │   ├── auth.service.*.ts
│   │   ├── diy.service.ts
│   │   └── order*.ts (订单服务)
│   └── config/              # 配置文件
│       ├── database.ts + redis.ts
├── database/                # 数据库脚本
│   ├── schema/ (9个SQL文件)
│   └── seeds/
└── API测试指南.md
```

### 小程序端架构 (`miniprogram/`)
```
miniprogram/
├── pages/                   # 33个页面文件
│   ├── home/ + community/ + crowdfunding/
│   ├── vehicles/ (详情、搜索、筛选)
│   ├── order/ (确认、列表、详情)
│   ├── payment/ (支付、结果、记录)
│   ├── auth/ + profile/ + favorite/
│   ├── rating/ + help/ + vip/
│   └── service/ + camping/ + travel/
├── components/              # 公共组件
├── api/                     # API接口层 (11个文件)
│   ├── auth.js + order.js + vehicle.js
│   ├── payment.js + coupon.js
│   └── crowdfunding.js
├── stores/                  # 状态管理
│   ├── user.js + vehicle.js
├── static/                  # 静态资源
└── utils/request.js         # 网络请求封装
```

### PC管理后台架构 (`admin-console/`)
```
admin-console/
├── src/
│   ├── views/               # 页面组件 (29个Vue组件)
│   │   ├── Dashboard.vue + Login.vue
│   │   ├── diy/ (DIY编辑器相关)
│   │   ├── orders/ + vehicles/
│   │   └── 通用管理页面
│   ├── components/          # 公共组件
│   │   └── diy/editor/ (DIY编辑器组件)
│   ├── api/                 # API接口
│   ├── stores/              # Pinia状态管理
│   ├── router/              # Vue Router配置
│   └── styles/              # SCSS样式
├── vite.config.ts           # Vite构建配置
└── auto-import配置           # 自动导入配置
```

### 移动管理端架构 (`mobile-admin/`)
```
mobile-admin/
├── pages/                   # 管理页面
│   ├── login/ + index/
│   └── users/ (用户管理)
├── api/                     # API接口
├── utils/                   # 工具函数
└── config/                  # 配置文件
```

---

## 数据库架构

### 核心业务表
- **用户模块**: `users` + `user_profiles` + `verification_codes`
- **车辆模块**: `vehicle_brands` + `vehicle_models` + `vehicles`
- **门店模块**: `stores` + `store_users`
- **订单模块**: `orders` + `order_status_logs`
- **支付模块**: `payments`
- **营销模块**: `coupons` + `user_coupons`
- **DIY系统**: `diy_pages` + `diy_components` + `diy_templates`

### 系统管理表
- **权限管理**: `roles` + `user_roles`
- **系统配置**: `system_configs`
- **日志审计**: `operation_logs`

### 数据库配置
- **字符集**: utf8mb4 + utf8mb4_unicode_ci
- **时区**: +08:00
- **存储引擎**: InnoDB
- **连接信息**: localhost:3306, 数据库 `daodao`

---

## API设计规范

### 统一架构
- **基础路径**: `/api/v1/{module}/`
- **认证方式**: JWT Bearer Token
- **权限控制**: 基于用户类型和权限列表

### 标准响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {...},
  "meta": {
    "timestamp": "2025-11-23T10:00:00+08:00",
    "requestId": "req_123456"
  }
}
```

### 错误码体系
- **通用错误**: 100000-199999
- **用户相关**: 200000-299999
- **订单相关**: 300000-399999
- **支付相关**: 400000-499999
- **车辆相关**: 500000-599999

---

## 开发环境配置

### 环境要求
- **Node.js**: 18.18.0 LTS
- **HBuilderX**: 3.8+ (小程序开发)
- **VS Code**: 1.80+ (PC后台开发)
- **Docker**: 20.10+ (数据库服务)
- **微信开发者工具**: 最新版本

### 服务端口分配
- **后端API**: 3000
- **PC管理后台**: 5173 (Vite)
- **MySQL**: 3306
- **Redis**: 6379
- **Adminer**: 8080 (数据库管理)

### 数据库连接
```bash
# 启动数据库服务
docker compose up -d mysql redis

# 连接信息
Host: localhost:3306
Database: daodao
Username: daodao_dev
Password: daodao_dev_2024
```

### 快速启动命令
```bash
# 后端服务
cd backend && npm run dev

# PC管理后台
cd admin-console && npm run dev

# 小程序开发 (HBuilderX)
# 导入 miniprogram/ 目录并运行到微信开发者工具
```

---

## 质量红线（绝不违反）

### 提交前强制检查
- **必须通过** Linter（零警告零错误）
- **必须通过** 所有测试
- **必须完成** 代码格式化
- **必须通过** 类型检查（TypeScript/静态类型语言）

### uni-app开发绝对禁止的行为
- ❌ **绝不** 使用与uni-ui功能重复的自定义组件
- ❌ **绝不** 在uni-app项目中使用除uni-ui外的其他UI库
- ❌ **绝不** 忽略组件使用优先级原则
- ❌ **绝不** 开发小程序端前不阅读 `Docs/uni-app开发指导文档.md`
- ❌ **绝不** 在代码中硬编码px单位，必须使用upx
- ❌ **绝不** 跳过跨端兼容检查

### 通用绝对禁止的行为
- ❌ **绝不** 提交未通过测试的代码
- ❌ **绝不** 使用 TODO/占位符/Mock 作为最终代码
- ❌ **绝不** 使用 emoji（无论是 UI 图标还是文档标题）
- ❌ **绝不** 跳过错误处理
- ❌ **绝不** 硬编码密钥/凭证
- ❌ **绝不** 使用 `any` 类型（TypeScript 必须用 `unknown`）
- ❌ **绝不** 说"这是简化版"、"生产环境需要..."

---

## 通用编码标准

### Clean Code 原则（强制遵循）

**有意义的命名:**
- ✅ `getUserById(id)` ❌ `getData(x)`
- ✅ `MAX_RETRY_COUNT = 3` ❌ `num = 3`
- **函数名应该是动词**，变量名应该是名词

**单一职责原则（SRP）:**
- 一个函数只做一件事
- 一个类只有一个修改理由
- **重要：函数超过 30 行需要拆分**

**DRY 原则（Don't Repeat Yourself）:**
- **绝不** 复制粘贴代码
- 重复 3 次以上必须提取为函数
- 相似逻辑必须抽象为通用函数

### 错误处理（强制）

**TypeScript/JavaScript:**
```typescript
// 必须使用 unknown，不能用 any
try {
  await operation();
} catch (error: unknown) {
  if (error instanceof Error) {
    logger.error('操作失败', { message: error.message });
  }
  throw error; // 重新抛出，不要吞掉错误
}
```

**空值处理（重要）：**
```typescript
// ✅ 正确：使用可选链和空值合并
const userName = user?.profile?.name ?? 'Guest';

// ✅ 正确：函数参数验证
function processUser(user: User | null) {
  if (!user) {
    throw new Error('User is required');
  }
  // 继续处理
}

// ❌ 错误：未检查空值
const name = user.profile.name; // 可能导致运行时错误
```

**边界条件检查：**
```typescript
// 必须检查边界条件
function getItem(arr: any[], index: number) {
  if (index < 0 || index >= arr.length) {
    throw new Error('Index out of bounds');
  }
  return arr[index];
}
```

### 命名规范

遵循项目现有风格，常见约定：
- 文件: `kebab-case.ts`, `PascalCase.tsx`（组件）
- 变量/函数: `camelCase`
- 类/组件: `PascalCase`
- 常量: `SCREAMING_SNAKE_CASE`
- 数据库表: `snake_case`

**重要：优先遵循项目现有命名风格**

### Emoji 使用规范（重要）

**禁止在任何地方使用 emoji：**
- ❌ UI 界面中（图标、按钮）
- ❌ 代码注释中
- ❌ 文档标题中（包括 README、CLAUDE.md）
- ❌ Git commit 消息中
- ❌ 日志输出中

**原因：**
- 跨平台显示不一致
- 可访问性差
- 不够专业
- 难以搜索和维护

**图标正确做法（按优先级）：**
1. UI 框架自带图标（uni-ui、Element Plus）
2. 专业图标库（uni-icons）
3. 自定义 SVG

**代码示例：**
```typescript
// ❌ 错误：UI 中使用 emoji
<button>💾 保存</button>

// ❌ 错误：注释中使用 emoji
// 🔥 重要：这个函数很关键

// ❌ 错误：日志中使用 emoji
logger.info('✅ 用户登录成功');

// ✅ 正确：使用图标库
<button><uni-icons type="checkmarkempty" size="20"></uni-icons>保存</button>

// ✅ 正确：纯文本注释
// 重要：这个函数很关键

// ✅ 正确：纯文本日志
logger.info('用户登录成功');
```

---

## 安全标准（强制）

### 输入验证
- **必须** 验证所有用户输入
- **必须** 使用验证库
- **绝不** 信任客户端数据

### 数据库安全
- **必须** 使用参数化查询
- **必须** 防止 SQL 注入
- **推荐** 使用 ORM/查询构建器

### 认证授权
- 短期访问令牌（15分钟）+ 长期刷新令牌（7天）
- **绝不** 在代码中硬编码密钥
- **必须** 使用环境变量存储敏感信息

---

## 前端开发规范

### uni-app开发专项规范（强制遵循）

**组件使用原则：**
- **第一优先级**：uni-app内置组件（view、text、image、swiper等）
- **第二优先级**：uni-ui组件库（uni-card、uni-button、uni-tag等）
- **第三优先级**：自定义业务组件（仅在前两者无法满足时）
- **绝对禁止**：开发与uni-ui功能重复的基础组件

**必须删除的重复组件：**
- `BaseCard.vue` → 使用 `uni-card`
- `BaseButton.vue` → 使用 `uni-button`
- `BaseTag.vue` → 使用 `uni-tag`
- `BaseBadge.vue` → 使用 `uni-badge`
- `BaseDivider.vue` → 使用 `uni-list-item` 的 divider 属性

**性能优化强制要求：**
- 列表渲染必须使用 `key` 属性
- 长列表必须使用分页或虚拟滚动
- 图片必须设置 `mode` 和 `lazy-load`
- 禁止 `v-for` 和 `v-if` 同时使用

**跨端兼容处理：**
- 使用 `upx` 单位替代 `px`
- 条件编译处理平台差异：`#ifdef MP-WEIXIN`
- 避免使用平台特有API

**Vue 3 + TypeScript强制规范：**
- 禁止使用 `any` 类型，必须用 `unknown`
- Composition API 优于 Options API
- 所有 props 必须定义类型接口
- 必须使用 `withDefaults` 设置默认值

### PC端开发规范（Element Plus）

**组件使用原则：**
- 优先使用 Element Plus 组件库
- 保持设计语言一致性
- 按需引入减少打包体积

### 组件设计原则
- **组件拆分粒度**：单个组件代码不超过 200 行
- **组件命名**：`PascalCase`，见名知意（如 `UserProfileCard`）
- **Props 设计**：必须定义类型（TypeScript）
- **状态管理**：遵循 Vue 3 Composition API

### Vue 3 Composition API 规范

**reactive/ref 规范：**
```typescript
// ✅ 正确：相关状态合并
const user = reactive({ firstName: '', lastName: '' });

// ❌ 错误：分散的相关状态
const firstName = ref('');
const lastName = ref('');
```

**computed 规范：**
```typescript
// ✅ 正确：缓存计算结果
const fullName = computed(() => `${user.firstName} ${user.lastName}`);

// ❌ 错误：重复计算
const fullName = `${user.firstName} ${user.lastName}`;
```

**性能优化：**
```typescript
// ✅ 使用 key 优化列表渲染
{items.map(item => <Item :key="item.id" :data="item" />)}

// ❌ 错误：使用索引作为 key
{items.map((item, index) => <Item :key="index" />)}
```

### UI 组件库使用原则
- **uni-app 项目**：使用 uni-ui 组件库
- **按需引入**：避免全量引入增大打包体积
- **保持一致性**：禁止在同一项目混用多个 UI 库
- **查阅文档**：不确定时联网搜索该 UI 库的最佳实践

### 样式规范
- **遵循项目规范**：使用 SCSS 和设计系统变量
- **避免行内样式**：除非需要动态计算
- **避免全局样式污染**：使用 scoped 样式
- **保持一致性**：整个项目使用统一的样式方案

---

## 后端开发规范

### API 设计原则（重要）

**路由命名：**
- **必须使用名词**，不用动词：`/api/users` ✅ `/api/getUsers` ❌
- **复数形式**：`/users` 而不是 `/user`
- **RESTful 标准**：
  ```
  GET    /api/v1/users          # 列表
  GET    /api/v1/users/:id      # 详情
  POST   /api/v1/users          # 创建
  PUT    /api/v1/users/:id      # 完整更新
  PATCH  /api/v1/users/:id      # 部分更新
  DELETE /api/v1/users/:id      # 删除
  ```

### 响应格式标准
```json
// 成功
{
  "code": 0,
  "message": "success",
  "data": {...},
  "meta": {
    "timestamp": "2025-11-20T10:00:00+08:00"
  }
}

// 错误
{
  "code": 400001,
  "message": "请求参数错误",
  "data": {},
  "meta": {
    "timestamp": "2025-11-20T10:00:00+08:00"
  }
}
```

### HTTP 状态码（严格遵循）
- 200: 成功 | 201: 创建成功 | 204: 删除成功（无返回）
- 400: 请求错误 | 401: 未认证 | 403: 无权限 | 404: 不存在
- 422: 验证失败 | 429: 请求过多 | 500: 服务器错误

### 中间件规范
- **必须顺序**：日志 → CORS → 认证 → 权限 → 业务逻辑
- 错误处理中间件放最后
- 每个中间件单一职责

---

## 测试规范

### 测试覆盖率要求
- 业务逻辑: **80% 以上**
- 关键路径: **100%**
- API 端点: **必须有集成测试**
- **重要：所有测试必须通过才能提交代码**

### 测试文件管理（重要）

**测试文件位置：**
- 单元测试：与源文件同目录（`user.service.ts` → `user.service.test.ts`）
- 集成测试：`tests/integration/` 目录
- 端到端测试：使用小程序开发者工具和浏览器测试

**测试数据管理：**
- **测试完成后必须清理**：删除测试数据、关闭连接、清理临时文件
- 使用 `beforeEach/afterEach` 钩子自动清理
- **绝不** 在测试中修改生产数据
- 使用独立的测试数据库

---

## Git 规范

### 分支命名
- `feature/功能描述`
- `bugfix/问题描述`
- `hotfix/紧急修复`

### Commit 消息（Conventional Commits）
```
类型(范围): 简短描述

[可选的详细说明]
```

**类型:** feat, fix, docs, style, refactor, perf, test, chore

**示例:**
```
feat(首页): 优化房车预订模块UI布局

实现租期选择和城市门店的并排布局，提升用户体验

Closes #123
```

---

## 性能优化原则

### 数据库
- 避免 N+1 查询（使用 eager loading）
- 合理使用索引
- 适当缓存查询结果

### 前端
- 代码分割和懒加载
- 图片优化（压缩、CDN）
- 避免不必要的重渲染

### 后端
- 异步处理耗时操作
- 使用连接池
- Redis 缓存热点数据

**不确定���化方案时：联网搜索该技术栈的性能最佳实践**

---

## 文档标准

### 代码注释
```typescript
/**
 * 处理订单支付
 *
 * @param orderId - 订单 ID
 * @param method - 支付方式
 * @returns 支付确认信息
 * @throws {PaymentError} 支付失败时抛出
 */
```

### README 必须包含
- 项目简介
- 环境要求（Node.js 版本、HBuilderX 版本等）
- 安装步骤
- 开发/测试/构建命令
- 部署说明

---

## 项目适配

### uni-app项目强制检查清单
**开发前必须完成：**
1. **强制阅读** `Docs/uni-app开发指导文档.md` 全文
2. 检查 `pages.json` 中easycom配置是否正确
3. 确认uni-ui组件库已通过uni_modules正确安装
4. 检查现有组件是否符合组件使用优先级原则
5. 使用Grep搜索是否存在重复开发的基础组件

**技术栈识别要点：**
- Vue 3 + Composition API + TypeScript 5.1.6
- uni-ui 1.4.28 作为唯一UI组件库
- 使用upx单位进行响应式布局
- 条件编译处理跨端差异

### 识别技术栈
每个新任务：
1. 检查 `package.json` / `manifest.json`
2. 理解使用的框架和工具
3. **遵循项目现有代码风格**（这点最重要）
4. 不确定时联网搜索该技术栈最佳实践

### 技术栈适配原则
**重要：不要假设技术栈，遵循项目实际使用的技术**

遇到任何技术时，联网查找最新文档和最佳实践：
- 前端框架（Vue 3、uni-app）
- 后端框架（Express、FastAPI、Django、Spring Boot 等）
- 数据库（PostgreSQL、MySQL、MongoDB、Redis 等）
- 移动端（React Native、Flutter、Kotlin、Swift 等）
- UI 库（根据项目选择）
- 状态管理（根据项目选择）
- 样式方案（根据项目选择）

---

## 部署检查清单

**部署前必须完成：**
- [ ] 所有测试通过
- [ ] Linter 零警告
- [ ] 类型检查通过
- [ ] 环境变量已配置
- [ ] 数据库迁移就绪
- [ ] 安全扫描通过

**环境变量管理：**
```bash
# .env.example（提交到 Git）
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=your-secret-here

# .env（添加到 .gitignore，绝不提交）
```

---

## 问题解决流程

### 遇到不确定的情况

**重要：按此顺序执行**

1. **停止** - 不要猜测或假设
2. **研究** - 检查现有代码库类似实现
3. **搜索** - 联网查找官方文档和最佳实践
4. **提问** - 向用户确认需求和方案
5. **计划** - 制定详细实施方案
6. **实现** - 执行并验证

### 应该联网搜索的场景
- 新技术/框架的最佳实践
- 特定库的最新 API 文档
- 错误消息的解决方案
- 性能优化技巧
- 安全漏洞修复方法
- 行业标准和规范

**示例：** "如何在 Vue 3 + uni-app 中实现高性能的列表渲染"

---

## 沟通规范

### 与用户沟通
- 使用清晰、专业的语言
- 避免过度解释和废话
- **提供代码示例优于理论描述**
- 需求不明确时主动提问
- **避免社交短语**（"您说得对"、"好问题"、"我觉得可能"）

### 进度汇报
- 简明说明当前步骤
- 遇到问题立即告知
- 提供预期完成时间（如适用）

---

## 禁止模式

### 禁止的表述
- "这是简化版..."
- "生产环境需要..."
- "TODO: 稍后实现"
- "我觉得可能..."
- "您说得对"

### 禁止的代码
- 超过 30 行的函数
- 嵌套超过 3 层的条件
- 魔法数字（必须使用常量）
- 注释掉的代码
- 重复代码（DRY 原则）

---

## 完成标准

**代码达到生产就绪：**
- ✅ Linter 零警告
- ✅ 所有测试通过
- ✅ 格式化完成
- ✅ 类型检查通过
- ✅ 功能端到端验证
- ✅ 文档已更新
- ✅ 无 TODO 注释
- ✅ Code Review 通过

---

## 快速参考

### 常用命令
```bash
# 开发
npm run dev:mp-weixin  # 小程序开发
npm run dev            # PC后台开发

# 构建
npm run build:mp-weixin # 小程序构建
npm run build          # PC后台构建

# 质量检查
npm run lint           # 代码检查
npm run format         # 代码格式化

# Git
git status
git add .
git commit -m "feat: 功能描述"
git push -u origin branch-name
```

### 关键原则
1. **先研究、后计划、再实现**
2. **不确定时联网搜索**
3. **严格遵循项目现有风格**
4. **测试必须100%通过**
5. **绝不提交失败的代码**

---

## 持续改进

### 项目开始时
- 阅读项目 README 和现有文档
- 了解技术栈和工具链
- 理解现有代码结构和风格
- 搜索该技术栈的最佳实践

### 项目进行中
- 保持代码风格一致性
- 及时更新文档
- 重构混乱代码
- 添加必要的测试

### 项目交付前
- 完整的用户文档
- 清理无用代码和注释
- 确保所有测试通过
- 准备部署和维护文档

---

## 特别提醒

### 中国开发者注意事项
1. **国内网络环境**：使用国内镜像源
2. **时区处理**：明确时区为 Asia/Shanghai（UTC+8）
3. **语言支持**：确保正确处理中文字符（UTF-8 编码）
4. **合规要求**：遵守相关法律法规
5. **支付集成**：支持微信支付、支付宝

### TypeScript 严格模式（强制）

**tsconfig.json 必须启用：**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### 无障碍性（A11y）标准

**必须遵循：**
- 所有交互元素必须可访问
- 使用语义化 HTML 标签
- 表单必须有正确的关联
- 颜色对比度符合标准

### 日志记录规范

**日志级别：**
- **ERROR**: 错误，需要立即处理
- **WARN**: 警告，可能导致问题
- **INFO**: 重要业务流程
- **DEBUG**: 调试信息（生产环境禁用）

```typescript
// ✅ 正确：包含上下文信息
console.error('支付失败', {
  orderId: order.id,
  userId: user.id,
  error: error.message
});

// ❌ 错误：缺少上下文
console.error('支付失败');
```

## 开发环境配置

### 环境要求
- Node.js 18.18.0 LTS
- HBuilderX 3.8+
- 微信开发者工具
- Docker 20.10+（用于数据库服务）

### 数据库服务
```bash
# 启动MySQL和Redis服务
docker compose up -d mysql redis

# 服务访问地址:
# MySQL: localhost:3306
# Redis: localhost:6379
# Adminer (数据库管理): localhost:8080
```

### 开发服务器
- **后端API**: 端口 3000
- **PC管理后台**: 端口 5173 (Vite开发服务器)

## 常用开发命令

### 后端
```bash
cd backend
npm install
npm run dev          # 开发服务器 (localhost:3000)
npm run build        # 生产构建
npm run test         # 运行测试
npm run lint         # 代码检查
```

### 小程序
```bash
cd miniprogram
# 使用 HBuilderX 运行到小程序模拟器
# 或使用命令行:
npm run dev:mp-weixin     # 微信小程序开发
npm run build:mp-weixin   # 微信小程序构建
```

### PC管理后台
```bash
cd admin-console
npm install
npm run dev          # Vite开发服务器 (localhost:5173)
npm run build        # 生产构建
```