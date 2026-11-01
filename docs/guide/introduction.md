# 项目介绍

FrostAgent 是一个用 Golang 编写的 AI 角色扮演与代码协作智能体后端（AI Harness）。它连接模型和聊天平台，让 Bot 按设定的人格聊天、记住信息，并调用工具完成任务。您可以**在 Web 控制台配置，然后接入聊天平台使用。** 一个服务可以运行多个实例，每个实例就是一个独立配置的 Bot。

第一次使用可以从[快速开始](./quick-start)起步，获得直接的体验。

## 功能

| 能力 | 用途 | 索引 |
| --- | --- | --- |
| 多实例 | 在一个服务里运行多个 Bot，分别管理人格、会话和设置 | [控制台与实例](../usage/dashboard) |
| 人格 | 使用系统提示词和示例对话引导角色与表达风格 | [人格设定](../usage/persona) |
| 平台接入 | 通过适配器收发真实聊天消息 | [快速开始](./quick-start) |
| 群聊 | 配置唤醒、主动回复等 | [群聊策略](../usage/group-chat) |
| 记忆 | 保存长期信息，维护群记忆 | [记忆管理与机制](../usage/memory) |
| 模型路由 | 为不同会话/职责分配不同模型 | [模型配置与路由](../usage/model-router) |
| 工具 | 包括导入 Skills、连接 MCP，通过外部沙箱或 ActionsCat 执行任务 | [Skills](../integrations/skills)、[MCP](../integrations/mcp)、[沙箱](../integrations/sandbox)、[ActionsCat](../integrations/actionscat) |
| 安全与维护 | 检查日志和请求体，配置安全控制，导出与恢复数据 | [安全控制](../operations/security)、[数据库与备份](../operations/storage)、[故障排查](../operations/troubleshooting) |

## 使用前准备

一个 OpenAI 兼容模型服务（暂不支持 Anthropic，如有需要套接一层中转），以及运行 FrostAgent 的计算机。涉及工具调用、多模态、Embedding 等能力时，模型也要支持。

真实聊天需要配置消息平台上游。MCP、沙箱和计费服务可选。

## 如何运作

```text
聊天平台 → 适配器 → FrostAgent 实例
                        ├─ 人格、会话与记忆
                        ├─ 模型路由 → 远端端点
                        └─ 工具调用 → MCP / 沙箱 / ActionsCat
Web 控制台 → 配置与排障
SQL 数据库 → 持久化数据
```

技术栈方面，服务端使用 Go、ConnectRPC 与 Protobuf；控制台使用 Vite、原生 TypeScript 和 Tailwind CSS，构建后嵌入 Go 程序，无需另起前端服务。官网使用 Eleventy，文档站使用 VitePress。

## 开源与社区协作

FrostAgent 在 [MPL-2.0](https://github.com/GuaiZai233/FrostAgent/blob/main/LICENSE) 下开源。欢迎各位 Issue/PR！