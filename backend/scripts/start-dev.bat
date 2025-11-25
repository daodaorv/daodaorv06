@echo off
setlocal enabledelayedexpansion

echo 🚀 启动叨叨房车后端服务...

REM 检查Docker是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未运行，请先启动Docker
    pause
    exit /b 1
)

REM 检查是否在后端目录
if not exist "package.json" (
    echo ❌ 请在后端目录执行此脚本
    pause
    exit /b 1
)

REM 复制环境变量文件
if not exist ".env" (
    copy .env.example .env >nul
    echo ✅ 已创建环境配置文件 .env
    echo 💡 请根据需要修改 .env 文件中的配置
)

REM 清理旧容器
echo 🧹 清理旧容器...
docker-compose down --remove-orphans

REM 构建并启动服务
echo 🔨 构建Docker镜像...
docker-compose build

echo 📦 启动数据库服务...
docker-compose up -d mysql redis

echo ⏳ 等待数据库服务启动...
timeout /t 15 /nobreak >nul

REM 检查数据库连接
echo 🔍 检查数据库连接...
:check_mysql
docker-compose exec mysql mysqladmin ping -h"localhost" --silent >nul 2>&1
if errorlevel 1 (
    echo 等待MySQL启动...
    timeout /t 2 /nobreak >nul
    goto check_mysql
)
echo ✅ MySQL已启动

:check_redis
docker-compose exec redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo 等待Redis启动...
    timeout /t 2 /nobreak >nul
    goto check_redis
)
echo ✅ Redis已启动

REM 初始化数据库
echo 🗄️ 初始化数据库...
docker-compose exec mysql mysql -udaodao_dev -pdaodao_dev_2024 -e "USE daodao; SHOW TABLES;" >nul 2>&1 || echo 数据库将自动初始化

REM 启动应用服务
echo 🌐 启动后端应用服务...
docker-compose up -d backend

REM 等待应用启动
echo ⏳ 等待应用服务启动...
timeout /t 10 /nobreak >nul

REM 检查应用健康状态
echo 🔍 检查应用健康状态...
set /a count=0
:check_app
set /a count+=1
curl -f http://localhost:3000/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ 后端应用启动成功
    goto app_ready
)
if %count% geq 30 (
    echo ❌ 后端应用启动失败，请查看日志
    docker-compose logs backend
    pause
    exit /b 1
)
echo 等待应用启动... ^(%count%/30^)
timeout /t 2 /nobreak >nul
goto check_app

:app_ready
REM 启动管理工具
echo 🛠️ 启动开发工具...
docker-compose up -d adminer mailhog

REM 显示服务信息
echo.
echo ✅ 后端服务启动完成！
echo.
echo 📊 服务信息：
echo   - 后端API:      http://localhost:3000
echo   - API文档:      http://localhost:3000/api-docs
echo   - 数据库管理:   http://localhost:8080 ^(Adminer^)
echo   - 邮件管理:     http://localhost:8025 ^(MailHog^)
echo.
echo 🔑 数据库连接信息：
echo   - 主机:         localhost
echo   - 端口:         3306
echo   - 数据库:       daodao
echo   - 用户名:       daodao_dev
echo   - 密码:         daodao_dev_2024
echo.
echo 📝 查看日志：
echo   - 应用日志:     docker-compose logs -f backend
echo   - 数据库日志:   docker-compose logs -f mysql
echo   - Redis日志:    docker-compose logs -f redis
echo.
echo 🛑 停止服务：
echo   - 全部停止:     docker-compose down
echo   - 重启应用:     docker-compose restart backend
echo.

REM 检查API接口
echo 🔎 测试API接口...
curl -f http://localhost:3000/api/v1/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ API接口正常工作
) else (
    echo ⚠️  API接口可能需要更多时间启动
)

echo.
echo 🎉 开发环境已准备就绪，开始愉快的编码吧！
echo.
pause