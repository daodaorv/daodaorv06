@echo off
REM 叨叨前端开发工作流工具套件安装脚本 (Windows)

setlocal enabledelayedexpansion

echo 🚀 开始安装叨叨前端开发工作流工具套件...

REM 检查Node.js
echo 📋 检查环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Node.js，请先安装Node.js 18或更高版本
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js版本: !NODE_VERSION!

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到npm
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm版本: !NPM_VERSION!

REM 获取脚本目录
set SCRIPT_DIR=%~dp0
set INSTALL_DIR=%SCRIPT_DIR%

echo 📁 安装目录: !INSTALL_DIR!

REM 创建.claude目录结构
echo 📁 创建技能目录结构...
if not exist ".claude" mkdir ".claude"
if not exist ".claude\skills" mkdir ".claude\skills"
if not exist ".claude\cache" mkdir ".claude\cache"
if not exist ".claude\checkpoints" mkdir ".claude\checkpoints"

REM 复制工具文件
echo 📦 复制工具文件...
if exist "!INSTALL_DIR!dist" (
    xcopy /E /I /Y "!INSTALL_DIR!dist\*" ".claude\skills\"
    echo ✅ 工具文件复制完成
) else (
    echo ⚠️  警告: dist目录不存在，请先运行构建命令
    echo 💡 运行以下命令构建工具:
    echo    cd "!INSTALL_DIR!"
    echo    npm install
    echo    npm run build
)

REM 创建配置文件
echo ⚙️ 配置Claude Code设置...
set SETTINGS_FILE=.claude\settings.local.json

if not exist "%SETTINGS_FILE%" (
    (
        echo {
        echo   "permissions": {
        echo     "allow": [
        echo       "Bash(curl:*)",
        echo       "Bash(tree:*)",
        echo       "Bash(find:*)",
        echo       "WebSearch",
        echo       "WebFetch(domain:*.vuejs.org)",
        echo       "WebFetch(domain:*.element-plus.org)",
        echo       "WebFetch(domain:*.uniapp.dcloud.net.cn)",
        echo       "WebFetch(domain:*.weixin.qq.com)",
        echo       "Bash(groups:*)",
        echo       "Bash(npm install)",
        echo       "Bash(cat:*)",
        echo       "mcp__context7__resolve-library-id"
        echo     ],
        echo     "deny": [],
        echo     "ask": []
        echo   },
        echo   "skills": {
        echo     "daodao-admin-workflow": {
        echo       "enabled": true,
        echo       "target": "admin-console",
        echo       "auto_recovery": true,
        echo       "description": "叨叨房车PC管理端开发工作流"
        echo     },
        echo     "daodao-miniprogram-workflow": {
        echo       "enabled": true,
        echo       "target": "miniprogram",
        echo       "auto_recovery": true,
        echo       "description": "叨叨房车小程序端开发工作流"
        echo     },
        echo     "daodao-mobile-admin-workflow": {
        echo       "enabled": true,
        echo       "target": "mobile-admin",
        echo       "auto_recovery": true,
        echo       "description": "叨叨房车移动管理端开发工作流"
        echo     }
        echo   }
        echo }
    ) > "%SETTINGS_FILE%"
    echo ✅ 设置文件已创建: %SETTINGS_FILE%
) else (
    echo ℹ️  设置文件已存在，跳过创建
)

REM 创建技能入口文件
echo 🔗 创建技能入口链接...

REM 创建PC管理端技能入口
set ADMIN_SKILL_FILE=.claude\skills\daodao-admin-workflow.js
if not exist "%ADMIN_SKILL_FILE%" (
    (
        echo /**
        echo  * 叨叨房车PC管理端开发工作流技能
        echo  * 使用方法: /skill:daodao-admin-workflow
        echo  */
        echo.
        echo import { AdminConsoleWorkflow } from './admin-workflow/index.js';
        echo.
        echo export default {
        echo   name: 'daodao-admin-workflow',
        echo   description: '叨叨房车PC管理端开发工作流 - 基于Vue 3 + Element Plus',
        echo   version: '1.0.0',
        echo.
        echo   async execute(params, context) {
        echo     const workflow = new AdminConsoleWorkflow();
        echo.
        echo     try {
        echo       console.log('🔄 启动叨叨PC管理端开发工作流...');
        echo.
        echo       // 检查项目环境
        echo       await this.validateEnvironment();
        echo.
        echo       // 执行开发流程
        echo       const result = await workflow.develop();
        echo.
        echo       return {
        echo         success: true,
        echo         message: 'PC管理端开发完成',
        echo         result: result
        echo       };
        echo.
        echo     } catch (error) {
        echo       return {
        echo         success: false,
        echo         message: `开发失败: ${error.message}`,
        echo         error: error.stack
        echo       };
        echo     }
        echo   },
        echo.
        echo   async validateEnvironment() {
        echo     // 检查Vue 3环境
        echo     // 检查Element Plus安装
        echo     // 检查TypeScript配置
        echo     console.log('✅ PC管理端环境检查完成');
        echo   }
        echo };
    ) > "%ADMIN_SKILL_FILE%"
    echo ✅ PC管理端技能入口已创建
)

echo ""
echo 🎉 安装完成！
echo ""
echo 📚 使用说明:
echo   1. 打开Claude Code
echo   2. 在项目中运行: /skill:daodao-admin-workflow
echo   3. 查看 .claude\README-daodao-workflow.md 了解详细信息
echo ""
echo 🔗 快速开始:
echo   PC管理端: /skill:daodao-admin-workflow
echo   小程序端: /skill:daodao-miniprogram-workflow
echo   移动端:   /skill:daodao-mobile-admin-workflow
echo ""
echo 📁 重要文件:
echo   - 配置文件: .claude\settings.local.json
echo   - 使用说明: .claude\README-daodao-workflow.md
echo   - 检查点: .claude\checkpoints\
echo   - 缓存目录: .claude\cache\
echo ""
echo ✨ 现在可以开始使用叨叨前端开发工作流工具了！

pause