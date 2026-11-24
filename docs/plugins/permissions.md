# 插件权限模型

::: warning 设计草案
本页描述插件系统的权限端点设计，尚未实现。权限名称、字段和执行规则可能在实现前调整。标注为「待决」的条目尚未定案，不能按草案行为依赖。
:::

## 目标与原则

插件权限遵循以下原则：

- **默认拒绝**：未在清单中声明、且未被管理员授予的权限，运行时一律拒绝。
- **清单是上限**：插件清单声明它最多需要的权限和范围；管理员在清单上限之内配置实际授予的范围。插件不能自行扩大范围。
- **按资源域划分**：权限按事件、消息、群组、存储、任务、网络、模型、Agent、文件、进程、插件互联和界面划分，每项只授予对应能力。
- **高权限单独标注**：能够绕过文件、网络或宿主隔离的能力，即使在清单中声明，也必须在安装和授权时明确展示。

本草案不设普通、敏感、高危三档分级。权限统一由清单声明，授权方式由管理员配置决定。

## 授权模型

### 来源与生效顺序

一项权限要生效，需同时满足：

1. 插件清单声明了该权限，并给出 scope 上限；
2. 管理员在上限之内授予该权限，并确定实际 scope；
3. 运行时调用满足授予的 scope。

任一条件不满足，调用失败，并返回明确的权限错误。

### 清单声明

清单为插件的权限声明，安装时由管理员审阅。声明的 scope 视为上限，授予的 scope 只能等于或收窄于上限。

清单中的权限字段格式（草案）：

```json
{
  "permissions": [
    { "name": "messages.send" },
    {
      "name": "messages.extend",
      "scope": {
        "operations": ["react", "poke"],
        "conversations": "current"
      }
    }
  ]
}
```

## scope 结构

所有带范围的权限使用统一结构。字段不适用于某项权限时省略，省略的字段表示该维度不受额外限制，但仍受权限本身约束。

| 字段 | 取值 | 说明 |
| --- | --- | --- |
| `conversations` | `current` / 显式白名单 / `all` | 作用的会话范围。`all` 需要管理员单独确认。 |
| `operations` | 枚举数组 | 允许的操作，取值由具体权限定义。 |
| `targets` | 数组 | 允许的事件类型、群号、用户、模型配置等，由具体权限定义。 |
| `quota` | 对象 | 速率与用量上限，例如每分钟调用数、每日 token 数。具体字段待决。 |

`all` 和未声明 `conversations` 的情况，实现时均应视为需要管理员单独确认的宽范围。

## 权限清单

以下权限名称沿用草案原文，按资源域列出。带 ⚠️ 的为高权限，需在授权时单独展示，但不构成分级体系。

### events

| 权限 | 说明 |
| --- | --- |
| `events.subscribe` | 订阅事件，读取获准事件的规范化内容。 |
| `events.raw.read` | 读取平台原始业务事件 JSON。传输鉴权信息和宿主内部运行状态不属于该接口。 |
| `events.consume` | 接管事件，停止后续业务处理或 LLM 对话。待决：见下文「拦截类权限」。 |
| `events.publish` | 发布插件自定义事件，只能使用本插件的事件命名空间。 |

`events` 明确不跨插件。跨插件事件见 `interop`。

### messages

| 权限 | 说明 |
| --- | --- |
| `messages.send` | 发送消息，包括文字、消息链、图片、文件等。 |
| `messages.withdraw` | 撤回消息。范围区分 Bot 自己的消息和群成员消息。 |
| `messages.extend` | 启用扩展消息能力，仅包含下列操作。 |
| `messages.history.read` | 阅读消息历史记录，包括附件、特殊消息等。 |
| `messages.intercept` | 在发送前检查、修改或阻止出站消息。待决：见下文。 |

`messages.extend` 的 `operations` 枚举：

| 值 | 说明 |
| --- | --- |
| `forward` | 逐条或合并转发。 |
| `react` | 添加或移除消息表情回应。 |
| `poke` | 向获准目标发送戳一戳等交互。 |

`messages.extend` 示例：

```json
{
  "name": "messages.extend",
  "scope": {
    "operations": ["react", "poke"],
    "conversations": "current"
  }
}
```

::: info 拆分说明
历史消息与附件读取原属 `messages.extend`，现拆分为 `messages.history.read`，其隐私敏感度与 `events.raw.read` 对齐，不再作为扩展操作授予。附件是否保留独立权限见「待决」。
:::

### groups

| 权限 | 说明 |
| --- | --- |
| `groups.info.read` | 读取群名称、简介及其他群信息。 |
| `groups.members.read` | 读取成员列表、成员资料和群内角色。涉及个人信息，见「待决」。 |
| `groups.settings.modify` | 修改群名称、公告等平台支持的群设置。 |
| `groups.members.modify` | 修改成员群名片等平台支持的成员资料。 |
| `groups.kick` | 将成员移出群聊。 |
| `groups.mute` | 禁言或解除禁言指定成员。 |
| `groups.muteAll` | 开启或关闭全员禁言。 |
| `groups.admin.manage` | 设置或取消管理员，仍需满足平台权限。 |
| `groups.requests.handle` | 同意或拒绝入群申请、群邀请。 |
| `groups.leave` | 让 Bot 退出指定群聊。 |

命名风格待统一，见「待决」。

### storage

| 权限 | 说明 |
| --- | --- |
| `storage.read` | 读取插件持久化数据。 |
| `storage.write` | 创建、更新、删除插件持久化数据，执行事务和原子更新。 |

### jobs

| 权限 | 说明 |
| --- | --- |
| `jobs.schedule` | 创建或修改后台任务、延迟任务、周期任务。 |
| `jobs.read` | 查询任务状态、执行记录和结果。 |
| `jobs.cancel` | 取消待执行任务，或请求终止正在执行的任务。 |

### network

| 权限 | 说明 |
| --- | --- |
| `network.request` | 发起 HTTP / HTTPS 请求。 |
| `network.connect` | 建立获准协议的持续连接，例如 WebSocket、TCP、UDP。 |
| `network.listen` | ⚠️ 在获准地址和端口监听连接，或接收外部请求。 |

### llm

| 权限 | 说明 |
| --- | --- |
| `llm.models.read` | 查看管理员允许插件使用的模型配置及能力，不包含密钥。 |
| `llm.call` | 发起模型生成请求，支持获准的输入输出模态和流式响应。 |
| `llm.embeddings.call` | 调用嵌入模型生成向量。 |

### agent

| 权限 | 说明 |
| --- | --- |
| `agent.context.read` | 读取当前 Agent 执行上下文中获准的内容。 |
| `agent.plugin_context.modify` | 添加、替换或移除插件自己贡献给当前模型请求的上下文块，例如插件提供的实时业务状态、检索资料、记忆片段、本轮临时提示。不授予读取或修改其他上下文块的权限。 |
| `agent.tools.register` | 注册可供 Agent 使用的插件工具。 |
| `agent.tools.intercept` | 在工具执行前后检查、修改或阻止调用及其结果。待决：见下文。 |
| `agent.tools.call` | 主动调用宿主开放的工具，仍需通过该工具的权限检查。 |
| `agent.model.intercept` | ⚠️ 读取并修改当前模型请求的完整上下文、普通生成参数和模型返回正文，包括本轮系统提示词等一切发送给远端端点的内容。待决：见下文。 |
| `agent.model.select` | 为当前执行选择获准模型配置。 |
| `agent.turns.operate` | 主动发起或取消 Agent 执行，即使当时没有任何用户发消息。 |
| `agent.memory.read` | 查询获准用户、群聊或会话的 Agent 记忆。 |
| `agent.memory.write` | 通过宿主接口创建、修改或删除获准范围内的 Agent 记忆。 |

`agent.turns.operate` 的 scope 示例：

```json
{
  "name": "agent.turns.operate",
  "scope": {
    "operations": ["start", "cancel"],
    "cancelTargets": "own"
  }
}
```

`cancelTargets: own` 指仅能取消本插件发起的执行。`start` 的频率与次数上限待决。

### files

| 权限 | 说明 |
| --- | --- |
| `files.read` | 读取文件、查看目录和文件属性。默认仅限插件自己的目录；超出该范围需要单独声明的高权限。 |
| `files.write` | 创建、覆盖、移动、重命名或删除获准范围内的文件。 |
| `files.watch` | 监听获准目录或文件的变化。 |

插件在挂载的 `./<plugin-name>/tmp` 目录下可以创建临时文件，并具有读写权限。该限制适用于插件文件 API。

### process

| 权限 | 说明 |
| --- | --- |
| `process.exec` | ⚠️ 启动获准宿主程序，传入参数并使用其标准输入输出。见下文约束。 |
| `process.inspect` | 查询本插件启动的进程状态和资源使用情况。 |
| `process.signal` | 向本插件启动的进程发送终止等获准信号。 |

`process.exec` 的约束：

- 程序只能通过**绝对路径白名单**指定，不接受按名称查找，避免 PATH 劫持。
- **禁止 shell 解释器**，包括 `sh`、`bash`、`cmd`、`powershell` 等。
- 临时目录限制适用于插件文件 API，**不适用于 `process.exec` 启动的子进程**。`process.exec` 可能突破文件和网络限制，因此仅应授予明确需要的插件。

### interop

用于插件之间联动的自定义业务事件。

| 权限 | 说明 |
| --- | --- |
| `interop.events.publish` | 发布跨插件可见的业务事件。 |
| `interop.events.subscribe` | 订阅其他插件发布的业务事件。 |

跨插件订阅的授权模型待决。

### ui

| 权限 | 说明 |
| --- | --- |
| `ui.panel` | 加载和运行插件提供的自定义前端 Panel。 |

Panel 的隔离方式待决。

## 待决事项

以下事项尚未定案，实现前需要管理员或维护者确认。

### 拦截类权限

`events.consume`、`messages.intercept`、`agent.tools.intercept` 和 `agent.model.intercept` 都能在某个环节阻断或修改流程。待决：

- 是否合并为统一的 `intercept` 族，以 `target`（事件 / 消息 / 工具 / 模型请求）区分作用点；
- 多个插件同时拦截时的执行顺序和冲突规则。候选方案包括按安装顺序执行、按管理员设置的优先级执行，或同一拦截点只允许一个插件持有。

### 附件读取

`messages.history.read` 的说明已包含附件。待决：是否保留独立的 `messages.attachments.read`，使附件读取可以单独授权。

### 网络防护

- `network.request` 是否默认禁止访问内网地址、回环地址和云元数据地址。
- `network.listen` 是否要求绑定地址白名单，并默认仅允许 `127.0.0.1`。

### 配额与频率

`agent.turns.operate:start`、`llm.call`、`llm.embeddings.call`、`jobs.schedule`、`storage.write` 的速率与总量上限，以及 `quota` 字段的具体结构。

### 隐私

`groups.members.read` 涉及个人信息。待决：是否需要管理员额外确认，是否限制插件把成员信息写入 `storage`，以及数据保留和用途限制。

### 跨插件与界面

- `interop.events.subscribe` 是否需要发布方声明可被订阅，并由订阅方申请、管理员确认。
- `events.publish` 如何防止插件伪造其他插件的命名空间。
- `ui.panel` 的沙箱形式（例如 iframe、sandbox 和 CSP），以及 Panel 能否获取宿主凭据。Panel 应仅通过插件已授予的权限间接调用 API。

### 审计与撤销

- 权限撤销后，正在运行的调用如何处理。
- 高权限操作是否写入审计日志，以及日志保留策略。

### 命名

`groups.muteAll` 为驼峰，其他权限为小写点分。统一方式待定。

## 版本

权限名称一经发布难以修改。清单中应声明所用的插件 API 版本，具体格式待定。
