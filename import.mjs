import { validateState } from "./shared/validation.mjs";
import { DEFAULT_PROFILE } from "./profile.mjs";
export function prepareImport(input) {
  let state = structuredClone(input.state || input);
  const warnings = [];
  if (
    !state.profile ||
    !Array.isArray(state.workouts) ||
    !state.checkins ||
    !state.food
  )
    throw Error("Нужен JSON профиля и журналов FitMind");
  if (!Array.isArray(state.profile.days)) {
    const old = state.profile;
    state.profile = {
      ...DEFAULT_PROFILE,
      name: old.name,
      sex: old.formulaSex || "female",
      goal:
        {
          "Энергия и здоровье": "health",
          "Стать сильнее": "strength",
          "Больше движения": "movement",
          "Гибкость и баланс": "mobility",
        }[old.goal] || "health",
      level:
        {
          Начинаю: "beginner",
          "Есть небольшой опыт": "intermediate",
          Опытный: "experienced",
        }[old.level] || "beginner",
      age: Number(old.age) || 30,
      height: Number(old.height) || 165,
      weight: Number(old.weight) || 60,
      minutes: Number(old.minutes) || 30,
      activity: Number(old.activityFactor) || 1.2,
      days: old.trainingDays || [0, 2, 4, 6].slice(0, Number(old.days) || 3),
      place: String(old.place).includes("зал") ? "gym" : "home",
      equipment: [],
      nutrition: {
        goal: old.energyGoal || "maintain",
        manual: false,
        adjustment: 5,
        macros: [20, 30, 50],
      },
      aiConsent: false,
    };
    state.workouts = state.workouts.map((w) => ({
      id: crypto.randomUUID(),
      date: w.date,
      title: w.title || "Импортированное занятие",
      type: "legacy",
      minutes: Number(w.minutes),
      difficulty: 3,
      discomfort: false,
      exercises: [],
    }));
    state.checkins = Object.fromEntries(
      Object.entries(state.checkins).map(([day, c]) => [
        day,
        {
          energy: Math.max(1, Math.min(5, Number(c.energy) || 3)),
          soreness: Math.max(1, Math.min(5, (Number(c.soreness) || 0) * 2 + 1)),
          sleep: Number(c.sleep) || 0,
          steps: Number(c.steps) || 0,
          note: "Импорт прежнего дневника; шкалы адаптированы",
          gentle: c.gentle === "yes",
        },
      ]),
    );
    state.food = Object.fromEntries(
      Object.entries(state.food).map(([day, entries]) => [
        day,
        entries.map((e) => ({ ...e, id: crypto.randomUUID() })),
      ]),
    );
    state.overrides = {};
    warnings.push(
      "Прежние шкалы преобразованы. У старых отчётов нет оценки сложности: поставлено нейтральное 3/5. Проверь анкету, пол, размеры и оборудование после импорта; отсутствующие параметры заменены начальными значениями.",
    );
  }
  state.profile.aiConsent = false;
  state.overrides ??= {};
  validateState(state);
  return { state, warnings };
}
