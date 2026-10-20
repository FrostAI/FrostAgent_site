(() => {
  const root = document.documentElement;
  const sections = Array.from(document.querySelectorAll("main > section"));
  if (!root.classList.contains("paged") || !sections.length) return;

  const header = document.querySelector(".site-header");
  const footer = document.querySelector(".site-footer");
  const indexLinks = Array.from(document.querySelectorAll(".page-index a[href]"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = null;
  let origin = 0;
  let directionInFlight = 0;
  let gestureLocked = false;
  let lastWheelAt = -Infinity;
  let lastWheelDirection = 0;
  let wheelDistance = 0;

  const navHeight = () => header?.offsetHeight || 0;
  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const clamp = (value) => Math.max(0, Math.min(value, maxScroll()));
  const topOf = (section) => window.scrollY + section.getBoundingClientRect().top - navHeight();

  const sectionAt = (position) => {
    let index = 0;
    sections.forEach((section, candidate) => {
      if (topOf(section) <= position + 2) index = candidate;
    });
    return index;
  };

  const updateIndex = () => {
    const probe = window.scrollY + Math.max(1, (window.innerHeight - navHeight()) * 0.35);
    const active = sections[sectionAt(probe)];
    indexLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${active.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const cancel = () => {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    root.classList.remove("is-section-scrolling");
  };

  const resetGesture = () => {
    gestureLocked = false;
    lastWheelAt = -Infinity;
    wheelDistance = 0;
  };

  const goTo = (position, focusTarget) => {
    cancel();
    origin = window.scrollY;
    const destination = clamp(position);
    const distance = destination - origin;
    directionInFlight = Math.sign(distance);
    const finish = () => {
      window.scrollTo({ top: destination, behavior: "instant" });
      frame = null;
      root.classList.remove("is-section-scrolling");
      updateIndex();
      if (focusTarget) {
        if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({ preventScroll: true });
      }
    };

    root.classList.add("is-section-scrolling");
    if (reducedMotion.matches || Math.abs(distance) < 1) {
      finish();
      return;
    }

    const startedAt = window.performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startedAt) / 650, 1);
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: origin + distance * eased, behavior: "instant" });
      if (progress < 1) frame = window.requestAnimationFrame(animate);
      else finish();
    };
    frame = window.requestAnimationFrame(animate);
  };

  const movePage = (direction) => {
    const y = window.scrollY;
    const pageHeight = Math.max(1, window.innerHeight - navHeight());
    const index = sectionAt(y);
    const section = sections[index];
    const start = topOf(section);
    const bottom = start + section.getBoundingClientRect().height;
    const lastReadingPosition = Math.max(start, bottom - pageHeight);

    if (direction > 0) {
      if (y < lastReadingPosition - 2) goTo(Math.min(y + pageHeight, lastReadingPosition));
      else goTo(index < sections.length - 1 ? topOf(sections[index + 1]) : maxScroll());
    } else if (y > start + 2) {
      goTo(Math.max(start, y - pageHeight));
    } else if (index > 0) {
      const previous = sections[index - 1];
      goTo(topOf(previous) + Math.max(0, previous.getBoundingClientRect().height - pageHeight));
    } else {
      goTo(0);
    }
  };

  const nestedScroll = (target, direction) => {
    for (let element = target; element && element !== document.body; element = element.parentElement) {
      if (element.matches("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return true;
      const style = window.getComputedStyle(element);
      if (!/(auto|scroll)/.test(style.overflowY) || element.scrollHeight <= element.clientHeight + 1) continue;
      if (direction > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) return true;
      if (direction < 0 && element.scrollTop > 1) return true;
    }
    return false;
  };

  window.addEventListener("wheel", (event) => {
    if (event.defaultPrevented || !event.cancelable) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey
        || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) {
      cancel();
      resetGesture();
      return;
    }
    const direction = Math.sign(event.deltaY);
    if (nestedScroll(event.target, direction)) {
      cancel();
      resetGesture();
      return;
    }
    event.preventDefault();
    const now = window.performance.now();
    if (now - lastWheelAt > 180 || direction !== lastWheelDirection) {
      gestureLocked = false;
      wheelDistance = 0;
    }
    lastWheelAt = now;
    lastWheelDirection = direction;

    if (frame !== null) {
      gestureLocked = true;
      if (direction !== directionInFlight) {
        goTo(origin);
      }
      return;
    }
    if (gestureLocked) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    wheelDistance += Math.abs(event.deltaY) * unit;
    if (wheelDistance < 24) return;
    gestureLocked = true;
    movePage(direction);
  }, { passive: false });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey
        || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname
        || url.search !== window.location.search || !url.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); }
    catch { return; }
    if (!target) return;
    event.preventDefault();
    resetGesture();
    if (url.hash !== window.location.hash) window.history.pushState(null, "", url.hash);
    goTo(topOf(target), target.querySelector("h1, h2") || target);
  });

  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Escape") { cancel(); resetGesture(); return; }
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(event.key)) return;
    if (event.target.closest("a, button, input, select, textarea, [role='tab'], [contenteditable]:not([contenteditable='false'])")) {
      cancel();
      resetGesture();
      return;
    }
    event.preventDefault();
    resetGesture();
    if (event.key === "Home") goTo(0);
    else if (event.key === "End") goTo(maxScroll());
    else movePage(["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey) ? -1 : 1);
  });

  const interrupt = () => { cancel(); resetGesture(); };
  const updateMetrics = () => {
    interrupt();
    root.style.setProperty("--site-footer-height", `${footer?.offsetHeight || 0}px`);
    updateIndex();
  };
  let indexFrame = null;
  window.addEventListener("scroll", () => {
    if (indexFrame !== null) return;
    indexFrame = window.requestAnimationFrame(() => {
      indexFrame = null;
      updateIndex();
    });
  }, { passive: true });
  window.addEventListener("touchstart", interrupt, { passive: true });
  window.addEventListener("pointerdown", interrupt, { passive: true });
  window.addEventListener("popstate", interrupt);
  window.addEventListener("hashchange", interrupt);
  window.addEventListener("resize", updateMetrics);
  reducedMotion.addEventListener("change", interrupt);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(updateMetrics);
    if (header) observer.observe(header);
    if (footer) observer.observe(footer);
  }
  updateMetrics();
})();
