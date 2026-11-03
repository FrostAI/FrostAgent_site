import { defineConfig } from 'vitepress';
import { nav, sidebar } from './navigation';

const base = process.env.DOCS_BASE || '/docs/';

export default defineConfig({
  lang: 'zh-CN',
  title: 'FrostAgent',
  description: 'FrostAgent 项目介绍、安装部署、配置参考与使用指南。',
  base,
  outDir: '../_site/docs',
  lastUpdated: true,
  markdown: { codeCopyButtonTitle: '复制代码' },
  head: [
    ['meta', { name: 'theme-color', content: '#bd2a2e' }],
    [
      'link',
      { rel: 'icon', type: 'image/png', href: `${base}frostagent-mascot.png` },
    ],
  ],
  themeConfig: {
    logo: '/frostagent-mascot.png',
    nav,
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/GuaiZai233/FrostAgent' },
    ],
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详细内容',
                resetButtonTitle: '清除搜索',
                backButtonTitle: '返回',
                noResultsText: '没有找到相关内容',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '向上',
                  navigateDownKeyAriaLabel: '向下',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc',
                },
              },
            },
          },
        },
      },
    },
    outline: { level: 2, label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    editLink: {
      pattern: 'https://github.com/FrostAI/FrostAgent_site/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
    },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换至浅色模式',
    darkModeSwitchTitle: '切换至深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    langMenuLabel: '语言',
    notFound: {
      title: '页面未找到',
      quote: '这个地址没有对应的文档，可以返回首页或使用搜索查找。',
      linkLabel: '返回首页',
      linkText: '返回首页',
    },
    footer: { message: '基于 MPL-2.0 许可证发布', copyright: 'FrostAgent' },
  },
});
