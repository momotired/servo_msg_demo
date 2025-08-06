#!/bin/bash

echo "🚀 开始部署 Servo 留言板项目..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 清理旧镜像（可选）
read -p "是否清理旧的Docker镜像？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理旧镜像..."
    docker system prune -f
fi

# 选择部署模式
echo "请选择部署模式："
echo "1) 生产环境 (nginx + 静态文件)"
echo "2) 开发环境 (Vite开发服务器)"
read -p "请输入选择 (1/2): " -n 1 -r
echo

if [[ $REPLY =~ ^[1]$ ]]; then
    echo "🔨 构建并启动生产环境服务..."
    docker-compose up -d --build
    
    echo "📊 检查服务状态..."
    docker-compose ps
    
    echo "✅ 生产环境部署完成！"
    echo ""
    echo "🌐 访问地址："
    echo "   前端: http://your-server-ip:8000"
    echo "   后端API: http://your-server-ip:8001"
elif [[ $REPLY =~ ^[2]$ ]]; then
    echo "🔨 构建并启动开发环境服务..."
    docker-compose -f docker-compose.dev.yml up -d --build
    
    echo "📊 检查服务状态..."
    docker-compose -f docker-compose.dev.yml ps
    
    echo "✅ 开发环境部署完成！"
    echo ""
    echo "🌐 访问地址："
    echo "   前端: http://your-server-ip:8002 (Vite开发服务器)"
    echo "   后端API: http://your-server-ip:8001"
else
    echo "❌ 无效选择，退出部署"
    exit 1
fi
echo ""
echo "📝 常用命令："
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart" 