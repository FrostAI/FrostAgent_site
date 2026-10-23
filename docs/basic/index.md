---
prev: false
next:
  text: 项目介绍
  link: /guide/introduction
---

# 基础教程

这部分带你完成一个 Bot 从安装到日常使用的完整流程。先准备一个可用的 OpenAI 兼容模型服务；没有聊天平台时，也可以先用控制台的「直接对话」验证模型和人格。

基础教程讲操作步骤与使用注意事项。多模型分工、记忆机制、工具集成和服务器维护放在[进阶指南](../advanced/)，可以在基础配置完成后按需阅读。

## 第一次使用

1. **了解项目**：阅读[项目介绍](../guide/introduction)，认识实例、控制台和聊天平台之间的关系。
2. **安装并运行**：跟随[快速开始](../guide/quick-start)，选择[源码安装](../guide/installation)或 [Docker 部署](../guide/docker)。
3. **配置 Bot**：创建实例，按[配置第一个模型](./models)填写供应商和模型，再设置[人格与示例对话](../usage/persona)。
4. **确认能回复**：先用[直接对话](../usage/direct-chat)试聊，再选择 [OneBot v11](../adapters/onebot) 或 [AstrBot](../adapters/astrbot) 接入真实平台。

Docker 的默认桥接方案不开放管理端口；公网管理必须先配置认证。安装页会说明对应的访问方式，不要直接把管理端口暴露到公网。

## 开始日常使用

| 你想做什么 | 对应教程 |
| --- | --- |
| 创建、切换或管理多个 Bot | [控制台与实例](../usage/dashboard) |
| 更换模型、修改 API 地址或密钥 | [配置第一个模型](./models) |
| 调整角色和说话风格 | [人格与示例对话](../usage/persona) |
| 设置唤醒、主动回复和群聊限制 | [群聊与回复策略](../usage/group-chat) |
| 查看、修正记忆和群成员称呼 | [使用与管理记忆](./memory) |
| 理解默认值、保存与生效方式 | [设置与生效方式](../usage/settings) |
| 使用表情包或管理员指令 | [表情包](../usage/stickers)、[管理员指令](../usage/commands) |

## 什么时候看进阶

当你需要为不同任务或群配置不同模型、开启 Embedding、接入 MCP / Skills / 沙箱，或维护长期运行的服务时，进入[进阶指南](../advanced/)。基础功能不要求先配置所有扩展。

遇到问题可以直接查看[故障排查](../operations/troubleshooting)，不用按顺序读完整套文档。准备升级或迁移前，先阅读[数据库与备份](../operations/storage)。
