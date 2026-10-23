---
prev:
  text: 基础教程
  link: /basic/
next:
  text: 模型路由与群级覆盖
  link: /usage/model-router
---

# 进阶指南

这部分保留完整的配置规则、工作机制和运维说明，适合已经完成基础对话、需要进一步定制 FrostAgent 的用户。第一次安装请先看[基础教程](../basic/)。

不必依次开启所有功能。按下面的需求选择章节，先确认模型能力、外部依赖和费用，再修改正在使用的实例。

## 模型与记忆

| 需求 | 阅读章节 |
| --- | --- |
| 为主对话、图片理解、反思等任务分配模型，或按群覆盖 | [模型路由与群级覆盖](../usage/model-router) |
| 了解记忆提取、归属、来源与反思规则 | [记忆机制与作用域](../usage/memory) |
| 启用向量检索，维护和重建索引 | [Embedding 语义检索](../usage/embedding) |
| 查看会话、群摘要与实际请求上下文 | [会话与 Prompt](../usage/sessions) |

仅需填写 API 地址和模型名时，使用基础篇的[配置第一个模型](../basic/models)；仅需查看和修改条目时，看[使用与管理记忆](../basic/memory)。

## 工具扩展

- [Skills 技能包](../integrations/skills)：导入和管理技能，了解激活与脚本依赖。
- [MCP 服务器](../integrations/mcp)：连接工具服务，管理连接和工具开关。
- [隔离沙箱](../integrations/sandbox)：配置命令执行环境与权限边界。
- [ActionsCat](../integrations/actionscat)：接入动作、构建和自动化执行。
- [Alcyone 计费](../integrations/billing)：连接外部计费服务，核对失败处理与模拟模式行为。

外部工具可能产生真实请求或修改，即使在模拟对话中也不能忽略权限和副作用。模型 API 与外部服务的收费独立于本地功能开关。

## 部署与运维

- **远程运行**：[部署与网络](../guide/deployment)、[安全控制](../operations/security)。涉及监听地址、管理认证、反向代理和 Origin；容器方案另见 [Docker 部署](../guide/docker)。
- **保护数据**：[数据库与备份](../operations/storage)、[升级说明](../operations/upgrading)。升级、还原和数据库切换前先备份；切换数据库不会自动迁移数据。
- **定位故障**：[日志与故障排查](../operations/troubleshooting)。按启动、模型、工具、平台投递等环节排查。

## 参数参考与开发

需要逐项核对键名和范围时，使用[配置参考](../reference/configuration)；接入管理接口时，查看 [API 入口](../reference/api)。

修改 FrostAgent 源码请看[开发指南](../development/)；维护本网站请看[文档站维护](../development/docs)。
