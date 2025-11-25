@echo off
setlocal enabledelayedexpansion

echo 🚀 启动叨叨房车共享服务...

REM 检查Docker是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未运行，请先启动Docker
    pause
    exit /b 1
)

REM 检查是否在项目根目录
if not exist "package.json" (
    echo ❌ 请在项目根目录执行此脚本
    pause
    exit /b 1
)

REM 进入Docker配置目录
cd shared\tools\docker

REM 复制环境变量文件
if not exist ".env" (
    copy .env.example .env >nul
    echo ✅ 已创建Docker环境配置文件 .env
)

REM 启动数据库服务
echo 📦 启动数据库服务...
docker-compose up -d

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
echo 🔍 检查服务状态...
docker-compose ps

REM 启动Mock服务
echo 🎭 启动Mock服务...
cd ..\mock-data

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)

REM 安装依赖（如果需要）
if not exist "node_modules" (
    echo 📥 安装Mock服务依赖...
    npm install
)

REM 启动Mock服务（后台运行）
echo 🎯 启动Mock服务在端口3001...
start /B npm start > mock.log 2>&1

REM 等待Mock服务启动
timeout /t 3 /nobreak >nul

REM 显示服务信息
echo.
echo ✅ 共享服务启动完成！
echo.
echo 📊 服务信息：
echo   - MySQL:        localhost:3306 ^(数据库: daodao^)
echo   - Redis:        localhost:6379
echo   - Adminer:      http://localhost:8080 ^(数据库管理^)
echo   - Mock API:     http://localhost:3001
echo.
echo 🔑 数据库连接信息：
echo   - 用户名:       daodao_dev
echo   - 密码:         daodao_dev_2024
echo.
echo 📝 Mock服务日志: shared\tools\mock-data\mock.log
echo.
echo 🛑 停止服务命令：
echo   - 数据库:      cd shared\tools\docker ^&^& docker-compose down
echo   - Mock服务:    taskkill /f /im node.exe
echo.

echo ✅ 启动完成！按任意键继续...
pause >nul