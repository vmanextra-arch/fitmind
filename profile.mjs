import { esc, field, segment } from "./ui.mjs";
import { validateProfile, nutrition, plan } from "./shared/engine.mjs";
export const DEFAULT_PROFILE = {
  name: "",
  sex: "female",
  goal: "health",
  level: "beginner",
  activity: 1.2,
  place: "home",
  equipment: [],
  days: [0, 2, 4],
  minutes: 30,
  age: 30,
  height: 165,
  weight: 60,
  theme: "system",
  nutrition: {
    goal: "maintain",
    manual: false,
    adjustment: 5,
    macros: [20, 30, 50],
  },
};
export function profileForm(profile) {
  const p = { ...DEFAULT_PROFILE, ...profile };
  const n = { ...DEFAULT_PROFILE.nutrition, ...p.nutrition };
  return `<div class="heading"><div class="eyebrow">Твой старт</div><h1>${profile ? "Настройки твоего плана" : "Давай познакомимся"}</h1><p>Расскажи о себе — составим понятный план под твой ритм.</p></div><form id="profile-form" class="card form"><div class="row between hint"><span id="step-label">Шаг 1 из 4</span><span id="step-percent">25%</span></div><div class="progress"><i id="step-progress" style="width:25%"></i></div>
 <section data-step="0"><h2>Начнём с тебя</h2><label class="field"><span>Пол и обращение</span>${segment(
   "sex",
   p.sex,
   [
     ["female", "Женский"],
     ["male", "Мужской"],
   ],
 )}</label>${field("Как к тебе обращаться?", "name", p.name, "text", 'required maxlength="40" autocomplete="given-name" placeholder="Твоё имя"')}<fieldset style="border:0;padding:0"><legend>Главная цель</legend><div class="checks">${[
   ["health", "Энергия и здоровье"],
   ["strength", "Стать сильнее"],
   ["movement", "Больше движения"],
   ["mobility", "Гибкость и баланс"],
 ]
   .map(
     ([key, label]) =>
       `<label><input type="radio" name="goal" value="${key}" ${p.goal === key ? "checked" : ""}>${label}</label>`,
   )
   .join("")}</div></fieldset></section>
 <section data-step="1" class="hidden"><h2>Твой опыт и условия</h2><p class="hint">Опыт, ежедневная активность и энергия сегодня — разные вещи. Здесь выбираем привычный ритм.</p><label class="field"><span>Какой у тебя опыт?</span>${segment(
   "level",
   p.level,
   [
     ["beginner", "Новичок"],
     ["intermediate", "Есть опыт"],
     ["experienced", "Опытный"],
   ],
 )}</label><label class="field"><span>Повседневная активность</span><select name="activity">${[
   [1.2, "В основном сижу"],
   [1.4, "Регулярно гуляю и двигаюсь"],
   [1.6, "Много двигаюсь в течение дня"],
 ]
   .map(
     ([key, label]) =>
       `<option value="${key}" ${p.activity === key ? "selected" : ""}>${label}</option>`,
   )
   .join(
     "",
   )}</select></label><label class="field"><span>Где занимаешься?</span>${segment(
   "place",
   p.place,
   [
     ["home", "Дома"],
     ["gym", "В зале"],
   ],
 )}</label><p>Доступное оборудование</p><div class="checks">${[
   ["dumbbells", "Гантели"],
   ["bands", "Резинки"],
   ["bench", "Скамья"],
   ["machines", "Тренажёры"],
 ]
   .map(
     ([key, label]) =>
       `<label><input type="checkbox" name="equipment" value="${key}" ${p.equipment.includes(key) ? "checked" : ""}>${label}</label>`,
   )
   .join(
     "",
   )}</div><p class="hint">Ничего не выбрано — план без инвентаря.</p><label class="row hint"><input type="checkbox" name="gentle" ${p.gentle ? "checked" : ""}>Предпочитаю бережную нагрузку</label></section>
 <section data-step="2" class="hidden"><h2>Когда удобно заниматься?</h2><p class="hint">Можно выбрать от одного до семи дней. Ежедневный план чередует виды нагрузки.</p><div class="checks">${["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((label, index) => `<label><input type="checkbox" name="days" value="${index}" ${p.days.includes(index) ? "checked" : ""}>${label}</label>`).join("")}</div><label class="field"><span>Длительность занятия: <output id="minutes-output">${p.minutes}</output> минут</span><input id="minutes-range" type="range" min="5" max="180" step="5" value="${p.minutes}"></label>${field("Или введи число минут", "minutes", p.minutes, "number", 'required min="5" max="180" step="5"')}<p class="hint">Длинная длительность не означает столько же тяжёлой нагрузки. Покажем отдельно основную часть и необязательное спокойное движение.</p></section>
 <section data-step="3" class="hidden"><h2>Параметры для расчётов</h2><div class="form-grid">${field("Возраст", "age", p.age, "number", 'required min="18" max="90"')}${field("Рост, см", "height", p.height, "number", 'required min="130" max="220"')}${field("Вес, кг", "weight", p.weight, "number", 'required min="35" max="250" step="0.1"')}</div><p class="hint">Сервис рассчитан на взрослых. Расчёты приблизительные и не заменяют индивидуальную рекомендацию специалиста.</p><label class="field"><span>Цель питания</span>${segment(
   "energyGoal",
   n.goal,
   [
     ["maintain", "Поддержание"],
     ["deficit", "Снизить вес"],
     ["surplus", "Набрать вес"],
   ],
 )}</label><label class="row"><input type="checkbox" id="manual-nutrition" name="manual" ${n.manual ? "checked" : ""}>Настроить питание вручную</label><div id="nutrition-advanced" class="${n.manual ? "" : "hidden"}"><div class="banner">Проценты — доля дневной энергии из продукта. Итог покажем в граммах. Например, 20% белка при 2000 ккал — около 100 г.</div><label class="field"><span>Изменение от поддержания, %</span><select name="adjustment">${[5, 10, 15].map((value) => `<option ${n.adjustment === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><div class="form-grid">${field("Белки, %", "protein", n.macros[0], "number", 'min="0" max="100"')}${field("Жиры, %", "fat", n.macros[1], "number", 'min="0" max="100"')}${field("Углеводы, %", "carbs", n.macros[2], "number", 'min="0" max="100"')}</div><p class="hint">Сумма должна быть 100%. При поддержании изменение калорий не применяется.</p></div></section>
 <div id="profile-preview" class="banner" aria-live="polite"></div><p id="profile-error" class="error" role="alert"></p><div class="row between section"><button type="button" class="button secondary" id="profile-back">Назад</button><button type="button" class="button" id="profile-next">Дальше →</button><button type="submit" class="button hidden" id="profile-save">Рассчитать мой план</button></div></form>`;
}
export function bindProfile(onSave, oldProfile, onCancel) {
  const form = document.querySelector("#profile-form");
  let step = 0;
  const show = () => {
    form
      .querySelectorAll("[data-step]")
      .forEach((el) =>
        el.classList.toggle("hidden", Number(el.dataset.step) !== step),
      );
    form.querySelector("#step-label").textContent = `Шаг ${step + 1} из 4`;
    form.querySelector("#step-percent").textContent = (step + 1) * 25 + "%";
    form.querySelector("#step-progress").style.width = (step + 1) * 25 + "%";
    form.querySelector("#profile-next").classList.toggle("hidden", step === 3);
    form.querySelector("#profile-save").classList.toggle("hidden", step !== 3);
    form.querySelector("#profile-back").textContent = step
      ? "← Назад"
      : oldProfile
        ? "Отмена"
        : "Назад";
  };
  form.querySelector("#profile-next").onclick = () => {
    const controls = form
      .querySelector(`[data-step="${step}"]`)
      .querySelectorAll("input,select");
    for (const input of controls) if (!input.reportValidity()) return;
    if (step === 2 && !form.querySelector('[name="days"]:checked')) {
      form.querySelector("#profile-error").textContent =
        "Выбери хотя бы один день";
      return;
    }
    step++;
    show();
  };
  form.querySelector("#profile-back").onclick = () => {
    if (step) {
      step--;
      show();
    } else if (oldProfile) onCancel();
  };
  const readDraft = () => {
    const data = new FormData(form);
    return {
      ...oldProfile,
      name: String(data.get("name")).trim(),
      sex: data.get("sex"),
      goal: data.get("goal"),
      level: data.get("level"),
      activity: Number(data.get("activity")),
      place: data.get("place"),
      equipment: data.getAll("equipment"),
      gentle: data.has("gentle"),
      days: data.getAll("days").map(Number),
      minutes: Number(data.get("minutes")),
      age: Number(data.get("age")),
      height: Number(data.get("height")),
      weight: Number(data.get("weight")),
      theme:
        oldProfile?.theme || localStorage.getItem("fitmind-theme") || "system",
      nutrition: {
        goal: data.get("energyGoal"),
        manual: data.has("manual"),
        adjustment: Number(data.get("adjustment")),
        macros: ["protein", "fat", "carbs"].map((key) => Number(data.get(key))),
      },
    };
  };
  const preview = () => {
    try {
      const draft = readDraft();
      const n = nutrition(draft),
        week = plan(draft);
      form.querySelector("#profile-preview").textContent =
        `После сохранения: ${draft.days.length} дней, ${week.filter((d) => d.type === "strength").length} силовых; основная тренировка до ${Math.max(...week.map((d) => d.minutes))} мин. Питание: ${n.calories} ккал · Б ${n.protein} г · Ж ${n.fat} г · У ${n.carbs} г.`;
    } catch {
      form.querySelector("#profile-preview").textContent =
        "Заполни анкету — здесь появится предварительный расчёт. Изменения вступят в силу после сохранения.";
    }
  };
  form.addEventListener("input", preview);
  form.addEventListener("change", preview);
  preview();
  const range = form.querySelector("#minutes-range"),
    number = form.elements.minutes;
  range.oninput = () => {
    number.value = range.value;
    form.querySelector("#minutes-output").textContent = range.value;
  };
  number.oninput = () => {
    range.value = number.value;
    form.querySelector("#minutes-output").textContent = number.value;
  };
  form.querySelector("#manual-nutrition").onchange = (event) =>
    form
      .querySelector("#nutrition-advanced")
      .classList.toggle("hidden", !event.target.checked);
  form.onsubmit = async (event) => {
    event.preventDefault();
    try {
      const profile = readDraft();
      validateProfile(profile);
      nutrition(profile);
      await onSave(profile);
    } catch (error) {
      form.querySelector("#profile-error").textContent = error.message;
    }
  };
  show();
}
