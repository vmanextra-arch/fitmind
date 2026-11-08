import { validateProfile, nutrition, CATALOG } from "./engine.mjs";
const object = (v) =>
  v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.getPrototypeOf(v) === Object.prototype;
const number = (v, min, max) => Number.isFinite(v) && v >= min && v <= max;
const text = (v, max) => typeof v === "string" && v.length <= max;
const date = (v) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export function validateState(s) {
  const fail = () => {
    throw Error("Некорректный формат журнала или превышен размер");
  };
  if (
    !object(s) ||
    Object.keys(s).some(
      (k) =>
        !["profile", "workouts", "checkins", "food", "overrides"].includes(k),
    )
  )
    fail();
  validateProfile(s.profile);
  nutrition(s.profile);
  if (s.profile.theme && !["light", "dark", "system"].includes(s.profile.theme))
    fail();
  if (s.profile.place && !["home", "gym"].includes(s.profile.place)) fail();
  if (
    !Array.isArray(s.workouts) ||
    s.workouts.length > 3000 ||
    !object(s.checkins) ||
    !object(s.food) ||
    !object(s.overrides || {})
  )
    fail();
  for (const [key, values] of Object.entries(s.food)) {
    if (!date(key) || !Array.isArray(values) || values.length > 100) fail();
    const ids = new Set();
    for (const e of values) {
      if (
        !object(e) ||
        !text(e.id, 100) ||
        ids.has(e.id) ||
        !text(e.name, 100) ||
        !e.name.trim() ||
        !number(e.calories, 0, 10000) ||
        ["protein", "fat", "carbs"].some((k) => !number(e[k], 0, 1000))
      )
        fail();
      ids.add(e.id);
    }
  }
  for (const [key, c] of Object.entries(s.checkins))
    if (
      !date(key) ||
      !object(c) ||
      !number(c.energy, 1, 5) ||
      !number(c.soreness, 1, 5) ||
      !number(c.sleep, 0, 24) ||
      !number(c.steps, 0, 100000) ||
      !text(c.note || "", 2000)
    )
      fail();
  const ids = new Set();
  for (const w of s.workouts) {
    if (
      !object(w) ||
      !text(w.id, 100) ||
      ids.has(w.id) ||
      !date(w.date) ||
      !number(w.minutes, 1, 180) ||
      !number(w.difficulty, 1, 5) ||
      typeof w.discomfort !== "boolean" ||
      (w.title !== undefined && !text(w.title, 150))
    )
      fail();
    ids.add(w.id);
    if (w.exercises !== undefined) {
      if (!Array.isArray(w.exercises) || w.exercises.length > 20) fail();
      for (const e of w.exercises)
        if (
          !object(e) ||
          !CATALOG.some((x) => x.id === e.id) ||
          !number(e.sets, 0, 10) ||
          !number(e.reps, 0, 100) ||
          (e.weight !== null && !number(e.weight, 0, 500))
        )
          fail();
    }
  }
  if (
    Object.keys(s.checkins).length > 4000 ||
    Object.keys(s.food).length > 4000 ||
    Object.keys(s.overrides || {}).length > 100
  )
    fail();
  for (const [key, id] of Object.entries(s.overrides || {}))
    if (!/^[0-6]:[a-z-]+$/.test(key) || !CATALOG.some((e) => e.id === id))
      fail();
  return s;
}
