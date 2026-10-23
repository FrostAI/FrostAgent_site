import type { DefaultTheme } from 'vitepress';

const gettingStarted: DefaultTheme.SidebarItem[] = [
  {
    text: '开始使用',
    items: [
      { text: '快速开始', link: '/guide/quick-start' },
      { text: '项目介绍', link: '/guide/introduction' },
    ],
  },
  {
    text: '安装部署',
    collapsed: true,
    items: [
      { text: '源码安装', link: '/guide/installation' },
      { text: 'Docker 部署', link: '/guide/docker' },
      { text: '部署与网络', link: '/guide/deployment' },
    ],
  },
  {
    text: '连接平台',
    items: [
      { text: 'OneBot v11', link: '/adapters/onebot' },
      { text: 'AstrBot', link: '/adapters/astrbot' },
    ],
  },
];

const everyday: DefaultTheme.SidebarItem[] = [
  {
    text: '日常使用',
    items: [
      { text: '控制台与实例', link: '/usage/dashboard' },
      { text: '模型配置', link: '/usage/model-router' },
      { text: '人格设定', link: '/usage/persona' },
      { text: '群聊与回复', link: '/usage/group-chat' },
      { text: '记忆管理', link: '/usage/memory' },
      { text: '常用设置', link: '/usage/settings' },
    ],
  },
  {
    text: '更多功能',
    collapsed: true,
    items: [
      { text: '表情包', link: '/usage/stickers' },
      { text: '管理员指令', link: '/usage/commands' },
      { text: '直接对话', link: '/usage/direct-chat' },
      { text: '会话与 Prompt', link: '/usage/sessions' },
      { text: 'Embedding 语义检索', link: '/usage/embedding' },
    ],
  },
];

const integrations: DefaultTheme.SidebarItem[] = [
  {
    text: '扩展能力',
    items: [
      { text: 'Skills 技能包', link: '/integrations/skills' },
      { text: 'MCP 服务器', link: '/integrations/mcp' },
      { text: '隔离沙箱', link: '/integrations/sandbox' },
      { text: 'ActionsCat', link: '/integrations/actionscat' },
      { text: 'Alcyone 计费', link: '/integrations/billing' },
    ],
  },
];

const reference: DefaultTheme.SidebarItem[] = [
  {
    text: '维护与排障',
    items: [
      { text: '故障排查', link: '/operations/troubleshooting' },
      { text: '数据库与备份', link: '/operations/storage' },
      { text: '升级说明', link: '/operations/upgrading' },
      { text: '安全控制', link: '/operations/security' },
    ],
  },
  {
    text: '参数参考',
    collapsed: true,
    items: [
      { text: '配置参考', link: '/reference/configuration' },
      { text: 'API 入口', link: '/reference/api' },
    ],
  },
];

const development: DefaultTheme.SidebarItem[] = [
  {
    text: '参与开发',
    items: [
      { text: '开发指南', link: '/development/' },
      { text: '维护文档站', link: '/development/docs' },
    ],
  },
];

export const nav: DefaultTheme.NavItem[] = [
  { text: '开始使用', link: '/guide/quick-start', activeMatch: '^/(guide|adapters)/' },
  { text: '日常使用', link: '/usage/dashboard', activeMatch: '^/usage/' },
  {
    text: '进阶',
    activeMatch: '^/(integrations|operations|reference|development)/',
    items: [
      { text: '扩展能力', link: '/integrations/skills' },
      { text: '维护与排障', link: '/operations/troubleshooting' },
      { text: '配置参考', link: '/reference/configuration' },
      { text: '参与开发', link: '/development/' },
    ],
  },
];

export const sidebar: DefaultTheme.SidebarMulti = {
  '/guide/': gettingStarted,
  '/adapters/': gettingStarted,
  '/usage/': everyday,
  '/integrations/': integrations,
  '/operations/': reference,
  '/reference/': reference,
  '/development/': development,
};
