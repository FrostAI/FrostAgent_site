document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".nav-links");

if (menuButton && navigation) {
  menuButton.hidden = false;
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "打开导航菜单");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menuButton.setAttribute("aria-label", expanded ? "打开导航菜单" : "关闭导航菜单");
    navigation.classList.toggle("is-open", !expanded);
  });

  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

const deployTabs = Array.from(document.querySelectorAll("[data-panel]"));
const selectTab = (selectedTab) => {
  deployTabs.forEach((tab) => {
    const selected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.dataset.panel).hidden = !selected;
  });
  const status = document.querySelector(".copy-status");
  if (status) status.textContent = "";
};

deployTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % deployTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + deployTabs.length) % deployTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = deployTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectTab(deployTabs[nextIndex]);
    deployTabs[nextIndex].focus();
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = document.getElementById(button.dataset.copy);
    const status = document.querySelector(".copy-status");
    if (!code || !status) return;
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = "命令已复制。请先完成对应的环境与配置准备。";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "无法自动复制，命令已选中，请手动复制。";
    }
  });
});
