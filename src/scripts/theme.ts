export {};

type Theme = "light" | "dark";

const root = document.documentElement;
const systemDark = matchMedia("(prefers-color-scheme: dark)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function currentTheme(): Theme {
  return root.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme, persist: boolean): void {
  root.dataset.theme = theme;
  if (persist) {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage can be blocked; the theme still applies for this page */
    }
  }
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", label);
    button.title = label;
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#060609" : "#f3eee4");
  window.dispatchEvent(new CustomEvent<Theme>("themechange", { detail: theme }));
}

function toggleTheme(event: MouseEvent): void {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  const button = event.currentTarget as HTMLElement;

  if (!("startViewTransition" in document) || reducedMotion.matches) {
    applyTheme(next, true);
    return;
  }

  const rect = button.getBoundingClientRect();
  root.style.setProperty("--vt-x", `${rect.left + rect.width / 2}px`);
  root.style.setProperty("--vt-y", `${rect.top + rect.height / 2}px`);
  root.classList.add("theme-transition");
  const transition = document.startViewTransition(() => applyTheme(next, true));
  transition.finished.finally(() => root.classList.remove("theme-transition"));
}

applyTheme(currentTheme(), false);

document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", toggleTheme);
});

systemDark.addEventListener("change", (event) => {
  if (!storedTheme()) applyTheme(event.matches ? "dark" : "light", false);
});
