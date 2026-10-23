---
prev:
  text: 基础教程
  link: /basic/
next:
  text: 控制台与实例
  link: /usage/dashboard
---

# 快速开始

这篇教程带你完成安装、创建实例、配置模型、验证对话和接入平台。先准备一个 OpenAI 兼容模型服务的 API 地址、密钥与模型名；不需要同时配置所有工具和进阶功能。

## 1. 安装并打开控制台

下面使用本机源码构建。准备 Go 1.27.3 或更高版本、Node.js 22 或更高版本、pnpm 10.33.0，以及 Make 和 Bash；Buf 在下面的命令中安装，Go 工具目录需加入 `PATH`。

```bash
git clone https://github.com/GuaiZai233/FrostAgent.git
cd FrostAgent
pnpm install --frozen-lockfile
go install github.com/bufbuild/buf/cmd/buf@latest
make build
./bin/app
```

命令在应用仓库根目录执行。Windows 没有 Make / Bash 时，使用[PowerShell 构建步骤](./installation#windows-powershell-构建)，生成后启动 `.\bin\app.exe`。构建产物和工具说明见[安装与构建](./installation)。

如果使用 Docker，改按 [Docker 部署](./docker)选择网络方案。**默认 Compose 不开放管理端口**，不能直接从宿主机浏览器打开；原生 Linux 本地测试可使用独立的 host 方案。

原生程序首次运行后，打开 `http://127.0.0.1:8080`。默认数据库为 `data/frostagent.db`，外部适配器监听 `127.0.0.1:1234`。以后也从仓库根目录启动，保持数据与示例对话模板路径一致。

::: warning 访问范围
本地运行应使用受信任的环境。公网管理先完成[管理面认证](../operations/security#管理面认证)；容器部署按 Docker 指南配置 Cloudflare Access。不要为方便连接而直接暴露管理端口。
:::

## 2. 创建并启用 Bot

一个实例就是一个独立配置的 Bot。首次启动不会自动创建实例，新建实例默认停用。

1. 在侧边栏底部打开「实例管理」，创建并选择实例。已有全量 ZIP 备份时可直接上传恢复，无需先建空实例；恢复后需重新检查模型凭据。
2. 打开「模型路由器」，添加供应商（Endpoint），填写 API 基地址与密钥。
3. 添加模型（Model），选择供应商并填写上游实际模型名。
4. 在「实例默认路由」为「主对话」选择模型，点击「发布」。未发布的草稿不会生效。
5. 打开「人格设定」，填写系统提示词，例如 Bot 的角色、语气和回复边界；可以同时添加示例对话。
6. 回到「概览」，打开「是否启用」。

API 基地址通常类似 `https://api.example.com/v1`，不要填写完整的 `chat/completions` 地址。模型名填写供应商实际接受的名称，不是自己设置的显示名。逐项填写说明见[配置第一个模型](../basic/models)。

设置通过控制台保存到 SQL 数据库，无需修改根目录 `.env`。刷新页面后需要重新选择实例。供应商和凭据由多个实例共享，修改已有供应商时先确认影响范围。

## 3. 验证一次对话

1. 打开「直接对话」，选择 OneBot 或 AstrBot 协议与私聊场景。
2. 连接后发送一条问候，确认能收到符合人格设定的回复。
3. 没有回复时，打开「日志查询」检查请求与响应；先核对实例已启用、模型路由已发布、凭据有效。

「直接对话」使用临时模拟会话，断开后会清理。它可以验证模型和人格，但不能证明真实平台投递或持久化记忆已经正常工作，详见[直接对话](../usage/direct-chat)。

模拟模式不参与 Alcyone 计费，**模型 API 仍可能收费**。已启用的 MCP 工具和沙箱也可能发出真实外部请求；首次验证只需简单试聊。

## 4. 接入聊天平台 {#_3-接入聊天平台}

在「概览」复制对应实例的适配器地址。默认本机地址形如：

```text
ws://127.0.0.1:1234/instances/<实例ID>/ws/onebot
ws://127.0.0.1:1234/instances/<实例ID>/ws/astrbot
```

- **OneBot v11**：在上游配置反向 WebSocket，填写该实例的地址，按 [OneBot 接入](../adapters/onebot)检查事件转发和连接状态。
- **AstrBot**：安装专用适配器插件，填写连接地址并关闭 AstrBot 自带的 LLM 回复，按 [AstrBot 接入](../adapters/astrbot)完成设置。

上游与 FrostAgent 不在同一主机或网络命名空间时，`127.0.0.1` 不能直接照抄。替换为上游可达的主机，保留实例 ID 和路径；容器、代理与 WSS 要求见[部署与网络](./deployment)。

接入后先发一条真实私聊，再在群里 **@机器人** 测试。收到回复后检查投递日志；不要把模拟试聊成功等同于真实平台已经接通。无回复时按[故障排查](../operations/troubleshooting#已连接但-bot-不回复)逐项核对。

## 5. 接下来做什么

基础使用继续阅读[人格与示例对话](../usage/persona)、[群聊与回复策略](../usage/group-chat)、[使用与管理记忆](../basic/memory)和[设置与生效方式](../usage/settings)。完整阅读顺序见[基础教程总览](../basic/)。

需要多模型路由、Embedding、工具扩展或长期部署时，再进入[进阶指南](../advanced/)。
