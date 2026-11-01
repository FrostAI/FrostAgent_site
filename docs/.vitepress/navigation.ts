import type { DefaultTheme } from 'vitepress';

const topics: DefaultTheme.SidebarItem[] = [
  {
    text: '开始使用',
    items: [
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
      { text: '部署与网络', link: '/guide/deployment' },
      { text: 'OneBot v11', link: '/adapters/onebot' },
      { text: 'AstrBot', link: '/adapters/astrbot' },
    ],
  },
  {
    text: '日常配置',
    collapsed: false,
    items: [
      { text: '控制台与实例', link: '/usage/dashboard' },
      { text: '模型配置与路由', link: '/usage/model-router' },
      { text: '人格与示例对话', link: '/usage/persona' },
      { text: '群聊与回复策略', link: '/usage/group-chat' },
      { text: '记忆管理与机制', link: '/usage/memory' },
      { text: 'Embedding 语义检索', link: '/usage/embedding' },
      { text: '会话与 Prompt', link: '/usage/sessions' },
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
  {
    text: '工具扩展',
    collapsed: false,
    items: [
      { text: 'Skills 技能包', link: '/integrations/skills' },
      { text: 'MCP 服务器', link: '/integrations/mcp' },
      { text: '隔离沙箱', link: '/integrations/sandbox' },
      { text: 'ActionsCat', link: '/integrations/actionscat' },
      { text: '计费', link: '/integrations/billing' },
    ],
  },
  {
    text: '运维管理',
    collapsed: false,
    items: [
      { text: '安全控制', link: '/operations/security' },
      { text: '数据库与备份', link: '/operations/storage' },
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
    text: '使用文档',
    link: '/guide/quick-start',
    activeMatch: '^/',
  },
];

export const sidebar: DefaultTheme.SidebarMulti = {
  '/': topics,
};
