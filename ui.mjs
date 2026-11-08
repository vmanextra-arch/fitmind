import { revealDialog } from "./motion.mjs";
export const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export const icon = (name) =>
  `<i class="icon" aria-hidden="true" style="--icon:url('./assets/icons/${name}.png')"></i>`;
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const field = (label, name, value = "", type = "text", extra = "") =>
  `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
export function segment(name, value, options) {
  return `<fieldset class="segment" style="--count:${options.length};--selected:${Math.max(
    0,
    options.findIndex(([key]) => key === value),
  )}" aria-label="${name}">${options.map(([key, label]) => `<label><input type="radio" name="${name}" value="${key}" ${value === key ? "checked" : ""}><span>${label}</span></label>`).join("")}</fieldset>`;
}
export function toast(text) {
  const element = document.querySelector("#toast");
  element.textContent = text;
  element.classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("visible"), 4000);
}
export function modal(html) {
  const dialog = document.querySelector("#modal");
  document.querySelector("#modal-body").innerHTML = html;
  revealDialog(dialog);
  dialog.scrollTop = 0;
}
document
  .querySelector("#modal .close")
  .addEventListener("click", () => document.querySelector("#modal").close());
document.querySelector("#modal").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) {
    const rect = event.target.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      event.target.close();
  }
});
export function applyTheme(theme = "system") {
  const dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme:dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  localStorage.setItem("fitmind-theme", theme);
}

document.addEventListener("change", (event) => {
  if (event.target.matches(".segment input")) {
    const group = event.target.closest(".segment");
    group.style.setProperty(
      "--selected",
      [...group.querySelectorAll("input")].indexOf(event.target),
    );
  }
});
matchMedia("(prefers-color-scheme:dark)").addEventListener("change", () => {
  if (localStorage.getItem("fitmind-theme") === "system") applyTheme("system");
});
