# Docker 部署

建议公网管理入口由前置 **Cloudflare Access** 保护。默认桥接部署同时要求管理控制令牌。镜像不包含额外的反向代理、管理员账号系统或本地 CA。

以下命令在已克隆的仓库根目录执行，需要可用的 Docker Engine 与 Compose 插件。示例通过仓库 `Dockerfile` 本地构建镜像，应用设置仍由 SQL 管理。

| 场景                                     | 使用文件                                      | 管理入口                                         |
| ---------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| 原生 Linux 本地测试 / 宿主机 cloudflared | 独立 `compose.host.yaml`                      | 宿主机回环 `127.0.0.1:8080`                      |
| 容器内 cloudflared                       | `compose.yaml` 叠加 `compose.cloudflare.yaml` | connector 与应用共享网络命名空间，回源容器内回环 |
| 只运行默认桥接文件                       | `compose.yaml`                                | 宿主机回环 `127.0.0.1:8080`，需管理控制令牌      |

## 本地测试或宿主机 cloudflared（原生 Linux）

单独使用 host 网络文件，不与桥接文件叠加：

```bash
docker compose -f compose.host.yaml up -d --build
```

新数据库默认可在 `http://127.0.0.1:8080` 打开控制台；适配器为 `ws://127.0.0.1:11023/instances/<实例ID>/ws/onebot` 或 `/ws/astrbot`。该镜像将管理与适配器默认地址都设为回环；host 模式没有端口映射，隔离来自应用实际监听的 `127.0.0.1`。本地测试无需配置 Tunnel。

若 cloudflared 已运行在同一 Linux 宿主机，它直接回源到 `http://127.0.0.1:8080`。生产路径为：`浏览器 → Cloudflare Access → Tunnel → 宿主机 cloudflared → 回环管理监听`。先通过本地控制台把完整的公开地址（例如 `https://frostagent.example.com`）加入 `HTTP_ALLOWED_ORIGINS`，再启用公网路由。

此回环隔离方案针对原生 Linux Engine。Docker Desktop 的 host networking 需用户主动启用，且是不同的四层转发实现，不能据此保证 Windows/macOS 外部接口的暴露范围；仓库中的容器验证不覆盖 Desktop 宿主机转发。Windows/macOS 本地控制台可使用默认桥接文件发布的回环端口，并填写管理控制令牌。参见 [Docker host 网络说明](https://docs.docker.com/engine/network/drivers/host/)。

## 容器内 cloudflared（桥接网络）

默认 `compose.yaml` 只启动 FrostAgent。首次部署先复制 `docker.env.example` 为 `.env`，保留已有环境文件内容，将 `FROSTAGENT_BOOTSTRAP_CONTROL_TOKEN` 设置为 32–4096 个无空格的随机可打印 ASCII 字符，可用 `openssl rand -hex 32` 生成，再启动：

```bash
docker compose up -d --build
```

管理默认监听**容器内** `0.0.0.0:8080`，仅映射到宿主机 `127.0.0.1:8080`。打开 `http://127.0.0.1:8080`，在网页设置中填写同一令牌作为「API / 控制平面访问凭据」，保存并刷新后再创建实例。端口映射及普通网桥来源必须携带管理控制令牌，本地 Host、私有 IP 和代理请求头不能代替认证。

初始化变量只在 SQL 中没有令牌时写入一次 `MCP_CONTROL_TOKEN`；已有 `MCP_CONTROL_TOKEN` 或回退的 `ADMIN_TOKEN` 优先，网页应填写实际生效的令牌。没有现有令牌且初始化输入缺失或不合法时，容器在监听端口前退出。首次成功后，从部署环境中移除初始化输入并重建容器；后续在已认证的服务端设置中轮换令牌，并同步网页凭据，修改初始化变量不会覆盖已有令牌。切换到无令牌的数据库前需重新提供初始化输入，否则切换失败并恢复原库；已有目标库使用它自己的令牌。

适配器监听容器内 `0.0.0.0:11023`，仅映射到宿主机 `127.0.0.1:11023`；同一 Docker 网络的适配器可用 `ws://frostagent:11023/instances/<实例ID>/ws/onebot` 或 `/ws/astrbot`。11023 只提供适配器 WebSocket，管理页面、API 和 RPC 均不可通过此端口使用。

OneBot / AstrBot 反向连接可在当前实例设置入站认证令牌（`ONEBOT_WS_INBOUND_TOKEN` / `ASTRBOT_WS_INBOUND_TOKEN`），上游通过 `Authorization: Bearer <令牌>` 发送相同值，不放入 URL。入站令牌与正向连接令牌、管理控制令牌各自独立。专用 11023 端口未配置时保留免令牌兼容；默认桥接管理端口上的真实适配器连接必须配置并提供入站令牌。

cloudflared 必须与 FrostAgent **共享网络命名空间**，而不只是加入同一桥接网络。若希望由此 Compose 运行已有的 Tunnel connector，将 `docker.env.example` 中的 `TUNNEL_TOKEN` 填入 `.env`，并使用可选文件：

```bash
docker compose -f compose.yaml -f compose.cloudflare.yaml up -d --build
```

它只增加用户选择的 cloudflared，没有额外反向代理或认证组件。已在其他部署中运行的 connector 不必重复启动；可为其设置 `network_mode: container:<FrostAgent容器ID>`。FrostAgent 被重新创建后，connector 也须重新创建以加入新的命名空间；同一 Compose 中请始终带上两个文件执行更新，可选文件声明了此重建依赖。

在 Cloudflare 配置回源地址 `http://127.0.0.1:8080`，并在发布路由前为**整个管理域名的全部路径**配置 Access 应用与允许策略，不留管理 API/RPC 的 Bypass 路径。生产路径为：`浏览器 → Cloudflare Access → Tunnel → cloudflared → 同命名空间回环管理监听`。只有实际回环 connector 连接沿用 Access 信任策略；普通网桥来源仍须管理控制令牌，伪造 Host 或 Cloudflare 请求头不能跳过认证。

发布路由前，还需把完整公开地址加入 `HTTP_ALLOWED_ORIGINS`。可通过上述本地控制台设置；没有本地控制台时，展开下面的命令完成首次配置。

::: details 首次配置公开域名（无本地控制台时）

以下是一次性管理请求（Bash 示例；替换域名，现有自定义管理端口需同步修改 `base`）。辅助 Python 容器仅用于本次配置，不是运行组件：

若已启用 `MCP_ENFORCE_LOCAL_TOKEN`，先在当前 Bash 会话输入现有的管理控制令牌（不回显）；回环请求默认可跳过这一步。下面的临时变量 `FROSTAGENT_BOOTSTRAP_TOKEN` 仅向本次请求传递已有令牌，与启动初始化变量不同：

```bash
read -r -s -p 'Existing management control token: ' FROSTAGENT_BOOTSTRAP_TOKEN
printf '\n'
export FROSTAGENT_BOOTSTRAP_TOKEN
```

```bash
docker run --rm -i --env FROSTAGENT_BOOTSTRAP_TOKEN --network container:$(docker compose ps -q frostagent) python:3.13-alpine python - https://frostagent.example.com <<'PY'
import json, os, sys, urllib.request as http
base = "http://127.0.0.1:8080/api/instances/global/"
headers = {"Content-Type": "application/json"}
token = os.environ.get("FROSTAGENT_BOOTSTRAP_TOKEN", "").strip()
if token:
    headers["Authorization"] = "Bearer " + token
request = http.Request(base + "backup/settings", headers=headers)
with http.urlopen(request, timeout=10) as response:
    config = json.load(response)
config.pop("extra_env", None)
origins = set(filter(None, config["settings"].get("HTTP_ALLOWED_ORIGINS", "").split(",")))
config["settings"]["HTTP_ALLOWED_ORIGINS"] = ",".join(sorted(origins | {sys.argv[1]}))
request = http.Request(base + "import/settings", json.dumps(config).encode(), headers)
with http.urlopen(request, timeout=10) as response:
    print(response.read().decode())
PY
```

若设置了临时令牌变量，完成后执行 `unset FROSTAGENT_BOOTSTRAP_TOKEN`。

:::

只设置宿主机 `127.0.0.1` 发布地址不能隔离容器网络，标准桥接镜像通过管理控制令牌限制普通网桥来源。宿主机 cloudflared 可使用 host 方案；容器 cloudflared 使用共享命名空间方案。不要把标准桥接镜像直接用于 host 网络。

## 配置、升级和验证边界

应用配置保存在 SQL 中，`.env` 的 `FROSTAGENT_BOOTSTRAP_CONTROL_TOKEN` 只供首次令牌初始化，`TUNNEL_TOKEN` 只供可选 connector 使用。升级前备份应用卷与外部 PostgreSQL；`docker compose down` 保留卷，**不要加 `-v`，除非明确要删除数据**。

::: details 已有部署：监听地址、认证和旧版迁移

SQL 设置仍优先；启动、热更新和数据库切换必须保持管理与适配器使用不同端口，host 镜像还强制管理地址为数值回环 IP。早期容器部署已保存的 `127.0.0.1:8081` 仍有效，需让 Tunnel 回源到该实际端口；若改用默认桥接端口映射，须先通过原入口将管理监听改为 `0.0.0.0:8080`。旧镜像不接受通配地址时，先升级镜像，再借助原回环入口修改。旧库没有 SQL 管理令牌时，升级到标准桥接镜像也需提供一次初始化输入。host 镜像的回环默认值不会覆盖 SQL 中已保存的 `WS_LISTEN_ADDR=0.0.0.0:11023`；从桥接部署切换到 host 前，须按需要先改为 `127.0.0.1:11023`，避免适配器监听宿主机所有接口。

使用过 `compose.local.yaml` 的旧 socat 入口会将请求转为真实回环连接，不会自动获得网桥令牌保护。迁移成功后须停止并删除两个旧 relay，保留应用数据卷，再省略覆盖文件：

```bash
docker compose -f compose.yaml -f compose.local.yaml stop local-panel local-panel-origin
docker compose -f compose.yaml -f compose.local.yaml rm -f local-panel local-panel-origin
```

容器构建仅对实际来自回环的 connector 连接沿用 Access 信任策略，保留公共 Host/Origin 和转发头；这份信任不适用于普通网桥来源，也不是对 Cloudflare 请求头的认证。通过 Access 的正常请求默认无需另一套本地登录。既有 `MCP_ENFORCE_LOCAL_TOKEN` 仍有效；若用户显式启用了它，前端及一次性管理请求仍需原有 Bearer Token。普通构建的远程控制令牌规则保持不变。

镜像使用 UID/GID `10001:10001`，系统 CA 信任包用于出站 TLS，不生成部署 CA。`frostagent-data` 保留 `/app/data` 中的数据库、引导选择和贴图文件。旧 `frostagent-gateway-data` 证书卷不再使用，不自动删除。从带 gateway 的旧版部署升级时先用旧部署文件执行 `down`（不带 `-v`），停用旧 gateway，再选择新拓扑启动，保留相同 Compose 项目名以复用数据卷。

:::

容器内 `localhost` 指向当前网络命名空间；外部数据库、模型与沙箱使用可达地址。镜像不包含 Node.js/Python 等 stdio MCP 运行时，命令执行仍交给外部沙箱。

::: details 自动测试覆盖了什么

CI 构建桥接及 host 镜像，使用临时数据验证首次令牌初始化、网桥鉴权、回源路径、公共 Host/Origin、管理隔离、端口暴露、OneBot/AstrBot WebSocket、SQL 监听约束、非 root、退出与持久化。测试使用本地合成回源客户端和只运行 `version` 的真实 cloudflared 镜像，不建立公网 Tunnel；Cloudflare Access 云端登录/策略、真实 IM 接入及 Desktop 宿主机转发不属于已验证范围。

:::

打开控制台后，继续[创建并启用 Bot](./quick-start#_2-创建并启用-bot)。连接失败时查看[管理页面和容器排障](../operations/troubleshooting#管理页面和容器)。
