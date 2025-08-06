# Docker 部署说明

## 快速开始

### 1. 生产环境部署（推荐）

```bash
# 使用部署脚本（Linux/Mac）
./deploy.sh

# 或使用批处理文件（Windows）
deploy.bat

# 或手动执行
docker-compose up -d --build
```

**访问地址：**
- 前端: http://your-server-ip:8000
- 后端API: http://your-server-ip:8001

### 2. 开发环境部署

```bash
# 使用部署脚本选择开发模式
./deploy.sh

# 或手动执行
docker-compose -f docker-compose.dev.yml up -d --build
```

**访问地址：**
- 前端: http://your-server-ip:8002 (Vite开发服务器)
- 后端API: http://your-server-ip:8001

## 文件说明

- `docker-compose.yml` - 生产环境配置
- `docker-compose.dev.yml` - 开发环境配置
- `BackEnd_nodejs/Dockerfile` - 后端Docker配置
- `FrontEnd_Vue3/Dockerfile` - 前端生产环境Docker配置
- `FrontEnd_Vue3/Dockerfile.dev` - 前端开发环境Docker配置
- `FrontEnd_Vue3/nginx.conf` - nginx配置文件
- `deploy.sh` - Linux/Mac部署脚本
- `deploy.bat` - Windows部署脚本

## 架构说明

### 生产环境
- **前端**: Vue3构建为静态文件 + nginx服务 (端口8000)
- **后端**: Node.js + Express (端口8001)
- **网络**: Docker网络实现服务间通信

### 开发环境
- **前端**: Vue3 + Vite开发服务器 (端口8002)
- **后端**: Node.js + Express (端口8001)
- **热重载**: 支持代码修改自动刷新

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

详细说明请参考 `DOCKER_DEPLOYMENT.md` 