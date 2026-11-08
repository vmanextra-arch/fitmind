import { api } from "./api.mjs";
import { parseFoodEstimate } from "./shared/food.mjs";
import { esc, field, dayKey, toast } from "./ui.mjs";
const title = (name, text) =>
  `<div class="heading"><div class="eyebrow">Твой дневник</div><h1>${name}</h1><p>${text}</p></div>`;
export function journalView(page, state, profile) {
  if (page === "checkin") {
    const c = state.checkins[dayKey()] || {
      sleep: 7,
      energy: 3,
      soreness: 1,
      steps: 0,
      note: "",
    };
    return (
      title(
        "Как ты сегодня?",
        "Самочувствие помогает адаптировать нагрузку, а не оценивать тебя.",
      ) +
      `<form id="checkin-form" class="card form"><div class="form-grid">${field("Сон, часов", "sleep", c.sleep, "number", 'min="0" max="24" step="0.5" required')}${field("Шаги", "steps", c.steps, "number", 'min="0" max="100000" required')}</div>${[
        ["energy", "Энергия", "Нет сил", "Очень бодро"],
        ["soreness", "Болезненность мышц", "Не чувствую", "Очень сильная"],
      ]
        .map(
          ([key, label, low, high]) =>
            `<label class="field"><span>${label}: <output id="${key}-value">${c[key]}</output> / 5</span><input type="range" name="${key}" min="1" max="5" step="1" value="${c[key]}"><span class="row between hint"><span>${low}</span><span>${high}</span></span></label>`,
        )
        .join(
          "",
        )}<label class="row"><input type="checkbox" name="gentle" ${c.gentle ? "checked" : ""}>Сегодня хочу более мягкую нагрузку</label><label class="field"><span>Заметка</span><textarea name="note" maxlength="2000" rows="3">${esc(c.note)}</textarea></label><button class="button">Сохранить самочувствие</button></form>`
    );
  }
  if (page === "food") {
    const entries = state.food[dayKey()] || [],
      sum = entries.reduce(
        (a, e) => {
          for (const key of ["calories", "protein", "fat", "carbs"])
            a[key] += Number(e[key]) || 0;
          return a;
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0 },
      );
    return (
      title(
        "Дневник питания",
        "Значения указываются для съеденной порции, например по упаковке.",
      ) +
      `<div class="stats"><div class="stat"><span>Энергия</span><strong>${Math.round(sum.calories)}</strong><span>ккал сегодня</span></div><div class="stat"><span>Белки</span><strong>${sum.protein.toFixed(1)} г</strong></div><div class="stat"><span>Жиры / углеводы</span><strong style="font-size:18px">${sum.fat.toFixed(1)} / ${sum.carbs.toFixed(1)}</strong><span>граммов</span></div></div><form id="food-estimate-form" class="card form"><h2>Продукт и вес — остальное оценим</h2>${field("Что съели?", "product", "", "text", 'required maxlength="150" placeholder="Например, рис с курицей"')}${field("Вес порции, г", "grams", 150, "number", 'required min="1" max="3000" step="1"')}<label class="field"><span>Уточнения, если известны</span><textarea name="details" rows="2" maxlength="500" placeholder="Варёный или сырой вес, масло, соус, марка…"></textarea></label><label class="hint"><input type="checkbox" name="consent" ${profile.aiConsent ? "checked" : ""}>Разрешаю отправить профиль, план и дневники в DeepSeek для оценки питания</label><button class="button" type="submit">Оценить калории с ИИ</button><p class="hint">Приблизительная оценка для указанной порции. Масло и способ приготовления заметно меняют результат.</p><div id="food-estimate-result" aria-live="polite"></div></form><details id="manual-food" open><summary>Ввести калории и БЖУ вручную / по упаковке</summary><form id="food-form" class="card form"><input type="hidden" name="id">${field("Блюдо или продукт", "name", "", "text", 'required maxlength="100" placeholder="Например, йогурт 150 г"')}<div class="form-grid">${field("Ккал", "calories", "", "number", 'min="0" max="10000" step="0.1" required')}${field("Белки, г", "protein", 0, "number", 'min="0" max="1000" step="0.1"')}${field("Жиры, г", "fat", 0, "number", 'min="0" max="1000" step="0.1"')}${field("Углеводы, г", "carbs", 0, "number", 'min="0" max="1000" step="0.1"')}</div><button class="button">Сохранить запись</button></form></details><div class="section card">${entries.length ? entries.map((e) => `<div class="exercise"><div><b>${esc(e.name)}</b><small>${e.calories} ккал · Б ${e.protein} · Ж ${e.fat} · У ${e.carbs}</small></div><button class="link" data-food-edit="${esc(e.id)}">Изменить</button><button class="link" data-food-delete="${esc(e.id)}">Удалить</button></div>`).join("") : "Записей за сегодня пока нет."}</div>`
    );
  }
  const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      return {
        key: dayKey(d),
        name: d.toLocaleDateString("ru-RU", { weekday: "short" }),
      };
    }),
    totals = dates.map((d) =>
      state.workouts
        .filter((w) => w.date === d.key)
        .reduce((sum, w) => sum + w.minutes, 0),
    ),
    max = Math.max(30, ...totals);
  return (
    title(
      "Твой прогресс",
      "Тренировки и восстановление складываются в привычку.",
    ) +
    `<div class="stats"><div class="stat"><span>Занятий</span><strong>${state.workouts.length}</strong></div><div class="stat"><span>Движение</span><strong>${state.workouts.reduce((sum, w) => sum + w.minutes, 0)} мин</strong></div><div class="stat"><span>Чек-инов</span><strong>${Object.keys(state.checkins).length}</strong></div></div><article class="card"><h2>Последние семь дней</h2><div class="chart">${dates.map((d, i) => `<div class="bar">${totals[i]} мин<i style="height:${Math.max(3, (totals[i] / max) * 100)}px"></i>${d.name}</div>`).join("")}</div></article><div class="section card"><h2>История занятий</h2>${
      [...state.workouts]
        .reverse()
        .map(
          (w) =>
            `<div class="exercise"><div><b>${esc(w.title || "Занятие")}</b><small>${esc(w.date)} · ${w.minutes} мин · сложность ${w.difficulty}/5${w.discomfort ? " · был дискомфорт" : ""}</small></div></div>`,
        )
        .join("") ||
      '<p class="hint">После первого отчёта здесь появится история.</p>'
    }</div>`
  );
}
export function bindJournal(page, store, render) {
  if (page === "checkin") {
    const form = document.querySelector("#checkin-form");
    for (const key of ["energy", "soreness"])
      form.elements[key].oninput = () =>
        (document.querySelector("#" + key + "-value").textContent =
          form.elements[key].value);
    form.onsubmit = (event) => {
      event.preventDefault();
      const d = new FormData(form);
      store.update(
        (s) =>
          (s.checkins[dayKey()] = {
            sleep: Number(d.get("sleep")),
            steps: Number(d.get("steps")),
            energy: Number(d.get("energy")),
            soreness: Number(d.get("soreness")),
            gentle: d.has("gentle"),
            note: String(d.get("note")),
          }),
      );
      toast("Самочувствие сохранено. Сегодняшняя нагрузка обновлена.");
    };
  }
  if (page === "food") {
    const estimateForm = document.querySelector("#food-estimate-form");
    estimateForm.elements.consent.onchange=event=>{store.update(s=>s.profile.aiConsent=event.target.checked);const chat=document.querySelector('#ai-consent');if(chat)chat.checked=event.target.checked;};
    estimateForm.onsubmit = async (event) => {
      event.preventDefault();
      const data = new FormData(estimateForm),
        button = estimateForm.querySelector("button"),
        output = document.querySelector("#food-estimate-result");
      if (!data.has("consent")) {
        output.textContent = "Сначала разреши передачу данных DeepSeek.";
        return;
      }
      button.disabled = true;
      output.textContent = "Оцениваем порцию…";
      try {
        store.update((s) => (s.profile.aiConsent = true));
        const globalConsent = document.querySelector("#ai-consent");
        if (globalConsent) globalConsent.checked = true;
        await store.save();
        if (store.dirty || store.conflict)
          throw Error("Сначала синхронизируй дневник");
        const result = await api("/ai/chat", {
          method: "POST",
          data: {
            revision: store.revision,
            applyChanges: false,
            message:
              'Оцени питание приблизительно для порции. В поле reply верни только JSON-строку без markdown: {"name":string,"calories":number,"protein":number,"fat":number,"carbs":number,"explanation":string}. Значения для ВСЕЙ порции в граммах, не на 100г. Внешний changes должен быть []. Продукт: ' +
              String(data.get("product")) +
              "; масса " +
              Number(data.get("grams")) +
              " г; уточнения: " +
              String(data.get("details")),
          },
        });
        const estimate = parseFoodEstimate(result.reply);
        output.innerHTML = `<article class="banner"><b>Примерно ${estimate.calories} ккал</b><p>Б ${estimate.protein} г · Ж ${estimate.fat} г · У ${estimate.carbs} г</p><p>${esc(estimate.explanation)}</p><button type="button" class="button" id="accept-food-estimate">Добавить в дневник</button></article>`;
        output.querySelector("button").onclick = () => {
          store.update((s) =>
            (s.food[dayKey()] ??= []).push({
              id: crypto.randomUUID(),
              name:
                estimate.name +
                " · " +
                Number(data.get("grams")) +
                " г (оценка ИИ)",
              calories: estimate.calories,
              protein: estimate.protein,
              fat: estimate.fat,
              carbs: estimate.carbs,
            }),
          );
          render();
          toast("Оценка добавлена в дневник");
        };
      } catch (error) {
        output.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    };
    const form = document.querySelector("#food-form");
    form.onsubmit = (event) => {
      event.preventDefault();
      const d = new FormData(form),
        entry = {
          id: d.get("id") || crypto.randomUUID(),
          name: String(d.get("name")).trim(),
          ...Object.fromEntries(
            ["calories", "protein", "fat", "carbs"].map((key) => [
              key,
              Number(d.get(key)),
            ]),
          ),
        };
      store.update((s) => {
        const entries = (s.food[dayKey()] ??= []);
        const index = entries.findIndex((e) => e.id === entry.id);
        if (index >= 0) entries[index] = entry;
        else entries.push(entry);
      });
      render();
      toast("Запись сохранена");
    };
    document.querySelectorAll("[data-food-edit]").forEach(
      (button) =>
        (button.onclick = () => {
          const entry = store.state.food[dayKey()].find(
            (e) => e.id === button.dataset.foodEdit,
          );
          for (const [key, value] of Object.entries(entry))
            if (form.elements[key]) form.elements[key].value = value;
          document.querySelector("#manual-food").open = true;
          form.elements.name.focus();
        }),
    );
    document.querySelectorAll("[data-food-delete]").forEach(
      (button) =>
        (button.onclick = () => {
          if (confirm("Удалить эту запись питания?")) {
            store.update(
              (s) =>
                (s.food[dayKey()] = s.food[dayKey()].filter(
                  (e) => e.id !== button.dataset.foodDelete,
                )),
            );
            render();
          }
        }),
    );
  }
}
