// Follows the system theme. The toggle overrides it for this visit only; nothing is stored.
(() => {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");
  const system = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : system.matches;
  const label = () => button.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  button.hidden = false;
  label();
  button.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    label();
  });
  system.addEventListener("change", label);
})();
