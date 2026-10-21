const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../_site");
const source = path.resolve(__dirname, "../docs");

function filesIn(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || entry.name === "node_modules") return [];
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename, extension) : filename.endsWith(extension) ? [filename] : [];
  });
}

const markdown = filesIn(source, ".md");
assert.ok(markdown.length > 0, "Documentation source pages are missing");
for (const filename of markdown) {
  const output = path.join(root, "docs", path.relative(source, filename).replace(/\.md$/, ".html"));
  assert.ok(fs.existsSync(output), `Missing documentation page: ${output}`);
}
assert.ok(fs.existsSync(path.join(root, "docs/404.html")), "Documentation 404 page is missing");
const pages = filesIn(path.join(root, "docs"), ".html");
const htmlCache = new Map();
const htmlFor = (filename) => {
  if (!htmlCache.has(filename)) htmlCache.set(filename, fs.readFileSync(filename, "utf8"));
  return htmlCache.get(filename);
};
let links = 0;
for (const page of pages) {
  const html = htmlFor(page);
  assert.ok(html.includes('href="/docs/frostagent-mascot.png"'), `${page}: favicon must use /docs/`);
  if (!page.endsWith(`${path.sep}404.html`)) {
    assert.ok(html.includes('src="/docs/frostagent-mascot.png"'), `${page}: logo must use /docs/`);
  }
  assert.ok(!html.includes("GuaiZai233/FrostAgent/edit/main/docs/"), `${page}: stale edit link`);
  if (!page.endsWith(`${path.sep}404.html`) && !page.endsWith(`${path.sep}docs${path.sep}index.html`)) {
    assert.ok(html.includes("FrostAI/FrostAgent_site/edit/main/docs/"), `${page}: documentation repository edit link missing`);
  }
  const pageUrl = new URL(path.relative(root, page).split(path.sep).join("/"), "https://site.invalid/");
  for (const [, target] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(target.replaceAll("&amp;", "&"), pageUrl);
    if (url.origin !== pageUrl.origin) continue;
    let destination = path.resolve(root, decodeURIComponent(url.pathname).slice(1));
    assert.ok(destination === root || destination.startsWith(root + path.sep), `${page}: path escapes build output`);
    if (fs.existsSync(destination) && fs.statSync(destination).isDirectory()) destination = path.join(destination, "index.html");
    assert.ok(fs.existsSync(destination), `${page}: missing asset or page ${target}`);
    if (url.hash && destination.endsWith(".html")) {
      const anchor = decodeURIComponent(url.hash.slice(1));
      assert.ok(htmlFor(destination).includes(`id="${anchor}"`), `${page}: missing anchor ${target}`);
    }
    links++;
  }
}
assert.equal(pages.length, markdown.length + 1, "Unexpected documentation HTML page count");
console.log(`${pages.length} documentation pages and ${links} local links/assets/anchors passed.`);
