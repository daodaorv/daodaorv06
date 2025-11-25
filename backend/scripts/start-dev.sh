#!/bin/bash

# 叨叨房车后端服务启动脚本
# 用于快速启动后端开发环境

set -e

echo "🚀 启动叨叨房车后端服务..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查是否在后端目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在后端目录执行此脚本"
    exit 1
fi

# 复制环境变量文件
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ 已创建环境配置文件 .env"
    echo "💡 请根据需要修改 .env 文件中的配置"
fi

# 清理旧容器
echo "🧹 清理旧容器..."
docker-compose down --remove-orphans

# 构建并启动服务
echo "🔨 构建Docker镜像..."
docker-compose build

echo "📦 启动数据库服务..."
docker-compose up -d mysql redis

echo "⏳ 等待数据库服务启动..."
sleep 15

# 检查数据库连接
echo "🔍 检查数据库连接..."
until docker-compose exec mysql mysqladmin ping -h"localhost" --silent; do
    echo '等待MySQL启动...'
    sleep 2
done

echo "✅ MySQL已启动"

until docker-compose exec redis redis-cli ping; do
    echo '等待Redis启动...'
    sleep 2
done

echo "✅ Redis已启动"

# 初始化数据库
echo "🗄️ 初始化数据库..."
docker-compose exec mysql mysql -udaodao_dev -pdaodao_dev_2024 -e "USE daodao; SHOW TABLES;" || echo "数据库将自动初始化"

# 启动应用服务
echo "🌐 启动后端应用服务..."
docker-compose up -d backend

# 等待应用启动
echo "⏳ 等待应用服务启动..."
sleep 10

# 检查应用健康状态
echo "🔍 检查应用健��状态..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ 后端应用启动成功"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 后端应用启动失败，请查看日志"
        docker-compose logs backend
        exit 1
    fi
    echo "等待应用启动... ($i/30)"
    sleep 2
done

# 启动管理工具
echo "🛠️ 启动开发工具..."
docker-compose up -d adminer mailhog

# 显示服务信息
echo ""
echo "✅ 后端服务启动完成！"
echo ""
echo "📊 服务信息："
echo "  - 后端API:      http://localhost:3000"
echo "  - API文档:      http://localhost:3000/api-docs"
echo "  - 数据库管理:   http://localhost:8080 (Adminer)"
echo "  - 邮件管理:     http://localhost:8025 (MailHog)"
echo ""
echo "🔑 数据库连接信息："
echo "  - 主机:         localhost"
echo "  - 端口:         3306"
echo "  - 数据库:       daodao"
echo "  - 用户名:       daodao_dev"
echo "  - 密码:         daodao_dev_2024"
echo ""
echo "📝 查看日志："
echo "  - 应用日志:     docker-compose logs -f backend"
echo "  - 数据库日志:   docker-compose logs -f mysql"
echo "  - Redis日志:    docker-compose logs -f redis"
echo ""
echo "🛑 停止服务："
echo "  - 全部停止:     docker-compose down"
echo "  - 重启应用:     docker-compose restart backend"
echo ""

# 检查API接口
echo "🔎 测试API接口..."
if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo "✅ API接口正常工作"
else
    echo "⚠️  API接口可能需要更多时间启动"
fi

echo ""
echo "🎉 开发环境已准备就绪，开始愉快的编码吧！"