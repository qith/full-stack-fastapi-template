# 修复 PUBLIC_HOST 变量警告

## 问题

执行 `docker compose` 命令时出现警告：
```
WARN[0000] The "PUBLIC_HOST" variable is not set. Defaulting to a blank string.
```

## 原因

`docker-compose.ip.yml` 文件中使用了 `${PUBLIC_HOST}` 变量，但 `.env` 文件中没有设置该变量。

## 解决方案

### 方法1: 在 .env 文件中添加 PUBLIC_HOST（推荐）

```bash
# 获取服务器IP
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(ip addr show | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1)
fi

# 检查 .env 文件是否存在
if [ -f ".env" ]; then
    # 如果 PUBLIC_HOST 已存在，更新它
    if grep -q "PUBLIC_HOST=" .env; then
        sed -i "s|PUBLIC_HOST=.*|PUBLIC_HOST=${SERVER_IP}|" .env
    else
        # 如果不存在，添加到文件末尾
        echo "PUBLIC_HOST=${SERVER_IP}" >> .env
    fi
    echo "已更新 .env 文件中的 PUBLIC_HOST=${SERVER_IP}"
else
    echo "错误: .env 文件不存在"
    exit 1
fi
```

### 方法2: 在运行命令时设置环境变量

```bash
# 获取服务器IP
export PUBLIC_HOST=$(hostname -I | awk '{print $1}')

# 运行 docker compose 命令
docker compose -f docker-compose.yml -f docker-compose.ip.yml build
docker compose -f docker-compose.yml -f docker-compose.ip.yml up -d
```

### 方法3: 一行命令快速修复

```bash
# 自动检测IP并添加到 .env 文件
SERVER_IP=$(hostname -I | awk '{print $1}') && [ -z "$SERVER_IP" ] && SERVER_IP=$(ip addr show | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1) && if grep -q "PUBLIC_HOST=" .env 2>/dev/null; then sed -i "s|PUBLIC_HOST=.*|PUBLIC_HOST=${SERVER_IP}|" .env; else echo "PUBLIC_HOST=${SERVER_IP}" >> .env; fi && echo "PUBLIC_HOST 已设置为: ${SERVER_IP}"
```

## 验证

修复后，检查 `.env` 文件：

```bash
grep PUBLIC_HOST .env
```

应该看到类似：
```
PUBLIC_HOST=192.168.1.100
```

## 重新运行

修复后，重新运行 docker compose 命令：

```bash
docker compose -f docker-compose.yml -f docker-compose.ip.yml build
docker compose -f docker-compose.yml -f docker-compose.ip.yml up -d
```

警告应该消失了。

