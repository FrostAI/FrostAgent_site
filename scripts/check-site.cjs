const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../_site");
const pages = ["index.html", "404.html"];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${page}: expected one h1`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: duplicate element IDs`);

  for (const [, attribute, target] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    assert.notEqual(target, "#", `${page}: empty placeholder link`);
    if (target.startsWith("#")) {
      assert.ok(ids.includes(target.slice(1)), `${page}: missing anchor ${target}`);
    } else if (target.startsWith("/") && !target.startsWith("//")) {
      const [pathname, anchor] = target.split("#");
      const file = pathname.endsWith("/") ? `${pathname.slice(1)}index.html` : pathname.slice(1);
      assert.ok(fs.existsSync(path.join(root, file)), `${page}: missing ${attribute} ${target}`);
      if (anchor) {
        const destination = fs.readFileSync(path.join(root, file), "utf8");
        assert.ok(destination.includes(`id="${anchor}"`), `${page}: missing anchor ${target}`);
      }
    }
  }

  for (const [, id] of html.matchAll(/\baria-(?:controls|labelledby)="([^"]+)"/g)) {
    assert.ok(ids.includes(id), `${page}: broken ARIA reference ${id}`);
  }
  console.log(`${page}: heading, asset, anchor, and ARIA checks passed`);
}

const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.ok(home.includes("docker compose up -d --build"), "Docker instructions must include the default Compose startup command");
assert.doesNotMatch(home, /caddy|hash-password/i, "Docker instructions must not retain the retired Caddy setup");
assert.ok(home.includes('id="docker-panel"'), "Docker tab panel is missing");
assert.ok(home.includes('href="/docs/"'), "Documentation navigation is missing");
assert.ok(home.includes('href="/docs/guide/installation.html"'), "Source installation guide link is missing");
assert.ok(home.includes('href="/docs/guide/docker.html"'), "Docker guide link is missing");
console.log("Static output checks passed.");
