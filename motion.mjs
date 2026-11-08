// One motion layer for both Sites and VPS. Animations never own application state.
const visibility = new WeakMap();
let routeTransition;
export const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
export function enter(element, { distance = 8, duration = 240 } = {}) {
  if (!element || reducedMotion() || !element.animate) return;
  return element.animate(
    [
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration, easing: "cubic-bezier(.2,.7,.2,1)" },
  );
}
export function setVisible(element, open) {
  const previous = visibility.get(element);
  const style = !element.hidden ? getComputedStyle(element) : null;
  const start = style
    ? { opacity: style.opacity, transform: style.transform }
    : { opacity: 0, transform: "translateY(12px) scale(.98)" };
  previous?.cancel();
  visibility.delete(element);
  element.inert = !open;
  if (reducedMotion() || !element.animate) {
    element.hidden = !open;
    return;
  }
  if (open) element.hidden = false;
  else if (element.hidden) return;
  const animation = element.animate(
    [
      start,
      open
        ? { opacity: 1, transform: "translateY(0) scale(1)" }
        : { opacity: 0, transform: "translateY(10px) scale(.98)" },
    ],
    {
      duration: open ? 260 : 180,
      easing: "cubic-bezier(.2,.7,.2,1)",
      fill: "forwards",
    },
  );
  visibility.set(element, animation);
  animation.finished
    .then(() => {
      if (visibility.get(element) !== animation) return;
      element.hidden = !open;
      visibility.delete(element);
      animation.cancel();
    })
    .catch(() => {});
}
export function transitionPage(update) {
  const focused = document.activeElement,
    focusNav = focused?.dataset?.nav;
  const originalUpdate = update;
  update = () => {
    originalUpdate();
    if (focusNav && !focused?.isConnected)
      document
        .querySelector(`[data-nav="${focusNav}"]`)
        ?.focus({ preventScroll: true });
  };
  routeTransition?.skipTransition();
  if (reducedMotion() || !document.startViewTransition) {
    update();
    enter(document.querySelector("main"));
    return;
  }
  routeTransition = document.startViewTransition(update);
  routeTransition.finished.catch(() => {});
}
const dialogStates = new WeakMap();
export function prepareDialog(dialog) {
  if (dialogStates.has(dialog)) return;
  const state = {
    generation: 0,
    animation: null,
    nativeClose: dialog.close.bind(dialog),
  };
  dialogStates.set(dialog, state);
  dialog.close = (value) => {
    if (!dialog.open) return;
    const generation = ++state.generation;
    state.animation?.cancel();
    if (reducedMotion() || !dialog.animate) {
      state.nativeClose(value);
      return;
    }
    state.animation = dialog.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(10px) scale(.98)" },
      ],
      { duration: 160, easing: "ease-in", fill: "forwards" },
    );
    state.animation.finished
      .then(() => {
        if (state.generation === generation) {
          state.nativeClose(value);
          state.animation.cancel();
          state.animation = null;
        }
      })
      .catch(() => {});
  };
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialog.close();
  });
}
export function revealDialog(dialog) {
  prepareDialog(dialog);
  const state = dialogStates.get(dialog);
  ++state.generation;
  state.animation?.cancel();
  state.animation = null;
  const wasOpen = dialog.open;
  if (!wasOpen) dialog.showModal();
  enter(wasOpen ? dialog.querySelector("#modal-body") : dialog, {
    distance: wasOpen ? 5 : 12,
    duration: wasOpen ? 180 : 240,
  });
}
export function installMotion() {
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    (event) => {
      if (event.matches)
        document.getAnimations().forEach((a) => {
          try {
            a.finish();
          } catch {
            a.cancel();
          }
        });
    },
  );
  prepareDialog(document.querySelector("#modal"));
  document.addEventListener(
    "load",
    (event) => {
      if (event.target instanceof HTMLImageElement)
        enter(event.target, { distance: 0, duration: 320 });
    },
    true,
  );
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        const e = record.target;
        if (
          record.oldValue?.split(" ").includes("hidden") &&
          !e.classList.contains("hidden")
        )
          enter(e, { distance: 5, duration: 200 });
        continue;
      }
      for (const e of record.addedNodes)
        if (e.nodeType === 1) {
          if (e.matches(".chat-message,.banner,.error,.exercise"))
            enter(e, { distance: 6, duration: 220 });
          else if (
            e.id === "food-estimate-result" ||
            e.closest("#food-estimate-result")
          )
            enter(e, { distance: 6, duration: 240 });
        }
    }
  }).observe(document.querySelector("#app"), {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
    attributeOldValue: true,
  });
  // Chat is outside #app so its draft and scroll position survive route changes.
  new MutationObserver((records) => {
    for (const r of records)
      for (const e of r.addedNodes)
        if (e.nodeType === 1 && e.matches(".chat-message"))
          enter(e, { distance: 6, duration: 220 });
  }).observe(document.body, { subtree: true, childList: true });
  document.addEventListener("click", (event) => {
    const summary = event.target.closest("summary");
    if (!summary || summary.parentElement.tagName !== "DETAILS") return;
    const details = summary.parentElement;
    if (reducedMotion() || !details.animate) return;
    event.preventDefault();
    const open =
      details.dataset.motionOpen === "true" ||
      (details.dataset.motionOpen === undefined && details.open);
    details.dataset.motionOpen = String(!open);
    const from = details.getBoundingClientRect().height;
    details.getAnimations().forEach((a) => a.cancel());
    details.open = true;
    const target = open
      ? summary.getBoundingClientRect().height + 30
      : details.scrollHeight;
    details.style.overflow = "hidden";
    const animation = details.animate(
      [{ height: from + "px" }, { height: target + "px" }],
      { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
    animation.finished
      .then(() => {
        if (details.dataset.motionOpen === String(!open)) {
          details.open = !open;
          details.style.overflow = "";
          delete details.dataset.motionOpen;
        }
      })
      .catch(() => {});
  });
}
