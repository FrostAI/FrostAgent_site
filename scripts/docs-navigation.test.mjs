import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { nav, sidebar } from '../docs/.vitepress/navigation.ts';

const docs = fileURLToPath(new URL('../docs/', import.meta.url));

function pagesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? pagesIn(filename) : filename.endsWith('.md') ? [filename] : [];
  });
}

function linksIn(items, visibleOnly = false) {
  return items.flatMap((item) => [
    ...(item.link ? [item.link] : []),
    ...((visibleOnly && item.collapsed) ? [] : linksIn(item.items || [], visibleOnly)),
  ]);
}

function sectionFor(route) {
  const prefix = Object.keys(sidebar).sort((a, b) => b.length - a.length)
    .find((key) => route.startsWith(key));
  return sidebar[prefix];
}

const routes = pagesIn(docs).map((filename) => '/' + path.relative(docs, filename)
  .split(path.sep).join('/').replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, ''));

test('top navigation has three clear entry points', () => {
  assert.deepEqual(nav.map((item) => item.text), ['开始使用', '日常使用', '进阶']);
  assert.equal(nav[0].link, '/guide/quick-start');
});

test('each article is in its own contextual sidebar exactly once', () => {
  for (const route of routes.filter((route) => route !== '/')) {
    const section = sectionFor(route);
    assert.ok(section, `No sidebar for ${route}`);
    assert.equal(linksIn(section).filter((link) => link === route).length, 1, route);
  }
});

test('all navigation links resolve to documentation pages', () => {
  const links = [...linksIn(nav), ...Object.values(sidebar).flatMap((items) => linksIn(items))];
  for (const link of links) assert.ok(routes.includes(link), `Missing page: ${link}`);
});

test('every sidebar topic is reachable from the top navigation', () => {
  const reachable = new Set(linksIn(nav).map(sectionFor));
  for (const section of Object.values(sidebar)) {
    assert.ok(reachable.has(section), `Topic cannot be reached: ${section[0].text}`);
  }
});

test('sidebars keep the default reading choices small', () => {
  for (const section of new Set(Object.values(sidebar))) {
    assert.ok(linksIn(section, true).length <= 6, `Too many expanded links: ${section[0].text}`);
    assert.ok(linksIn(section).length <= 11, `Unrelated topics in sidebar: ${section[0].text}`);
  }
});
