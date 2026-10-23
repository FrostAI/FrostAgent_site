# 项目介绍

FrostAgent 是一个用 Go 编写的 AI 角色扮演与智能体后端（AI Harness）。它连接模型和聊天平台，让 Bot 按设定的人格聊天、记住信息，并调用工具完成任务。您可以**在 Web 控制台配置，然后接入聊天平台使用。** 一个服务可以运行多个实例，每个实例就是一个独立配置的 Bot。

## 功能

| 能力 | 用途 | 从哪里开始 |
| --- | --- | --- |
| 多实例 | 在一个服务里运行多个 Bot，分别管理人格、会话和设置 | [控制台与实例](../usage/dashboard) |
| 人格 | 使用系统提示词和示例对话引导角色与表达风格 | [人格设定](../usage/persona) |
| 平台接入 | 通过 OneBot v11 或 AstrBot 收发真实聊天消息 | [快速开始](./quick-start) |
| 群聊 | 配置 @、名称唤醒、主动回复及 Bot 连续对话限制 | [群聊策略](../usage/group-chat) |
| 记忆 | 保存长期信息，维护群档案、称呼和摘要 | [使用与管理记忆](../basic/memory) |
| 模型路由 | 为不同任务和群分配模型，设置继承与覆盖 | [模型路由](../usage/model-router)（进阶） |
| 工具 | 导入 Skills、连接 MCP，通过外部沙箱或 ActionsCat 执行任务 | [工具扩展](../advanced/#工具扩展)（进阶） |
| 安全与维护 | 检查日志和实际 Prompt，配置安全控制，导出与恢复数据 | [部署与运维](../advanced/#部署与运维)（进阶） |

## 使用前准备

一个 OpenAI 兼容模型服务，以及运行 FrostAgent 的电脑或服务器。其他模型接口需要兼容中转；涉及工具调用时，模型也要支持工具能力。

真实聊天需要 OneBot v11 上游或 AstrBot。MCP、沙箱和计费服务都不是开始聊天的前置条件。

接下来按[快速开始](./quick-start)完成安装和第一次对话。

## 多实例要注意什么

人格、会话、记忆和工具配置按实例隔离；**模型供应商和凭据共享**，修改会影响所有使用它们的实例。监听地址、数据库和安全控制属于全局设置，同一用户的安全封禁跨实例生效。详见[控制台与实例](../usage/dashboard)。

## 如何运作

```text
聊天平台 → OneBot / AstrBot → FrostAgent 实例
                              ├─ 人格、会话与记忆
                              ├─ 模型路由 → 模型服务
                              └─ 工具调用 → MCP / 沙箱 / ActionsCat
Web 控制台 → 配置与排障        SQL 数据库 → 持久化数据
```

服务端使用 Go、ConnectRPC 与 Protobuf；控制台使用 Vite、原生 TypeScript 和 Tailwind CSS，构建后嵌入 Go 程序，无需另起前端服务。官网使用 Eleventy，文档站使用 VitePress。

群档案和群记忆按平台与群 ID 隔离。QQ 的 OneBot 与 AstrBot aiocqhttp 接入共享 `qq` 平台，同号的其他平台群不会共用数据。

FrostAgent 在 [MPL-2.0](https://github.com/GuaiZai233/FrostAgent/blob/main/LICENSE) 下开源。

第一次使用从[基础教程](../basic/)开始；需要定制机制或扩展能力时，切换到[进阶指南](../advanced/)。
