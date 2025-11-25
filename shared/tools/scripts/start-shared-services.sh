#!/bin/bash

# 叨叨房车项目 - 启动共享服务脚本
# 用于快速启动数据库和Mock服务

set -e

echo "🚀 启动叨叨房车共享服务..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录执行此脚本"
    exit 1
fi

# 进入Docker配置目录
cd shared/tools/docker

# 复制环境变量文件
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ 已创建Docker环境配置文件 .env"
fi

# 启动数据库服务
echo "📦 启动数据库服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 启动Mock服务
echo "🎭 启动Mock服务..."
cd ../mock-data

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📥 安装Mock服务依赖..."
    npm install
fi

# 启动Mock服务（后台运行）
echo "🎯 启动Mock服务在端口3001..."
npm start > mock.log 2>&1 &
MOCK_PID=$!

# 等待Mock服务启动
sleep 3

# 显示服务信息
echo ""
echo "✅ 共享服务启动完成！"
echo ""
echo "📊 服务信息："
echo "  - MySQL:        localhost:3306 (数据库: daodao)"
echo "  - Redis:        localhost:6379"
echo "  - Adminer:      http://localhost:8080 (数据库管理)"
echo "  - Mock API:     http://localhost:3001"
echo ""
echo "🔑 数据库连接信息："
echo "  - 用户名:       daodao_dev"
echo "  - 密码:         daodao_dev_2024"
echo ""
echo "📝 Mock服务日志: shared/tools/mock-data/mock.log"
echo ""
echo "🛑 停止服务命令:"
echo "  - 数据库:      cd shared/tools/docker && docker-compose down"
echo "  - Mock服务:    kill $MOCK_PID"
echo ""

# 保存PID到文件
echo $MOCK_PID > mock.pid
echo "Mock服务PID: $MOCK_PID"