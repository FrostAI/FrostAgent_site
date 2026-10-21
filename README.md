# FrostAgent 静态网站

参考 [GuaiTech](https://guaitech.org) 的技术栈与布局，官网首页使用 Eleventy 3、Nunjucks 和原生 CSS / JavaScript 构建，`docs/` 使用 VitePress 提供完整中文使用文档。

## 本地开发

```sh
npm ci
npm run dev
```

预览地址：`http://localhost:4321/`，文档入口为 `/docs/`。官网源码修改后自动重新构建；文档在启动前构建一次，修改文档请运行 `npm run docs:dev`，使用 `http://localhost:5173/docs/` 热更新。

页面使用 `rem` 统一尺寸，`src/assets/site.css` 中的 `--site-scale` 控制整体比例，当前为 `1.2`（120%）。

## 构建与检查

```sh
npm run build
npm run check
npm run test:scroll
```

构建同时生成官网首页和文档。完整输出位于 `_site/`，其中 `_site/docs/` 对应 `/docs/`；整体交给支持目录索引的静态文件服务器托管。`npm run check` 包含文档类型检查、静态资源和站内链接/章节锚点检查。网站源码仓库为 [FrostAI/FrostAgent_site](https://github.com/FrostAI/FrostAgent_site)。

## 文档开发

```sh
npm run docs:dev
npm run docs:check
npm run docs:build
npm run docs:preview
```

文档预览默认 `http://localhost:4173/docs/`。依赖统一由根目录 `package-lock.json` 锁定，使用 `npm ci` 安装两个站点的依赖；文档的基路径与单独部署方法见 [维护文档站](docs/development/docs.md)。

## Cloudflare Pages 部署

本项目使用 Cloudflare Pages 的 Git 集成进行部署：

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，进入 **Workers & Pages → Create application → Pages → Import an existing Git repository**。
2. 连接 GitHub，授权 Cloudflare Pages 访问 `FrostAI/FrostAgent_site`，选择这个仓库并开始设置。若列表没有该仓库，在 GitHub 集成权限中为 `FrostAI` 组织开放这个仓库的访问权限。
3. 填写以下构建参数：

   | 设置 | 值 |
   | --- | --- |
   | 项目名称 | 例如 `frostagent-site`，以实际可用名称为准 |
   | 生产分支 | `main` |
   | 框架预设 | `Eleventy` |
   | 根目录 | 留空，使用仓库根目录 |
   | 构建命令 | `npm run build` |
   | 构建输出目录 | `_site` |

   仓库的 `.node-version` 已指定 Node.js `24.18.0`，Pages 会读取这个文件。构建不需要 API 密钥；贡献者和头像均来自仓库内的静态快照。

4. 点击 **Save and Deploy**。构建成功后，打开控制台显示的 `https://<项目名>.pages.dev` 地址，检查首页、翻页、贡献者滚动效果，以及 `/docs/` 的导航、搜索和文章链接。
5. 若要绑定自己的域名，在 Pages 项目中进入 **Custom domains → Set up a custom domain**，先添加域名，再按向导配置 DNS。具体记录以控制台提示为准。

完成首次连接后，推送到 `main` 会自动触发生产部署；可在 Pages 的 **Deployments** 中核对构建日志、提交和部署状态。

参考：[Eleventy 部署指南](https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/)、[构建环境与 Node.js 版本](https://developers.cloudflare.com/pages/configuration/build-image/)、[自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)。

## 目录

- `docs/`：VitePress 文档源码、主题、官网标识与导航配置。
- `.github/workflows/ci.yml`：官网与文档的构建和检查。
- `src/index.njk`：首页内容。
- `src/_layouts/base.njk`：共享导航、元数据和页脚。
- `src/_includes/icons.njk`：内联 SVG 图标。
- `src/_includes/deploy-terminal.njk`：首屏右侧的部署终端，包含源码 / Docker 切换、命令复制和文档入口。
- `src/assets/site.css`：响应式样式。
- `src/assets/site.js`：移动导航、部署方式切换及命令复制。
- `src/assets/section-scroll.js`：整屏平滑切换、长内容分屏阅读、左侧索引定位及高亮；触屏使用原生滚动吸附，遵循减少动态效果设置。
- `src/_data/pageSections.json`：左侧索引的顺序和名称；每屏底部有翻页箭头，末页可返回首页。
- `src/assets/frostagent-mascot.png`：导航图标和 favicon。
- `.preview/dashboard-original.png`：仅本地暂存的管理控制台原图，不进入 Git 仓库和站点构建。
- `src/_data/contributors.json` 和 `src/assets/contributors/`：GitHub 贡献者与本地头像快照；运行 `npm run update:contributors` 更新。页面通过 CSS 循环滚动，悬停或键盘访问会暂停；减少动态效果时显示静态头像。
- `src/404.njk`：404 页面。

FrostAgent 功能和部署说明核对自项目当前 `main` 分支 README。Docker 示例已按合并的 [PR #211](https://github.com/GuaiZai233/FrostAgent/pull/211) 更新，使用默认桥接部署，不发布管理端口；公网访问需配置 Cloudflare Access 和 Tunnel。页面展示部署命令，不会执行命令或连接真实 Bot；完整前置条件和远程访问配置以项目文档为准。
