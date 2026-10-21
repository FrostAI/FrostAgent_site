# 维护文档站

文档源码位于 [FrostAI/FrostAgent_site](https://github.com/FrostAI/FrostAgent_site) 仓库的 `docs/`，使用 VitePress 1.6.4，包含中文导航、本地全文搜索与深浅色主题。它是官网 npm 工作区的 `@frostagent/docs` 包；FrostAgent 应用源码仍在 [GuaiZai233/FrostAgent](https://github.com/GuaiZai233/FrostAgent)，使用自己的 pnpm 工作区。

## 运行

在官网仓库执行，Node.js 版本见根目录 `.node-version`：

```bash
git clone https://github.com/FrostAI/FrostAgent_site.git
cd FrostAgent_site
npm ci
npm run docs:dev
```

文档开发地址默认 `http://localhost:5173/docs/`，修改文档后自动更新。只预览官网时运行 `npm run dev`，地址为 `http://localhost:4321/`；该命令先构建文档，官网预览中的 `/docs/` 是这次构建的静态结果。修改文档后需重新构建，或使用文档开发服务器。

```bash
npm run docs:check
npm run build
npm run check
npm run test:scroll
npm run docs:preview
```

`npm run build` 同时构建 Eleventy 首页与 VitePress 文档，完整静态站点输出到 `_site/`，文档位于 `_site/docs/`。`npm run docs:build` 只更新文档；`npm run docs:preview` 只预览文档，默认地址为 `http://localhost:4173/docs/`。端口被占用时以终端输出为准。

`npm run check` 执行文档配置类型检查、官网静态输出检查，以及文档页面、资源、站内链接和章节锚点检查。构建保留 VitePress 内部死链检查，不要关闭检查来掩盖失效链接。

## 文件组织

以下路径均相对于 `docs/`：

| 路径 | 内容 |
| --- | --- |
| `index.md` | 文档首页 |
| `guide/` | 项目介绍、快速开始、安装部署 |
| `adapters/` | 平台接入 |
| `usage/` | 功能使用 |
| `integrations/` | 外部集成 |
| `reference/` | 配置和 API 入口 |
| `operations/` | 数据、安全、日志与升级 |
| `development/` | 开发和文档维护 |
| `.vitepress/config.ts` | 基路径、输出目录、导航、搜索及编辑链接 |
| `.vitepress/theme/` | 官网红色主题与暗色模式 |
| `public/` | 按原样复制的静态资源，包括官网图标 |

增加页面后同步侧边栏，并从相关章节链接到它。示例使用占位符或合成数据；可复制命令注明运行目录和前置条件。配置范围、默认值与生效条件从 FrostAgent 应用源码核对。

## 部署静态站点

默认基路径是 `/docs/`。官网与文档共用仓库根目录的 `npm run build` 和 `_site` 输出目录。当前官网仓库连接 Cloudflare Workers Builds；也可以按仓库 README 配置 Cloudflare Pages。发布后官网在 `/`，文档在 `/docs/`。部署完整 `_site/`，不要只上传文档输出覆盖官网。

若单独部署文档，可以通过 `DOCS_BASE` 改变访问路径，前后均保留 `/`，例如改为独立域名根路径：

::: code-group

```bash [Bash]
DOCS_BASE=/ npm run docs:build
DOCS_BASE=/ npm run docs:preview
```

```powershell [PowerShell]
$env:DOCS_BASE = '/'
npm run docs:build
npm run docs:preview
Remove-Item Env:DOCS_BASE
```

:::

此时仅部署 `_site/docs/` 的内容；该覆盖配置不适用于官网合并构建，也不用于默认 `/docs/` 的输出检查。恢复默认设置后重新运行 `npm run build`，再发布完整官网。

基路径属于构建配置，修改后必须重新构建。默认保留 `.html` URL；静态服务需要支持目录的 `index.html`，无需额外的无扩展名路由重写。文档不由 FrostAgent 的 `cmd/app` 托管。

仓库内 GitHub Actions 执行安装、构建、输出检查和官网滚动测试。Cloudflare 的实际发布状态需在其部署记录中确认；GitHub CI 通过不代表 Cloudflare 发布成功。
