# Docker 部署指南

## 项目概述

这是一个包含Node.js后端和Vue3前端的全栈留言板项目。

## 部署步骤

### 1. 环境要求

- Docker
- Docker Compose
- 确保服务器上已安装Docker和Docker Compose

### 2. 构建和启动

#### 生产环境部署

在项目根目录下运行：

```bash
# 构建并启动所有服务（生产模式）
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 开发环境部署

```bash
# 构建并启动开发环境
docker-compose -f docker-compose.dev.yml up -d --build

# 查看开发环境服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看开发环境日志
docker-compose -f docker-compose.dev.yml logs -f
```

### 3. 访问应用

#### 生产环境
- 前端: http://your-server-ip:8000
- 后端API: http://your-server-ip:8001

#### 开发环境
- 前端: http://your-server-ip:8002 (Vite开发服务器)
- 后端API: http://your-server-ip:8001

### 4. 常用命令

```bash
# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build

# 查看特定服务的日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 进入容器调试
docker-compose exec backend sh
docker-compose exec frontend sh
```

### 5. 生产环境配置

#### 环境变量

如果需要修改数据库连接等配置，可以创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=msg_servo_demo
DB_PORT=3306

# 应用配置
NODE_ENV=production
```

#### 修改后端配置

如果需要修改数据库连接信息，请编辑 `BackEnd_nodejs/server.js` 文件中的数据库配置部分。

### 6. 安全注意事项

1. 修改默认的管理员密码（在 `server.js` 中的 `adminPassword` 变量）
2. 确保数据库连接使用强密码
3. 考虑使用HTTPS（需要配置SSL证书）
4. 定期更新Docker镜像

### 7. 备份和恢复

```bash
# 备份数据库（如果使用外部数据库）
mysqldump -h your-db-host -u your-user -p msg_servo_demo > backup.sql

# 恢复数据库
mysql -h your-db-host -u your-user -p msg_servo_demo < backup.sql
```

### 8. 故障排除

#### 常见问题

1. **端口冲突**: 确保端口80和8001没有被其他服务占用
2. **数据库连接失败**: 检查数据库服务器是否可访问，网络配置是否正确
3. **前端无法访问后端**: 检查nginx配置中的API代理设置

#### 查看详细日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### 9. 更新部署

当代码更新时：

```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker-compose down
docker-compose up -d --build
```

## 架构说明

- **前端**: Vue3 + Vite，使用nginx提供静态文件服务（端口8000）
- **后端**: Node.js + Express，提供RESTful API（端口8001）
- **数据库**: MySQL（外部数据库）
- **网络**: Docker网络实现服务间通信 