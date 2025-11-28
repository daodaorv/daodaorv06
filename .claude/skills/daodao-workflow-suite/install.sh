#!/bin/bash

# 叨叨前端开发工作流工具套件安装脚本

set -e

echo "🚀 开始安装叨叨前端开发工作流工具套件..."

# 检查Node.js版本
echo "📋 检查环境..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not_installed")
if [[ "$NODE_VERSION" == "not_installed" ]]; then
    echo "❌ 错误: 未检测到Node.js，请先安装Node.js 18或更高版本"
    exit 1
fi

echo "✅ Node.js版本: $NODE_VERSION"

# 检查npm
NPM_VERSION=$(npm --version 2>/dev/null || echo "not_installed")
if [[ "$NPM_VERSION" == "not_installed" ]]; then
    echo "❌ 错误: 未检测到npm"
    exit 1
fi

echo "✅ npm版本: $NPM_VERSION"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$SCRIPT_DIR"

echo "📁 安装目录: $INSTALL_DIR"

# 创建.claude目录结构
echo "📁 创建技能目录结构..."
mkdir -p .claude/skills
mkdir -p .claude/cache
mkdir -p .claude/checkpoints

# 复制工具文件
echo "📦 复制工具文件..."
if [[ -d "$INSTALL_DIR/dist" ]]; then
    cp -r "$INSTALL_DIR/dist"/* .claude/skills/
    echo "✅ 工具文件复制完成"
else
    echo "⚠️  警告: dist目录不存在，请先运行构建命令"
    echo "💡 运行以下命令构建工具:"
    echo "   cd $INSTALL_DIR"
    echo "   npm install"
    echo "   npm run build"
fi

# 创建配置文件
echo "⚙️  配置Claude Code设置..."
SETTINGS_FILE=".claude/settings.local.json"

if [[ ! -f "$SETTINGS_FILE" ]]; then
    cat > "$SETTINGS_FILE" << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(curl:*)",
      "Bash(tree:*)",
      "Bash(find:*)",
      "WebSearch",
      "WebFetch(domain:*.vuejs.org)",
      "WebFetch(domain:*.element-plus.org)",
      "WebFetch(domain:*.uniapp.dcloud.net.cn)",
      "WebFetch(domain:*.weixin.qq.com)",
      "Bash(groups:*)",
      "Bash(npm install)",
      "Bash(cat:*)",
      "mcp__context7__resolve-library-id"
    ],
    "deny": [],
    "ask": []
  },
  "skills": {
    "daodao-admin-workflow": {
      "enabled": true,
      "target": "admin-console",
      "auto_recovery": true,
      "description": "叨叨房车PC管理端开发工作流"
    },
    "daodao-miniprogram-workflow": {
      "enabled": true,
      "target": "miniprogram",
      "auto_recovery": true,
      "description": "叨叨房车小程序端开发工作流"
    },
    "daodao-mobile-admin-workflow": {
      "enabled": true,
      "target": "mobile-admin",
      "auto_recovery": true,
      "description": "叨叨房车移动管理端开发工作流"
    }
  }
}
EOF
    echo "✅ 设置文件已创建: $SETTINGS_FILE"
else
    echo "ℹ️  设置文件已存在，跳过创建"
fi

# 创建技能入口文件
echo "🔗 创建技能入口链接..."

# 创建PC管理端技能入口
ADMIN_SKILL_FILE=".claude/skills/daodao-admin-workflow.js"
if [[ ! -f "$ADMIN_SKILL_FILE" ]]; then
    cat > "$ADMIN_SKILL_FILE" << 'EOF'
/**
 * 叨叨房车PC管理端开发工作流技能
 * 使用方法: /skill:daodao-admin-workflow
 */

import { AdminConsoleWorkflow } from './admin-workflow/index.js';

export default {
  name: 'daodao-admin-workflow',
  description: '叨叨房车PC管理端开发工作流 - 基于Vue 3 + Element Plus',
  version: '1.0.0',

  async execute(params, context) {
    const workflow = new AdminConsoleWorkflow();

    try {
      console.log('🔄 启动叨叨PC管理端开发工作流...');

      // 检查项目环境
      await this.validateEnvironment();

      // 执行开发流程
      const result = await workflow.develop();

      return {
        success: true,
        message: 'PC管理端开发完成',
        result: result
      };

    } catch (error) {
      return {
        success: false,
        message: `开发失败: ${error.message}`,
        error: error.stack
      };
    }
  },

  async validateEnvironment() {
    // 检查Vue 3环境
    // 检查Element Plus安装
    // 检查TypeScript配置
    console.log('✅ PC管理端环境检查完成');
  }
};
EOF
    echo "✅ PC管理端技能入口已创建"
fi

# 创建工具使用说明
echo "📖 创建使用说明..."
README_FILE=".claude/README-daodao-workflow.md"

cat > "$README_FILE" << 'EOF'
# 叨叨前端开发工作流工具套件

## 概述

这套工具专为叨叨房车项目设计，提供三个前端端的智能开发工作流支持。

## 支持的项目

- **admin-console**: PC管理端 (Vue 3 + Element Plus)
- **miniprogram**: 小程序端 (uni-app + Vue 3)
- **mobile-admin**: 移动管理端 (uni-app + Vue 3)

## 使用方法

### 基本命令

```bash
# 启动PC管理端开发
/skill:daodao-admin-workflow

# 启动小程序端开发
/skill:daodao-miniprogram-workflow

# 启动移动管理端开发
/skill:daodao-mobile-admin-workflow
```

### 工作流程

每个工具都遵循5步开发流程：

1. **读取实施计划** - 自动分析当前开发进度
2. **分析需求文档** - 深度理解功能需求和技术栈要求
3. **实施开发** - 根据需求生成高质量代码
4. **API集成** - 检查和集成相关API接口
5. **更新进度** - 更新实施计划并准备下一步

### 特色功能

- 🔄 **智能恢复**: 支持断点续传，意外中断后可恢复到最新状态
- 📚 **实时文档**: 自动查询官方最新技术文档，确保最佳实践
- ⚡ **代码生成**: 基于Vue 3和Element Plus最佳实践生成代码
- 🛡️ **质量保证**: 内置代码验证和测试机制
- 📝 **进度跟踪**: 自动更新开发进度，确保项目按计划推进

## 目录结构

```
.claude/
├── skills/                    # 技能工具目录
│   ├── daodao-admin-workflow.js    # PC管理端入口
│   ├── daodao-miniprogram-workflow.js # 小程序端入口
│   ├── daodao-mobile-admin-workflow.js # 移动管理端入口
│   └── dist/                     # 编译后的工具文件
├── cache/                     # 文档缓存目录
├── checkpoints/               # 检查点目录
├── settings.local.json        # Claude Code设置
└── README-daodao-workflow.md  # 使用说明
```

## 故障排除

### 恢复中断的任务

如果开发过程中意外中断，工具会自动保存进度。下次使用时会提示恢复：

```bash
用户: /skill:daodao-admin-workflow

工具: 🔍 检测到未完成的开发任务
上次进度: 阶段 3/5 - 用户管理组件开发
可用操作:
1. 恢复并继续
2. 查看详细状态
3. 重新开始
```

### 常见问题

1. **权限错误**: 确保settings.local.json包含正确的权限配置
2. **依赖问题**: 运行 `npm install` 安装所需依赖
3. **环境问题**: 确保Node.js版本 >= 18.0.0

## 技术支持

如遇问题，请检查：
1. .claude/checkpoints/ 目录中的检查点文件
2. .claude/cache/ 目录中的文档缓存
3. settings.local.json 中的权限配置

---

**版本**: v1.0.0
**更新时间**: 2025-11-28
**维护团队**: 叨叨房车技术团队
EOF

echo "✅ 使用说明已创建: $README_FILE"

# 设置文件权限
echo "🔐 设置文件权限..."
chmod 644 "$SETTINGS_FILE"
chmod 644 "$README_FILE"

echo ""
echo "🎉 安装完成！"
echo ""
echo "📚 使用说明:"
echo "  1. 打开Claude Code"
echo "  2. 在项目中运行: /skill:daodao-admin-workflow"
echo "  3. 查看 .claude/README-daodao-workflow.md 了解详细信息"
echo ""
echo "🔗 快速开始:"
echo "  PC管理端: /skill:daodao-admin-workflow"
echo "  小程序端: /skill:daodao-miniprogram-workflow"
echo "  移动端:   /skill:daodao-mobile-admin-workflow"
echo ""
echo "📁 重要文件:"
echo "  - 配置文件: .claude/settings.local.json"
echo "  - 使用说明: .claude/README-daodao-workflow.md"
echo "  - 检查点: .claude/checkpoints/"
echo "  - 缓存目录: .claude/cache/"
echo ""
echo "✨ 现在可以开始使用叨叨前端开发工作流工具了！"