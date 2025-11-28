@echo off
echo ========================================
echo   启动叨叨房车后端自动巡检工作流
echo ========================================
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Node.js，请先安装Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js版本:
node --version
echo.

REM 检查项目目录
if not exist "backend" (
    echo ❌ 错误: 未找到backend目录，请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "backend\package.json" (
    echo ❌ 错误: 未找到backend\package.json，请检查项目结构
    pause
    exit /b 1
)

echo ✅ 项目检查通过
echo.

REM 创建日志目录
if not exist ".claude\logs" (
    echo 📁 创建日志目录...
    mkdir ".claude\logs"
)

echo 🚀 启动自动监控工具...
echo    - 工具将持续监控前端API文档变化
echo    - 自动生成后端代码和测试
echo    - 按 Ctrl+C 可安全停止监控
echo.
echo ========================================
echo.

REM 启动监控工具
node .claude\skills\backend-auto-monitor.js

echo.
echo 监控工具已停止
pause