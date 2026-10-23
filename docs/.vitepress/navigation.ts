import type { DefaultTheme } from 'vitepress';

const basic: DefaultTheme.SidebarItem[] = [
  {
    text: '基础入门',
    items: [
      { text: '基础教程总览', link: '/basic/' },
      { text: '项目介绍', link: '/guide/introduction' },
      { text: '快速开始', link: '/guide/quick-start' },
    ],
  },
  {
    text: '安装与接入',
    collapsed: false,
    items: [
      { text: '源码安装', link: '/guide/installation' },
      { text: 'Docker 部署', link: '/guide/docker' },
      { text: 'OneBot v11', link: '/adapters/onebot' },
      { text: 'AstrBot', link: '/adapters/astrbot' },
    ],
  },
  {
    text: '日常配置',
    collapsed: false,
    items: [
      { text: '控制台与实例', link: '/usage/dashboard' },
      { text: '配置第一个模型', link: '/basic/models' },
      { text: '人格与示例对话', link: '/usage/persona' },
      { text: '群聊与回复策略', link: '/usage/group-chat' },
      { text: '使用与管理记忆', link: '/basic/memory' },
      { text: '设置与生效方式', link: '/usage/settings' },
    ],
  },
  {
    text: '其他操作',
    collapsed: false,
    items: [
      { text: '直接对话', link: '/usage/direct-chat' },
      { text: '表情包', link: '/usage/stickers' },
      { text: '管理员指令', link: '/usage/commands' },
    ],
  },
];

const advanced: DefaultTheme.SidebarItem[] = [
  {
    text: '进阶指南',
    items: [{ text: '进阶指南总览', link: '/advanced/' }],
  },
  {
    text: '模型与记忆',
    collapsed: false,
    items: [
      { text: '模型路由与群级覆盖', link: '/usage/model-router' },
      { text: '记忆机制与作用域', link: '/usage/memory' },
      { text: 'Embedding 语义检索', link: '/usage/embedding' },
      { text: '会话与 Prompt', link: '/usage/sessions' },
    ],
  },
  {
    text: '工具扩展',
    collapsed: false,
    items: [
      { text: 'Skills 技能包', link: '/integrations/skills' },
      { text: 'MCP 服务器', link: '/integrations/mcp' },
      { text: '隔离沙箱', link: '/integrations/sandbox' },
      { text: 'ActionsCat', link: '/integrations/actionscat' },
      { text: 'Alcyone 计费', link: '/integrations/billing' },
    ],
  },
  {
    text: '部署与运维',
    collapsed: false,
    items: [
      { text: '部署与网络', link: '/guide/deployment' },
      { text: '安全控制', link: '/operations/security' },
      { text: '数据库与备份', link: '/operations/storage' },
      { text: '升级说明', link: '/operations/upgrading' },
      { text: '日志与故障排查', link: '/operations/troubleshooting' },
    ],
  },
  {
    text: '参考与开发',
    collapsed: false,
    items: [
      { text: '配置参考', link: '/reference/configuration' },
      { text: 'API 入口', link: '/reference/api' },
      { text: '开发指南', link: '/development/' },
      { text: '维护文档站', link: '/development/docs' },
    ],
  },
];

export const nav: DefaultTheme.NavItem[] = [
  {
    text: '基础',
    link: '/basic/',
    activeMatch: '^/(basic/|guide/(introduction|quick-start|installation|docker)|adapters/|usage/(dashboard|persona|group-chat|settings|direct-chat|stickers|commands))',
  },
  {
    text: '进阶',
    link: '/advanced/',
    activeMatch: '^/(advanced/|guide/deployment|usage/(model-router|memory|embedding|sessions)|integrations/|operations/|reference/|development/)',
  },
];

export const sidebar: DefaultTheme.SidebarMulti = {
  // VitePress sorts by path depth; same-depth page overrides must precede directories.
  '/guide/deployment': advanced,
  '/usage/model-router': advanced,
  '/usage/memory': advanced,
  '/usage/embedding': advanced,
  '/usage/sessions': advanced,
  '/basic/': basic,
  '/guide/': basic,
  '/adapters/': basic,
  '/usage/': basic,
  '/advanced/': advanced,
  '/integrations/': advanced,
  '/operations/': advanced,
  '/reference/': advanced,
  '/development/': advanced,
};
