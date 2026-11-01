# 安装与构建

本页用于本机源码运行。使用容器请直接看 [Docker 部署](./docker)。

## 工具要求

| 工具        | 要求与用途                                                         |
| ----------- | ------------------------------------------------------------------ |
| Go          | 1.27.3 或更高版本，以编译服务端与协议工具                       |
| Node.js     | 使用 22 或更高版本，以构建控制台                             |
| pnpm        | 根 `package.json` 固定为 10.33.0；使用仓库的 `pnpm-lock.yaml`      |
| Buf         | 编译 Protobuf |
| Make + Bash | 使用根 `Makefile` 时需要；其中指定 `SHELL := /bin/bash`，需确保 Make 能找到 Bash |

检查 PATH 以确认 `go version`、`node --version`、`pnpm --version` 与 `buf --version` 可用。

## 获取源码

```bash
git clone https://github.com/GuaiZai233/FrostAgent.git
cd FrostAgent
```

然后选择下面一种构建方式。Windows 没有 Bash 时，使用 PowerShell 步骤即可。

## 1° Make 构建

```bash
pnpm install --frozen-lockfile
go install github.com/bufbuild/buf/cmd/buf@latest
make build
./bin/app
```

`make build` 会生成协议代码、构建控制台和服务端。启动后打开 `http://127.0.0.1:8080`，继续[创建并启用 Bot](./quick-start#_2-创建并启用-bot)。

::: details 其他构建命令

| 命令                            | 作用                              |
| ------------------------------- | --------------------------------- |
| `make build` / `make build-api` | 构建控制台、Go 协议和两个 Go 程序 |
| `make build-web`                | 生成 TypeScript 协议并构建控制台  |
| `make proto-generate`           | 生成 Go 和 TypeScript 协议代码    |
| `make serve-api`                | 构建依赖产物后通过 Go 启动服务    |

:::

## 2° Windows PowerShell 构建

也可以在 PowerShell 中直接运行各项工具，无需 Make 或 Bash。以下流程与现有 Windows CI 的构建方式一致，并额外显式生成 TypeScript 协议：

```powershell
pnpm install --frozen-lockfile
go install github.com/bufbuild/buf/cmd/buf@latest
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.11
go install connectrpc.com/connect/cmd/protoc-gen-connect-go@v1.20.0
pnpm exec buf generate --template buf.gen.web.yaml
pnpm --filter @frostagent/web build
buf generate --template buf.gen.yaml
New-Item -ItemType Directory -Force bin
go build -o bin/app.exe ./cmd/app
go build -o bin/agent.exe ./cmd/agent
.\bin\app.exe
```

Buf 的本地插件通过 `PATH` 查找；Go 安装工具后要确保终端能够找到它们。

## 构建输出

日常运行只需启动 `bin/app`（Windows 为 `bin/app.exe`）。从仓库根目录启动，保持 `data/` 和默认示例对话模板路径一致；首次运行默认使用 `data/frostagent.db`。

::: details 产物与部署文件

| 路径                           | 内容                                      |
| ------------------------------ | ----------------------------------------- |
| `bin/app` 或 `bin/app.exe`     | 主服务，包含嵌入的控制台静态资源          |
| `bin/agent` 或 `bin/agent.exe` | 旧版 JSON 记忆文件管理工具                |
| `internal/frontend/dist/`      | 控制台静态资源，Go 编译时嵌入             |
| `gen/`                         | 生成的 Go 协议代码                        |

服务部署至少需要主程序、稳定的工作目录和数据存储。保留 `eval/dialogue/dialogue.yml` 可让新实例按默认模板初始化示例对话。

:::

## 安装后检查

启动主程序，打开控制台，创建实例并完成[快速开始](./quick-start)。如果 Go 编译报缺少前端资源或 `gen/proto` 包，先构建控制台和生成 Go 协议；不要用空目录代替实际前端构建。
