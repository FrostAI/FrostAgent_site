const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../src/assets/section-scroll.js"), "utf8");

function browser({ heights = [600, 600, 1000, 600, 400], reduced = false, y = 0 } = {}) {
  let clock = 0;
  let nextFrame = 0;
  const frames = new Map();
  const listeners = {};
  const classes = new Set(["paged"]);
  const styles = new Map();
  const root = {
    scrollHeight: 80 + heights.reduce((sum, height) => sum + height, 0) + 200,
    classList: { contains: (name) => classes.has(name), add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
    style: { setProperty: (name, value) => styles.set(name, value) }
  };
  const body = { matches: () => false, closest: () => null };
  const header = { offsetHeight: 80 };
  const footer = { offsetHeight: 200 };
  const motion = { matches: reduced, addEventListener: (name, callback) => { listeners[`motion:${name}`] = callback; } };
  const window = {
    scrollY: y,
    innerHeight: 680,
    performance: { now: () => clock },
    location: { href: "http://localhost/", origin: "http://localhost", pathname: "/", search: "", hash: "" },
    history: { pushState: (_state, _title, hash) => { window.location.hash = hash; } },
    matchMedia: () => motion,
    getComputedStyle: (element) => ({ overflowY: element.overflowY || "visible" }),
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    scrollTo: ({ top }) => { window.scrollY = Math.max(0, Math.min(top, root.scrollHeight - window.innerHeight)); },
    addEventListener: (name, callback) => { listeners[name] = callback; }
  };
  const sections = heights.map((height, index) => {
    const absoluteTop = 80 + heights.slice(0, index).reduce((sum, value) => sum + value, 0);
    const heading = { focused: false, hasAttribute: () => false, setAttribute: () => {}, focus() { this.focused = true; } };
    return { id: ["home", "about", "features", "ecosystem", "start", "contribute"][index], heading, getBoundingClientRect: () => ({ top: absoluteTop - window.scrollY, height }), querySelector: () => heading };
  });
  const indexLinks = sections.map((section) => {
    const attributes = new Map([["href", `#${section.id}`]]);
    return { getAttribute: (name) => attributes.get(name) || null, setAttribute: (name, value) => attributes.set(name, value), removeAttribute: (name) => attributes.delete(name) };
  });
  const document = {
    documentElement: root,
    body,
    querySelectorAll: (selector) => selector === "main > section" ? sections : indexLinks,
    querySelector: (selector) => selector === ".site-header" ? header : footer,
    getElementById: (id) => sections.find((section) => section.id === id) || null,
    addEventListener: (name, callback) => { listeners[name] = callback; }
  };
  vm.runInNewContext(source, { document, window, URL });
  const advance = (milliseconds) => {
    const end = clock + milliseconds;
    while (clock < end) {
      clock = Math.min(clock + 16, end);
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(clock));
    }
  };
  const wheel = (deltaY = 120, fields = {}) => {
    const event = { deltaY, deltaX: 0, deltaMode: 0, target: body, cancelable: true, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...fields };
    listeners.wheel(event);
    return event;
  };
  return { window, root, body, header, motion, frames, classes, styles, sections, indexLinks, listeners, advance, wheel };
}

test("one wheel gesture animates to the next section without skipping", () => {
  const b = browser();
  assert.equal(b.wheel().defaultPrevented, true);
  b.advance(200);
  assert.ok(b.window.scrollY > 0 && b.window.scrollY < 600);
  for (let i = 0; i < 6; i++) { b.wheel(); b.advance(100); }
  assert.equal(b.window.scrollY, 600);
  b.wheel();
  b.advance(700);
  assert.equal(b.window.scrollY, 600);
  b.advance(200);
  b.wheel();
  b.advance(700);
  assert.equal(b.window.scrollY, 1200);
  assert.equal(b.classes.has("is-section-scrolling"), false);
});

test("reversing during a transition returns to the starting screen", () => {
  const b = browser();
  b.wheel();
  b.advance(250);
  assert.ok(b.window.scrollY > 0);
  b.wheel(-120);
  b.advance(700);
  assert.equal(b.window.scrollY, 0);
});

test("long sections reveal their remaining content before switching", () => {
  const b = browser({ y: 1200 });
  b.wheel();
  b.advance(700);
  assert.equal(b.window.scrollY, 1600);
  b.advance(200);
  b.wheel();
  b.advance(700);
  assert.equal(b.window.scrollY, 2200);
  b.advance(200);
  b.wheel(-120);
  b.advance(700);
  assert.equal(b.window.scrollY, 1600);
  b.advance(200);
  b.wheel(-120);
  b.advance(700);
  assert.equal(b.window.scrollY, 1200);
});

test("horizontal scrolling, zoom, and nested content retain native input", () => {
  const b = browser();
  assert.equal(b.wheel(120, { ctrlKey: true }).defaultPrevented, false);
  assert.equal(b.wheel(120, { deltaX: 200 }).defaultPrevented, false);
  const nested = { matches: () => false, overflowY: "auto", scrollHeight: 1000, clientHeight: 200, scrollTop: 0, parentElement: b.body };
  assert.equal(b.wheel(120, { target: nested }).defaultPrevented, false);
  assert.equal(b.frames.size, 0);
  nested.scrollTop = 800;
  assert.equal(b.wheel(120, { target: nested }).defaultPrevented, true);
});

test("reduced motion jumps immediately and cancels a running transition", () => {
  const b = browser({ reduced: true });
  b.wheel();
  assert.equal(b.window.scrollY, 600);
  assert.equal(b.frames.size, 0);
  b.motion.matches = false;
  b.advance(200);
  b.wheel();
  b.advance(100);
  b.motion.matches = true;
  b.listeners["motion:change"]();
  assert.equal(b.frames.size, 0);
  assert.equal(b.classes.has("is-section-scrolling"), false);
});

test("anchors land below the navigation and focus their destination", () => {
  const b = browser();
  const link = { href: "http://localhost/#features", target: "", hasAttribute: () => false };
  const event = { button: 0, target: { closest: () => link }, preventDefault() { this.defaultPrevented = true; } };
  b.listeners.click(event);
  b.advance(700);
  assert.equal(b.window.location.hash, "#features");
  assert.equal(b.window.scrollY, 1200);
  assert.equal(b.sections[2].getBoundingClientRect().top, 80);
  assert.equal(b.sections[2].heading.focused, true);
});

test("page keys work while interactive controls keep their own keys", () => {
  const b = browser();
  b.listeners.keydown({ key: "PageDown", target: b.body, preventDefault() {} });
  b.advance(700);
  assert.equal(b.window.scrollY, 600);
  b.listeners.keydown({ key: "ArrowLeft", target: { closest: () => ({}) }, preventDefault() { assert.fail("tab key handling was intercepted"); } });
  assert.equal(b.frames.size, 0);
});

test("resizing cancels movement without overriding responsive navigation height", () => {
  const b = browser();
  b.wheel();
  b.advance(100);
  b.header.offsetHeight = 64;
  b.listeners.resize();
  assert.equal(b.frames.size, 0);
  assert.equal(b.styles.has("--nav-height"), false);
  assert.equal(b.styles.get("--site-footer-height"), "200px");
});

test("Escape and native page keys interrupt movement even when a link has focus", () => {
  const b = browser();
  const link = { closest: () => ({}) };
  for (const key of ["Escape", "PageDown"]) {
    b.advance(200);
    b.wheel();
    b.advance(100);
    assert.ok(b.frames.size > 0);
    b.listeners.keydown({ key, target: link, preventDefault() { assert.fail("native link key was intercepted"); } });
    assert.equal(b.frames.size, 0);
  }
});

test("the side index follows wheel navigation and native scrolling in long sections", () => {
  const b = browser();
  const active = () => b.indexLinks.filter((link) => link.getAttribute("aria-current") === "location").map((link) => link.getAttribute("href"));
  assert.deepEqual(active(), ["#home"]);
  b.wheel();
  b.advance(700);
  assert.deepEqual(active(), ["#about"]);
  b.window.scrollY = 1600;
  b.listeners.scroll();
  b.advance(16);
  assert.deepEqual(active(), ["#features"]);
});

test("index and page arrows share smooth anchor navigation, including return to home", () => {
  const b = browser();
  const click = (id) => {
    const link = { href: `http://localhost/#${id}`, target: "", hasAttribute: () => false };
    b.listeners.click({ button: 0, target: { closest: () => link }, preventDefault() {} });
    b.advance(700);
  };
  click("ecosystem");
  assert.equal(b.window.scrollY, 2200);
  assert.equal(b.indexLinks[3].getAttribute("aria-current"), "location");
  click("home");
  assert.equal(b.window.scrollY, 0);
  assert.equal(b.indexLinks[0].getAttribute("aria-current"), "location");
  assert.equal(b.indexLinks.filter((link) => link.getAttribute("aria-current")).length, 1);
});
