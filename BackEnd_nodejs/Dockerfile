# 使用官方Node.js运行时作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用程序代码
COPY . .

# 暴露端口
EXPOSE 8001

# 启动应用程序
CMD ["node", "server.js"] 