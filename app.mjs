import { installMotion, transitionPage, setVisible } from "./motion.mjs";
import { prepareImport } from "./import.mjs";
import { api } from "./api.mjs";
import { StateStore } from "./state.mjs";
import {
  esc,
  icon,
  dayKey,
  field,
  segment,
  toast,
  modal,
  applyTheme,
} from "./ui.mjs";
import { profileForm, bindProfile } from "./profile.mjs";
import {
  plan,
  nutrition,
  alternatives,
  CATALOG,
  recovery,
  adaptSession,
  workoutTimeline,
} from "./shared/engine.mjs";
import { journalView, bindJournal } from "./journals.mjs";
installMotion();
const root = document.querySelector("#app");
let chatViewEpoch = 0;
let user,
  store,
  page = "home",
  selectedDay = (new Date().getDay() + 6) % 7,
  lastChange = null,
  timer = null,
  deadline = 0,
  remaining = 0,
  session;
const navigation = [
  ["home", "Главная"],
  ["plan", "Мой план"],
  ["checkin", "Самочувствие"],
  ["progress", "Прогресс"],
  ["library", "Полезное"],
  ["food", "Питание"],

  ["profile", "Профиль"],
];
applyTheme(localStorage.getItem("fitmind-theme") || "system");
matchMedia("(prefers-color-scheme:dark)").addEventListener("change", () =>
  applyTheme(
    store?.state.profile?.theme ||
      localStorage.getItem("fitmind-theme") ||
      "system",
  ),
);
const gender = (female, male) =>
  store.state.profile.sex === "female" ? female : male;
function status(value) {
  const labels = {
    saved: "Сохранено",
    saving: "Сохраняем…",
    pending: "Есть изменения",
    offline: "Нет сети · есть локальная копия",
    conflict: "Конфликт версий — открыть",
    error: "Ошибка сохранения — повторить",
  };
  document.querySelectorAll("[data-save-status]").forEach((el) => {
    el.textContent = labels[value] || value;
    el.dataset.status = value;
  });
}
function auth(register = false) {
  root.innerHTML = `<div class="wrap"><div class="auth"><div class="brand"><b>✦</b>Fit<em>Mind</em></div><div class="card"><div class="eyebrow">Твой ритм, твой прогресс</div><h1>${register ? "Создать аккаунт" : "С возвращением"}</h1><p class="muted">План занятий и забота о себе в одном месте.</p><form id="auth-form">${field("Логин", "login", "", "text", 'required minlength="3" maxlength="40" autocomplete="username"')}${field("Пароль", "password", "", "password", `required minlength="10" maxlength="128" autocomplete="${register ? "new-password" : "current-password"}"`)}<p class="hint">Логин: латинские буквы, цифры, _ и -. Пароль: минимум 10 символов.</p><p id="auth-error" class="error" role="alert"></p><button class="button" type="submit">${register ? "Зарегистрироваться" : "Войти"}</button></form><button class="link" id="auth-switch">${register ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}</button></div>${location.protocol === "http:" ? '<p class="banner">Тестовый HTTP-запуск. До HTTPS используй отдельный пароль и тестовые данные.</p>' : ""}</div></div>`;
  document.querySelector("#auth-switch").onclick = () => auth(!register);
  document.querySelector("#auth-form").onsubmit = async (event) => {
    event.preventDefault();
    const button = event.target.querySelector("button");
    button.disabled = true;
    try {
      const data = new FormData(event.target);
      const result = await api("/auth/" + (register ? "register" : "login"), {
        method: "POST",
        data: Object.fromEntries(data),
      });
      await start(result.user);
    } catch (error) {
      document.querySelector("#auth-error").textContent = error.message;
    } finally {
      button.disabled = false;
    }
  };
}
async function start(account) {
  user = account;
  store = new StateStore(user, status);
  await store.load();
  page = store.state.profile ? "home" : "setup";
  applyTheme(store.state.profile?.theme || "system");
  render();
}
function shell(content) {
  const nav = navigation
    .map(
      ([key, label]) =>
        `<button data-nav="${key}" class="${page === key ? "active" : ""}">${icon(key)}<span>${label}</span></button>`,
    )
    .join("");
  const markup = `<div class="wrap"><header class="top"><div class="brand"><b>✦</b>Fit<em>Mind</em></div><div class="top-tools"><span class="date">${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</span><button class="link save-state" data-action="save-status" data-save-status>Сохранено</button><button class="button secondary" data-action="theme" aria-label="Выбрать тему">${icon("theme")}</button></div></header><div class="layout"><aside class="side"><small>Моё пространство</small><nav class="nav">${nav}</nav><div class="side-note"><b>Мягкий подход</b><br>Регулярность, техника и восстановление помогают найти свой ритм.</div></aside><main>${content}</main></div></div><nav class="mobile-nav" aria-label="Разделы FitMind">${nav}</nav>`;
  const existingMain = root.querySelector("main");
  if (existingMain) {
    existingMain.innerHTML = content;
    root
      .querySelectorAll("[data-nav]")
      .forEach((button) =>
        button.classList.toggle("active", button.dataset.nav === page),
      );
  } else root.innerHTML = markup;
  root.querySelectorAll("[data-nav]").forEach(
    (button) =>
      (button.onclick = () => {
        if (!store.state.profile) {
          toast("Сначала заполни профиль");
          return;
        }
        page = button.dataset.nav;
        render();
        window.scrollTo(0, 0);
      }),
  );
  root
    .querySelectorAll("[data-action]")
    .forEach(
      (button) =>
        (button.onclick = () => action(button.dataset.action, button.dataset)),
    );
  if (store.conflict) status("conflict");
  else status(store.lastStatus || "saved");
}
const heading = (label, title, text = "") =>
  `<div class="heading"><div class="eyebrow">${label}</div><h1>${title}</h1><p>${text}</p></div>`;
function currentWeek() {
  const p = store.state.profile,
    today = (new Date().getDay() + 6) % 7;
  return plan(p, store.state.checkins[dayKey()], store.state.workouts)
    .map((s) =>
      s.day === today
        ? adaptSession(s, store.state.checkins[dayKey()], store.state.workouts)
        : { ...s, todayRecovery: false },
    )
    .map((s) => ({
      ...s,
      exercises: s.exercises.map((e) => {
        const id = store.state.overrides?.[s.day + ":" + e.id],
          alt = alternatives(e.id, p.equipment).find((a) => a.id === id);
        return alt ? { ...alt, sets: e.sets, reps: e.reps } : e;
      }),
    }));
}
function todaySession() {
  const week = currentWeek(),
    today = (new Date().getDay() + 6) % 7;
  return week[today].type !== "rest"
    ? week[today]
    : [...week.slice(today + 1), ...week.slice(0, today)].find(
        (s) => s.type !== "rest",
      );
}
function sessionCard(s) {
  return `<article class="card"><span class="pill">${esc(s.title)} · ${s.minutes} мин</span><h2>${s.todayRecovery ? "Сегодня выберем восстановление" : esc(s.title)}</h2><p class="hint">${esc(s.reason)}</p>${s.exercises.map((e) => `<div class="exercise"><div><b>${esc(e.name)}</b><small>${s.type === "strength" ? e.sets + " × " + e.reps : "Комфортный темп"}</small></div><button class="button secondary" data-exercise="${e.id}">Начать упражнение →</button><button class="link" data-replace="${e.id}" data-day="${s.day}">Заменить</button></div>`).join("")}${s.optionalEasyMinutes ? `<p class="banner">Запрошено ${s.requestedMinutes} мин. Основное занятие ${s.minutes} мин; ещё до ${s.optionalEasyMinutes} мин — необязательное спокойное движение с паузами.</p>` : ""}<button class="button" data-workout="${s.day}">Открыть занятие →</button></article>`;
}
function render() {
  transitionPage(paint);
}
function paint() {
  if (!user) return auth();
  const state = store.state,
    p = state.profile;
  if (page === "setup" || page === "edit" || !p) {
    shell(profileForm(p));
    bindProfile(
      async (profile) => {
        store.update((s) => (s.profile = profile));
        applyTheme(profile.theme);
        await store.save();
        page = "home";
        render();
        toast("План рассчитан по твоим параметрам");
      },
      p,
      () => {
        page = "profile";
        render();
      },
    );
    return;
  }
  let content;
  if (page === "home") {
    const check = state.checkins[dayKey()],
      n = nutrition(p),
      s = todaySession();
    content =
      heading(
        "Твоё пространство",
        `Привет, ${esc(p.name)}!`,
        "Маленькие шаги складываются в большие перемены.",
      ) +
      `<article class="hero"><div class="eyebrow">Персональный ритм</div><h2>${recovery(check, state.workouts) ? "Сегодня — бережный день" : "Твой план готов"}</h2><p>${p.days.length} ${p.days.length === 1 ? "день" : "дней"} в неделю · до ${p.minutes} минут. ${gender("Ты сама выбираешь", "Ты сам выбираешь")} комфортный темп.</p><button class="button" data-action="show-plan">Открыть мой план →</button></article><div class="stats"><div class="stat"><span>Шаги</span><strong>${check?.steps ?? "—"}</strong><span>из дневника</span></div><div class="stat"><span>Сон</span><strong>${check?.sleep ?? "—"} ч</strong><span>восстановление</span></div><div class="stat"><span>Энергия</span><strong>${check?.energy ?? "—"} / 5</strong><span>сегодня</span></div></div><div class="grid"><article class="card"><h3>Твои расчёты питания</h3><h2>${n.calories} ккал</h2><p>Б ${n.protein} г · Ж ${n.fat} г · У ${n.carbs} г</p><p class="hint">Оценка по профилю и выбранной цели. Это расчёт, а не назначение рациона.</p><button class="link" data-action="food">Дневник питания →</button></article><article class="card"><h3>Минута для себя</h3><p class="muted">Сон, энергия и недавняя нагрузка помогают адаптировать сегодняшний день.</p><button class="button secondary" data-action="checkin">Отметить самочувствие</button></article></div><div class="section-title"><h2>Ближайшее занятие</h2></div>${sessionCard(s)}`;
  } else if (page === "plan") {
    const week = currentWeek();
    content =
      heading(
        "Твоя неделя",
        "План под твой ритм",
        "Нагрузка чередуется с кардио и подвижностью.",
      ) +
      `<div class="week">${week.map((s, i) => `<button data-select-day="${i}" class="${selectedDay === i ? "active" : ""}">${["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}<small>${s.type === "rest" ? "Отдых" : s.minutes + " мин"}</small></button>`).join("")}</div>` +
      (week[selectedDay].type === "rest"
        ? '<article class="card"><h2>День отдыха</h2><p>Можно выбрать прогулку или полный отдых.</p></article>'
        : sessionCard(week[selectedDay]));
  } else if (["checkin", "food", "progress"].includes(page))
    content = journalView(page, state, p);
  else if (page === "profile")
    content =
      heading("Настройки", "Профиль") +
      `<article class="card"><h2>${esc(p.name)}</h2><p>${p.days.length} дней · ${p.minutes} мин · ${p.place === "gym" ? "В зале" : "Дома"}</p><div class="row"><button class="button" data-action="edit">Изменить анкету</button><button class="button secondary" data-action="theme">Тема оформления</button></div><h3>Данные в этом браузере</h3><p class="hint">Изменения сохраняются только в этом браузере. Для переноса или резервной копии используй экспорт данных.</p><div class="row"><button class="link" data-action="reset-local">Загрузить сохранённую копию</button><button class="link" data-action="export">Экспорт данных</button><label class="link">Импорт<input type="file" id="import-file" accept="application/json" class="hidden"></label></div></article>`;
  else if (page === "library")
    content =
      heading("Знания и техника", "Полезное") +
      `<div class="grid">${CATALOG.map((e) => `<article class="card exercise-card"><img class="exercise-art" src="./assets/exercises/${e.id}.webp" alt="" loading="lazy"><div class="exercise-card-copy"><h3>${esc(e.name)}</h3><p class="hint">${e.equipment.length ? "Нужно оборудование" : "Без оборудования"}</p><button class="button" data-exercise="${e.id}">Начать упражнение →</button></div></article>`).join("")}</div>`;
  else if (page === "ai") {
    page = "home";
    return render();
  }
  shell(content);
  bindContent();
  ensureAssistant();
}
function bindContent() {
  root
    .querySelectorAll("[data-exercise]")
    .forEach(
      (button) =>
        (button.onclick = () => showExercise(button.dataset.exercise)),
    );
  root
    .querySelectorAll("[data-workout]")
    .forEach(
      (button) =>
        (button.onclick = () => openWorkout(Number(button.dataset.workout))),
    );
  root.querySelectorAll("[data-select-day]").forEach(
    (button) =>
      (button.onclick = () => {
        selectedDay = Number(button.dataset.selectDay);
        render();
      }),
  );
  root
    .querySelectorAll("[data-replace]")
    .forEach(
      (button) =>
        (button.onclick = () =>
          replaceExercise(button.dataset.replace, Number(button.dataset.day))),
    );
  if (["checkin", "food"].includes(page))
    bindJournal(page, store, () => render());

  if (page === "profile")
    document.querySelector("#import-file").onchange = previewImport;
}
async function action(name) {
  try {
    if (["food", "checkin", "edit"].includes(name)) {
      page = name;
      render();
    } else if (name === "show-plan") {
      page = "plan";
      render();
    } else if (name === "logout") {
      await store.save();
      if (
        store.dirty &&
        !confirm(
          "Есть несохранённые изменения. Они останутся в локальной копии. Выйти?",
        )
      )
        return;
      await api("/auth/logout", { method: "POST" });
      store.destroy();
      user = null;
      document.querySelector("#assistant-shell")?.remove();
      auth();
    } else if (name === "theme") {
      modal(
        `<h2>Тема оформления</h2>${segment(
          "theme",
          store.state.profile?.theme ||
            localStorage.getItem("fitmind-theme") ||
            "system",
          [
            ["light", "Светлая"],
            ["dark", "Тёмная"],
            ["system", "Системная"],
          ],
        )}`,
      );
      document.querySelector("#modal-body").onchange = (event) => {
        if (event.target.name === "theme") {
          applyTheme(event.target.value);
          if (store.state.profile)
            store.update((s) => (s.profile.theme = event.target.value));
        }
      };
    } else if (name === "save-status") {
      if (store.conflict) {
        modal(
          '<h2>Данные изменились в другой вкладке</h2><p>Можно загрузить сохранённую версию или явно заменить её локальной копией.</p><div class="row"><button class="button" id="use-server">Загрузить сохранённое</button><button class="button secondary" id="use-local">Сохранить мою копию</button></div>',
        );
        document.querySelector("#use-server").onclick = async () => {
          await store.resolveConflict(false);
          document.querySelector("#modal").close();
          render();
        };
        document.querySelector("#use-local").onclick = async () => {
          if (confirm("Заменить сохранённые данные этой копией?")) {
            await store.resolveConflict(true);
            document.querySelector("#modal").close();
            render();
          }
        };
      } else {
        await store.save();
        if (store.lastError) toast(store.lastError);
      }
    } else if (name === "reset-local") {
      if (
        !confirm(
          "Загрузить последнюю сохранённую копию? Несохранённые изменения будут отброшены.",
        )
      )
        return;
      const remote = await api("/state");
      localStorage.removeItem(store.key);
      store.acceptServer(
        remote.state || {
          profile: null,
          workouts: [],
          checkins: {},
          food: {},
          overrides: {},
        },
        remote.revision,
      );
      render();
      toast("Серверные данные загружены");
    } else if (name === "export") {
      const url = URL.createObjectURL(
        new Blob(
          [JSON.stringify({ version: 1, state: store.state }, null, 2)],
          { type: "application/json" },
        ),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "fitmind-export-" + dayKey() + ".json";
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    toast(error.message);
  }
}
function showExercise(id) {
  const e = CATALOG.find((e) => e.id === id);
  if (!e) return;
  modal(
    `<div class="eyebrow">Упражнение</div><h2>${esc(e.name)}</h2><img class="exercise-detail-art" src="./assets/exercises/${e.id}.webp" alt="Иллюстрация упражнения"><p class="hint">Фото для оформления. Ориентируйся на инструкции и комфортную амплитуду.</p>${e.steps.map((step, i) => `<div class="technique"><b>Шаг ${i + 1}</b><p>${esc(step)}</p></div>`).join("")}<p class="hint">Остановись при боли или плохом самочувствии. Для нового тренажёра настрой оборудование с инструктором.</p><button class="button" id="single-exercise-start">Начать · 1 минута</button>${e.source ? `<a href="${e.source}" target="_blank" rel="noopener">Источник и материалы по технике ↗</a>` : ""}`,
  );
  document.querySelector("#single-exercise-start").onclick = () => {
    session = {
      title: e.name,
      type: "mobility",
      minutes: 1,
      warmup: 0,
      cooldown: 0,
      exercises: [{ ...e, sets: 1, reps: 8 }],
    };
    startGuided();
  };
}
function replaceExercise(id, day) {
  const choices = alternatives(id, store.state.profile.equipment);
  modal(
    `<h2>Заменить упражнение</h2>${choices.length ? choices.map((e) => `<button class="button secondary" style="margin:6px" data-alternative="${e.id}">${esc(e.name)}</button>`).join("") : "<p>Под доступное оборудование альтернатив пока нет. Можно пропустить упражнение или изменить список оборудования.</p>"}`,
  );
  document.querySelectorAll("[data-alternative]").forEach(
    (button) =>
      (button.onclick = () => {
        store.update(
          (s) =>
            ((s.overrides ??= {})[day + ":" + id] = button.dataset.alternative),
        );
        document.querySelector("#modal").close();
        render();
      }),
  );
}
function openWorkout(day) {
  session = currentWeek()[day];
  if (recovery(store.state.checkins[dayKey()], store.state.workouts))
    session = adaptSession(
      session,
      store.state.checkins[dayKey()],
      store.state.workouts,
    );
  startGuided();
}
let stages = [],
  stageIndex = 0,
  stageRunning = false;
function startGuided() {
  if (timer) clearInterval(timer);
  timer = null;
  stages = workoutTimeline(session);
  stageIndex = 0;
  stageRunning = false;
  remaining = stages[0].seconds;
  drawStage();
}
function drawStage() {
  const stage = stages[stageIndex];
  modal(
    `<div class="eyebrow">${esc(session.title)} · этап ${stageIndex + 1} / ${stages.length}</div><h2>${esc(stage.name)}</h2>${stage.exerciseId ? `<img class="exercise-detail-art" src="./assets/exercises/${stage.exerciseId}.webp" alt="Иллюстрация движения">` : ""}<div class="progress"><i style="width:${(stageIndex / stages.length) * 100}%"></i></div>${stage.steps.map((x) => "<p>" + esc(x) + "</p>").join("")}${stage.kind === "exercise" && session.type === "strength" ? "<p>Подход " + stage.round + " · ориентир " + stage.reps + " повторений</p>" : ""}<div class="timer" id="timer">${formatTime(remaining)}</div><p class="hint">Можно поставить на паузу, пропустить этап или завершить раньше. Не двигайся через боль.</p><div class="row"><button class="button" id="stage-toggle">${stageRunning ? "Пауза" : "Начать этап"}</button><button class="button secondary" id="stage-next">${stageIndex === stages.length - 1 ? "Завершить" : "Следующий этап →"}</button></div><button class="link" id="workout-report">Завершить раньше и записать результат</button>`,
  );
  document.querySelector("#stage-toggle").onclick = () => {
    if (stageRunning) {
      remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      clearInterval(timer);
      timer = null;
      stageRunning = false;
      drawStage();
    } else {
      stageRunning = true;
      deadline = Date.now() + remaining * 1000;
      document.querySelector("#stage-toggle").textContent = "Пауза";
      timer = setInterval(() => {
        remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        const el = document.querySelector("#timer");
        if (el) el.textContent = formatTime(remaining);
        if (!remaining) advanceStage();
      }, 250);
    }
  };
  document.querySelector("#stage-next").onclick = advanceStage;
  document.querySelector("#workout-report").onclick = reportWorkout;
}
function advanceStage() {
  if (timer) clearInterval(timer);
  timer = null;
  stageRunning = false;
  if (stageIndex >= stages.length - 1) {
    reportWorkout();
    return;
  }
  stageIndex++;
  remaining = stages[stageIndex].seconds;
  drawStage();
}
const formatTime = (seconds) =>
  String(Math.floor(seconds / 60)).padStart(2, "0") +
  ":" +
  String(seconds % 60).padStart(2, "0");
function reportWorkout() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  modal(
    `<h2>Как прошло занятие?</h2><form id="report-form">${field("Фактически минут", "minutes", session.minutes, "number", 'min="1" max="180" required')}<label class="field"><span>Сложность: 1 — легко, 5 — очень тяжело</span><input type="range" name="difficulty" min="1" max="5" value="3"></label><label class="row"><input type="checkbox" name="discomfort">Был дискомфорт</label>${session.exercises.map((e) => `<fieldset class="technique"><legend>${esc(e.name)}</legend><div class="form-grid">${field("Подходы", "sets-" + e.id, e.sets, "number", 'min="0" max="10"')}${field("Повторения", "reps-" + e.id, e.reps, "number", 'min="0" max="100"')}${field("Вес, кг", "weight-" + e.id, "", "number", 'min="0" max="500" step="0.5"')}</div></fieldset>`).join("")}<button class="button">Сохранить результат</button></form>`,
  );
  document.querySelector("#report-form").onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const record = {
      id: crypto.randomUUID(),
      date: dayKey(),
      title: session.title,
      type: session.type,
      minutes: Number(data.get("minutes")),
      difficulty: Number(data.get("difficulty")),
      discomfort: data.has("discomfort"),
      exercises: session.exercises.map((e) => ({
        id: e.id,
        sets: Number(data.get("sets-" + e.id)),
        reps: Number(data.get("reps-" + e.id)),
        weight:
          data.get("weight-" + e.id) === ""
            ? null
            : Number(data.get("weight-" + e.id)),
      })),
    };
    store.update((s) => s.workouts.push(record));
    document.querySelector("#modal").close();
    page = "progress";
    render();
    toast("Результат записан");
  };
}
async function bindAI() {
  document.querySelector("#ai-consent").onchange = (event) => {
    store.update((s) => (s.profile.aiConsent = event.target.checked));
    const foodConsent = document.querySelector(
      "#food-estimate-form [name=consent]",
    );
    if (foodConsent) foodConsent.checked = event.target.checked;
  };
  document.querySelector("#chat-form").onsubmit = async (event) => {
    event.preventDefault();
    const viewEpoch = chatViewEpoch;
    const input = event.target.elements.message,
      message = input.value.trim();
    if (!message) return;
    const button = event.submitter,
      applyChanges = button?.value === "apply";
    event.target.querySelectorAll("button").forEach((b) => (b.disabled = true));
    try {
      await store.save();
      if (store.dirty || store.conflict)
        throw Error("Сначала синхронизируй данные");
      if (viewEpoch === chatViewEpoch) {
        appendChat(message, true);
        input.value = "";
      }
      const generation = store.generation;
      const result = await api("/ai/chat", {
        method: "POST",
        data: { message, revision: store.revision, applyChanges },
      });
      store.acceptServer(result.state, result.revision, generation);
      if (viewEpoch === chatViewEpoch) appendChat(result.reply, false);
      lastChange = result.changeId;
      if (lastChange && viewEpoch === chatViewEpoch) {
        const changeId = lastChange;
        const undo = document.createElement("button");
        undo.className = "button secondary";
        undo.textContent = "Отменить изменения";
        undo.onclick = async () => {
          undo.disabled = true;
          try {
            await store.save();
            if (store.dirty || store.conflict)
              throw Error("Сначала синхронизируй данные");
            const generation = store.generation;
            const result = await api("/ai/undo/" + changeId, {
              method: "POST",
              data: { revision: store.revision },
            });
            store.acceptServer(result.state, result.revision, generation);
            undo.remove();
            toast("Изменения отменены");
          } catch (error) {
            toast(error.message);
          } finally {
            undo.disabled = false;
          }
        };
        document.querySelector("#chat-messages").append(undo);
      }
    } catch (error) {
      if (viewEpoch === chatViewEpoch) appendChat(error.message, false);
    } finally {
      event.target
        .querySelectorAll("button")
        .forEach((b) => (b.disabled = false));
    }
  };
}
function appendChat(text, isUser) {
  const el = document.createElement("div");
  el.className = "chat-message" + (isUser ? " user" : "");
  el.textContent = text;
  const log = document.querySelector("#chat-messages");
  if (log) {
    log.append(el);
    log.scrollTop = log.scrollHeight;
  }
}
async function previewImport(event) {
  try {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 524288) throw Error("Файл слишком большой");
    const imported = JSON.parse(await file.text());
    const { state, warnings } = prepareImport(imported);
    modal(
      `<h2>Импорт данных</h2>${warnings.map((w) => '<p class="banner">' + esc(w) + "</p>").join("")}<p>Профиль: ${esc(state.profile.name)}. Тренировок: ${state.workouts.length}. Текущие данные будут заменены.</p><button class="button" id="confirm-import">Подтвердить импорт</button>`,
    );
    document.querySelector("#confirm-import").onclick = () => {
      store.update((s) => {
        for (const key of Object.keys(s)) delete s[key];
        Object.assign(s, state);
      });
      document.querySelector("#modal").close();
      render();
    };
  } catch (error) {
    toast(error.message);
  }
}
document.querySelector("#modal").addEventListener("close", () => {
  if (timer) {
    remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    clearInterval(timer);
    timer = null;
  }
});
let lastDay = dayKey();
setInterval(() => {
  if (lastDay !== dayKey()) {
    lastDay = dayKey();
    if (user && store.state.profile) render();
  }
}, 60000);
try {
  const result = await api("/auth/me");
  await start(result.user);
} catch (error) {
  if (error.status === 401) auth();
  else {
    root.innerHTML = `<div class="wrap"><article class="card"><h1>Не удалось открыть FitMind</h1><p>${esc(error.message)}</p><button class="button" id="retry">Повторить</button></article></div>`;
    document.querySelector("#retry").onclick = () => location.reload();
  }
}

function ensureAssistant() {
  return; // Static edition: retain AI implementation for future server hosting.

  if (!store?.state.profile || document.querySelector("#assistant-shell"))
    return;
  const wrapper = document.createElement("div");
  wrapper.id = "assistant-shell";
  wrapper.innerHTML = `<button class="chat-launcher" aria-expanded="false" aria-controls="assistant-panel"><span class="online-dot"></span>${icon("ai")}<span>Тренер на связи</span></button><section id="assistant-panel" class="assistant-panel" aria-label="Чат с фитнес-помощником" hidden><header><div><b>FitMind на связи</b><small>DeepSeek · фитнес и питание · контекст сохраняется</small></div><button class="chat-close" aria-label="Закрыть чат">×</button></header><div class="assistant-content"><label class="hint"><input type="checkbox" id="ai-consent" ${store.state.profile.aiConsent ? "checked" : ""}>Разрешаю отправлять профиль, план и журналы в DeepSeek</label><div id="chat-messages" aria-live="polite"></div><form id="chat-form"><label class="field"><span>Чем помочь?</span><textarea name="message" rows="3" maxlength="4000" required placeholder="Тренировки, калории, питание и восстановление…"></textarea></label><div class="row"><button class="button" type="submit" value="advice">Спросить</button><button class="button secondary" type="submit" value="apply">Применить просьбу</button></div><p class="hint">«Спросить» — совет без изменений. «Применить просьбу» — изменить данные с возможностью отмены.</p></form></div></section>`;
  document.body.append(wrapper);
  const launcher = wrapper.querySelector(".chat-launcher"),
    panel = wrapper.querySelector("#assistant-panel");
  const toggle = (open) => {
    if (open && launcher.getAttribute("aria-expanded") !== "true") {
      chatViewEpoch++;
      panel.querySelector("#chat-messages").replaceChildren();
      panel.querySelector("textarea").value = "";
      lastChange = null;
    }
    setVisible(panel, open);
    launcher.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("textarea").focus();
    else launcher.focus();
  };
  launcher.onclick = () =>
    toggle(launcher.getAttribute("aria-expanded") !== "true");
  wrapper.querySelector(".chat-close").onclick = () => toggle(false);
  wrapper.onkeydown = (event) => {
    if (event.key === "Escape") {
      toggle(false);
      launcher.focus();
    }
  };
  bindAI();
}
