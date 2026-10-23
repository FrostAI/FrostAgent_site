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
  const prefix = Object.keys(sidebar).sort((a, b) => b.split('/').length - a.split('/').length)
    .find((key) => route.startsWith(key));
  return sidebar[prefix];
}

const routes = pagesIn(docs).map((filename) => '/' + path.relative(docs, filename)
  .split(path.sep).join('/').replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, ''));

test('top navigation exposes basic and advanced reading paths', () => {
  assert.deepEqual(nav.map((item) => item.text), ['基础', '进阶']);
  assert.deepEqual(nav.map((item) => item.link), ['/basic/', '/advanced/']);
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

test('the two reading levels cover every article without mixing topics', () => {
  const levels = [...new Set(Object.values(sidebar))];
  assert.equal(levels.length, 2);
  const links = levels.flatMap((items) => linksIn(items));
  assert.equal(links.length, new Set(links).size, 'An article belongs to more than one level');
  assert.deepEqual([...links].sort(), routes.filter((route) => route !== '/').sort());
  for (const level of levels) {
    assert.deepEqual(linksIn(level, true), linksIn(level), 'Reading steps must be visible by default');
  }
});

test('every article highlights its own reading level in the top navigation', () => {
  for (const route of routes.filter((route) => route !== '/')) {
    const active = nav.filter((item) => new RegExp(item.activeMatch).test(route));
    assert.equal(active.length, 1, `Ambiguous or missing navigation highlight: ${route}`);
    assert.equal(sectionFor(route), sectionFor(active[0].link), `Wrong reading level: ${route}`);
  }
});

test('basic model and memory operations are separated from their advanced reference', () => {
  const basic = sectionFor('/basic/');
  const advanced = sectionFor('/advanced/');
  for (const route of ['/basic/models', '/basic/memory', '/guide/quick-start', '/guide/docker']) {
    assert.equal(sectionFor(route), basic, route);
  }
  for (const route of ['/usage/model-router', '/usage/memory', '/usage/embedding', '/guide/deployment']) {
    assert.equal(sectionFor(route), advanced, route);
  }
});
