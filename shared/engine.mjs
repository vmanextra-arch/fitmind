export const LIMITS = Object.freeze({
  days: [1, 7],
  reps: { initial: 8, min: 6, max: 12 },
  recovery: { sleepHours: 6, energy: 2, soreness: 4, recentDays: 3 },
  minutes: [5, 180],
  strengthMinutes: { beginner: 35, intermediate: 50, experienced: 65 },
  sets: { beginner: 2, intermediate: 3, experienced: 4 },
});
export const CATALOG = [
  {
    id: "chair-squat",
    name: "Приседание к стулу",
    group: "legs",
    equipment: [],
    steps: [
      "Устойчивый стул за спиной, стопы на полу.",
      "Плавно сядь и встань в комфортной амплитуде.",
    ],
    source: "https://www.nhs.uk/live-well/exercise/strength-exercises/",
  },
  {
    id: "bridge",
    name: "Ягодичный мост",
    group: "hips",
    equipment: [],
    steps: [
      "Лёжа на спине, согни колени.",
      "Подними таз без чрезмерного прогиба и плавно опусти.",
    ],
    source: "https://www.nasm.org/workout-exercise-guidance",
  },
  {
    id: "wall-press",
    name: "Отжимание от стены",
    group: "push",
    equipment: [],
    steps: [
      "Ладони на стене, удобное расстояние до неё.",
      "Согни и разогни руки в комфортном темпе.",
    ],
    source: "https://www.nhs.uk/live-well/exercise/strength-exercises/",
  },
  {
    id: "band-row",
    name: "Тяга резинки",
    group: "pull",
    equipment: ["bands"],
    steps: [
      "Проверь крепление резинки.",
      "Плавно подтяни руки к корпусу без рывков.",
    ],
    source: "https://www.nasm.org/workout-exercise-guidance",
  },
  {
    id: "dumbbell-squat",
    name: "Приседание с гантелью",
    group: "legs",
    equipment: ["dumbbells"],
    steps: [
      "Выбери комфортный вес, удерживай его перед корпусом.",
      "Выполни приседание без боли и потери устойчивости.",
    ],
    source: "https://www.nasm.org/workout-exercise-guidance",
  },
  {
    id: "bench-squat",
    name: "Приседание к скамье",
    group: "legs",
    equipment: ["bench"],
    steps: [
      "Проверь устойчивость скамьи.",
      "Плавно сядь и встань, сохраняя стопы на полу.",
    ],
    source: "https://www.nhs.uk/live-well/exercise/strength-exercises/",
  },
  {
    id: "dumbbell-row",
    name: "Тяга гантели с опорой",
    group: "pull",
    equipment: ["dumbbells", "bench"],
    steps: [
      "Одной рукой опирайся на устойчивую скамью, сохраняй спину ровной.",
      "Плавно подтяни лёгкую гантель к корпусу и опусти без рывка.",
    ],
    source: "https://www.acefitness.org/resources/everyone/exercise-library/",
  },
  {
    id: "floor-press",
    name: "Жим гантелей лёжа на полу",
    group: "push",
    equipment: ["dumbbells"],
    steps: [
      "Ляг на пол с комфортными гантелями и согнутыми коленями.",
      "Подними гантели вверх и плавно опусти локти к полу без удара.",
    ],
    source: "https://www.acefitness.org/resources/everyone/exercise-library/",
  },
  {
    id: "leg-press",
    name: "Жим ногами в тренажёре",
    group: "legs",
    equipment: ["machines"],
    steps: [
      "Настрой сиденье с инструктором под свой рост.",
      "Выполняй движение подконтрольно, без отрыва таза и резкого выпрямления коленей.",
    ],
    source: "https://www.nasm.org/resource-center/exercise-library/leg-press",
  },
  {
    id: "machine-press",
    name: "Жим в тренажёре",
    group: "push",
    equipment: ["machines"],
    steps: [
      "Настрой положение сиденья и рукояток.",
      "Плавно выжимай рукоятки без рывков.",
    ],
    source:
      "https://www.acefitness.org/resources/everyone/exercise-library/equipment/weight-machines-selectorized/",
  },
  {
    id: "machine-row",
    name: "Тяга в тренажёре",
    group: "pull",
    equipment: ["machines"],
    steps: [
      "Настрой опору и удобный хват.",
      "Подтяни рукоятки без раскачивания корпуса.",
    ],
    source: "https://www.nasm.org/workout-exercise-guidance",
  },
  {
    id: "walk",
    name: "Спокойная ходьба",
    group: "cardio",
    equipment: [],
    steps: [
      "Выбери комфортный темп, при котором можешь говорить.",
      "При усталости замедлись или остановись.",
    ],
  },
  {
    id: "mobility",
    name: "Мягкая подвижность",
    group: "mobility",
    equipment: [],
    steps: [
      "Мягкие круги плечами и комфортные движения суставами.",
      "Не увеличивай амплитуду через боль.",
    ],
  },
];

CATALOG.push({
  id: "march",
  name: "Шаги на месте",
  group: "cardio",
  equipment: [],
  steps: [
    "Шагай в спокойном темпе, мягко ставя стопу.",
    "Дыши свободно; при желании держись за устойчивую опору.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "side-step",
  name: "Приставные шаги",
  group: "cardio",
  equipment: [],
  steps: [
    "Сделай небольшой шаг в сторону и приставь вторую стопу.",
    "Чередуй направления без прыжков и резких движений.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "heel-raise",
  name: "Подъёмы на носки",
  group: "legs",
  equipment: [],
  steps: [
    "Держись за устойчивую опору, стопы параллельно.",
    "Плавно приподними пятки и опусти их на пол.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "seated-knee",
  name: "Подъём колена сидя",
  group: "legs",
  equipment: [],
  steps: [
    "Сядь устойчиво, стопы на полу.",
    "По очереди слегка приподнимай колени, не задерживая дыхание.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "cat-cow",
  name: "Мягкая подвижность спины",
  group: "mobility",
  equipment: [],
  steps: [
    "На четвереньках расположи кисти под плечами.",
    "Мягко округляй и возвращай спину в нейтраль, без глубокого прогиба.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "thoracic-turn",
  name: "Повороты грудного отдела сидя",
  group: "mobility",
  equipment: [],
  steps: [
    "Сядь устойчиво, держи таз неподвижно.",
    "Плавно поворачивай корпус в небольшом комфортном диапазоне.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "ankle-rock",
  name: "Перекаты стоп",
  group: "mobility",
  equipment: [],
  steps: [
    "Сидя или стоя у опоры поставь стопы на пол.",
    "Перекатывай вес с пяток на носки без потери равновесия.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "standing-reach",
  name: "Мягкие вытяжения стоя",
  group: "mobility",
  equipment: [],
  steps: [
    "Встань устойчиво и свободно опусти плечи.",
    "По очереди вытягивай руки вверх без запрокидывания головы.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "seated-fold",
  name: "Наклон к бедру сидя",
  group: "mobility",
  equipment: [],
  steps: [
    "Сядь на край устойчивого стула, выпрями одну ногу вперёд.",
    "Слегка наклони корпус от тазобедренного сустава, не тянись через боль.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "bird-dog",
  name: "Равновесие на четвереньках",
  group: "core",
  equipment: [],
  steps: [
    "На четвереньках найди устойчивое положение спины.",
    "Медленно вытяни противоположные руку и ногу, затем смени сторону. Можно двигать только рукой.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "dead-bug",
  name: "Опускание пятки лёжа",
  group: "core",
  equipment: [],
  steps: [
    "Ляг на спину с согнутыми коленями, без боли в пояснице.",
    "По очереди плавно отводи стопу вперёд по полу и возвращай её.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "side-leg",
  name: "Отведение ноги у опоры",
  group: "hips",
  equipment: [],
  steps: [
    "Держись за устойчивую опору, корпус прямой.",
    "Немного отведи ногу в сторону без наклона корпуса; поменяй сторону.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "wall-slide",
  name: "Скольжение руками по стене",
  group: "mobility",
  equipment: [],
  steps: [
    "Встань у стены и расположи руки на комфортной высоте.",
    "Медленно скользи руками вверх и вниз в безболезненной амплитуде.",
  ],
  accessory: true,
});
CATALOG.push({
  id: "balance",
  name: "Баланс у опоры",
  group: "mobility",
  equipment: [],
  steps: [
    "Встань рядом с устойчивой опорой и держись за неё.",
    "Мягко переноси вес между ногами; не закрывай глаза.",
  ],
  accessory: true,
});

for (const e of CATALOG) {
  if (["seated-knee", "thoracic-turn", "ankle-rock"].includes(e.id))
    e.source = "https://www.nhs.uk/live-well/exercise/sitting-exercises/";
  if (["balance", "side-step"].includes(e.id))
    e.source = "https://www.nhs.uk/live-well/exercise/balance-exercises/";
}
export function validateProfile(p) {
  if (!p || typeof p.name !== "string" || !p.name.trim() || p.name.length > 40)
    throw Error("Укажи имя до 40 символов");
  if (!["male", "female"].includes(p.sex)) throw Error("Выбери пол");
  for (const [key, min, max] of [
    ["age", 18, 90],
    ["height", 130, 220],
    ["weight", 35, 250],
    ["minutes", 5, 180],
  ])
    if (!Number.isFinite(p[key]) || p[key] < min || p[key] > max)
      throw Error("Некорректное поле: " + key);
  if (!["beginner", "intermediate", "experienced"].includes(p.level))
    throw Error("Выбери опыт");
  if (
    !Array.isArray(p.days) ||
    !p.days.length ||
    p.days.length > 7 ||
    new Set(p.days).size !== p.days.length ||
    p.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)
  )
    throw Error("Выбери 1–7 разных дней");
  if (
    !Array.isArray(p.equipment) ||
    p.equipment.some(
      (e) => !["dumbbells", "bands", "bench", "machines"].includes(e),
    )
  )
    throw Error("Некорректное оборудование");
  if (!["health", "strength", "movement", "mobility"].includes(p.goal))
    throw Error("Выбери цель");
  if (![1.2, 1.4, 1.6].includes(p.activity))
    throw Error("Выбери повседневную активность");
  if (!Number.isInteger(p.minutes) || p.minutes % 5 !== 0)
    throw Error("Длительность задаётся с шагом 5 минут");
  return p;
}
export function nutrition(p) {
  validateProfile(p);
  const n = p.nutrition || {};
  const manual = n.manual === true;
  const adjustment = manual ? Number(n.adjustment ?? 5) : 5;
  if (![5, 10, 15].includes(adjustment))
    throw Error("Изменение энергии: 5, 10 или 15%");
  const macros = manual ? n.macros || [20, 30, 50] : [20, 30, 50];
  if (
    !Array.isArray(macros) ||
    macros.length !== 3 ||
    macros.some((x) => !Number.isFinite(x) || x < 0) ||
    Math.abs(macros.reduce((a, b) => a + b, 0) - 100) > 0.01
  )
    throw Error("Сумма долей БЖУ должна быть 100%");
  const direction = { maintain: 0, deficit: -1, surplus: 1 }[
    n.goal || "maintain"
  ];
  if (direction === undefined) throw Error("Неизвестная цель питания");
  const resting =
    10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "male" ? 5 : -161);
  const maintenance = Math.round((resting * p.activity) / 10) * 10;
  const calories =
    Math.round((maintenance * (1 + (direction * adjustment) / 100)) / 10) * 10;
  return {
    resting: Math.round(resting),
    maintenance,
    calories,
    protein: Math.round((calories * macros[0]) / 400),
    fat: Math.round((calories * macros[1]) / 900),
    carbs: Math.round((calories * macros[2]) / 400),
    macros,
    adjustment: direction * adjustment,
  };
}
export function recovery(checkin = {}, history = []) {
  const recent = history
    .filter(
      (w) =>
        !w.date ||
        Date.now() - new Date(w.date + "T12:00:00").getTime() < 3 * 86400000,
    )
    .slice(-2);
  return (
    checkin.energy <= LIMITS.recovery.energy ||
    checkin.soreness >= LIMITS.recovery.soreness ||
    checkin.sleep < LIMITS.recovery.sleepHours ||
    checkin.gentle === true ||
    (recent.length === 2 &&
      recent.every((w) => w.difficulty >= 4 || w.discomfort))
  );
}
export function alternatives(id, equipment) {
  const original = CATALOG.find((e) => e.id === id);
  return original
    ? CATALOG.filter(
        (e) =>
          e.id !== id &&
          e.group === original.group &&
          e.equipment.every((x) => equipment.includes(x)),
      )
    : [];
}
export function plan(p, checkin = {}, history = [], now = new Date()) {
  validateProfile(p);
  const selected = [...p.days].sort((a, b) => a - b);
  const gentle = recovery(checkin, history);
  let previousStrength = false,
    strengthCount = 0;
  const maxStrength =
    p.level === "beginner" ? 3 : p.level === "intermediate" ? 4 : 5;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const good = history
    .filter(
      (w) =>
        w.type === "strength" &&
        w.exercises?.some((e) => e.sets > 0 && e.reps > 0) &&
        w.date &&
        new Date(w.date + "T12:00:00") < monday &&
        monday - new Date(w.date + "T12:00:00") < 14 * 86400000,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-2);
  const progress = good.some((w) => w.discomfort || w.difficulty >= 4)
    ? -1
    : good.length === 2 && good.every((w) => w.difficulty <= 2)
      ? 1
      : 0;
  const targetReps = (id) => {
    const records = good.flatMap((w) =>
      (w.exercises || []).filter(
        (e) => e.id === id && e.sets > 0 && e.reps > 0,
      ),
    );
    const baseline = records.at(-1)?.reps || LIMITS.reps.initial;
    return Math.max(
      LIMITS.reps.min,
      Math.min(
        LIMITS.reps.max,
        baseline + (progress === 1 && records.length < 2 ? 0 : progress),
      ),
    );
  };
  return Array.from({ length: 7 }, (_, day) => {
    if (!selected.includes(day)) {
      previousStrength = false;
      return {
        day,
        type: "rest",
        title: "Отдых",
        minutes: 0,
        exercises: [],
        reason: "День вне выбранного расписания",
      };
    }
    let type =
      p.goal === "mobility"
        ? "mobility"
        : p.goal === "movement"
          ? day % 2
            ? "mobility"
            : "cardio"
          : !previousStrength && strengthCount < maxStrength
            ? "strength"
            : "cardio";
    if (previousStrength && type === "cardio" && day % 2) type = "mobility";
    if (
      type === "strength" &&
      day === 6 &&
      selected.includes(0) &&
      strengthCount > 0
    )
      type = "mobility";
    if (type === "strength") strengthCount++;
    previousStrength = type === "strength";
    let exercises;
    if (type === "strength") {
      exercises = ["legs", "hips", "push", "pull", "core"]
        .map((group) =>
          CATALOG.filter(
            (e) =>
              e.group === group &&
              !e.accessory &&
              e.equipment.every((x) => p.equipment.includes(x)),
          ).at(
            day %
              Math.max(
                1,
                CATALOG.filter(
                  (e) =>
                    e.group === group &&
                    !e.accessory &&
                    e.equipment.every((x) => p.equipment.includes(x)),
                ).length,
              ),
          ),
        )
        .filter(Boolean);
    } else exercises = lightExercises(Math.max(3, p.minutes - 2), day, type);
    const minutes = Math.min(
      p.minutes,
      type === "strength"
        ? LIMITS.strengthMinutes[p.level]
        : type === "cardio"
          ? 60
          : 30,
    );
    const warmup = Math.min(5, Math.max(1, Math.round(minutes * 0.15)));
    const cooldown = Math.min(5, Math.max(1, Math.round(minutes * 0.1)));
    return {
      day,
      type,
      title: {
        strength: "Силовая · всё тело",
        cardio: "Спокойное кардио",
        mobility: "Подвижность и баланс",
      }[type],
      minutes,
      requestedMinutes: p.minutes,
      optionalEasyMinutes: p.minutes - minutes,
      warmup,
      cooldown,
      mainMinutes: minutes - warmup - cooldown,
      exercises: exercises
        .slice(
          0,
          type === "strength"
            ? Math.max(1, Math.floor((minutes - warmup - cooldown) / 2))
            : exercises.length,
        )
        .map((e) => ({
          ...e,
          sets:
            type === "strength"
              ? Math.max(
                  1,
                  Math.min(
                    p.gentle
                      ? 1
                      : Math.max(
                          1,
                          LIMITS.sets[p.level] - (p.goal === "health" ? 1 : 0),
                        ),
                    Math.floor(
                      (minutes - warmup - cooldown) /
                        Math.min(
                          exercises.length,
                          Math.max(
                            1,
                            Math.floor((minutes - warmup - cooldown) / 2),
                          ),
                        ) /
                        2,
                    ),
                  ),
                )
              : 1,
          reps: targetReps(e.id),
        })),
      reason: `Для цели «${{ health: "энергия и здоровье", strength: "стать сильнее", movement: "больше движения", mobility: "гибкость и баланс" }[p.goal]}» выбран ${type === "strength" ? "силовой день без соседней силовой нагрузки" : type === "cardio" ? "день спокойного кардио" : "день подвижности"}. Упражнения соответствуют отмеченному оборудованию; время включает паузы.`,
      todayRecovery: gentle,
    };
  });
}

export function adaptSession(session, checkin = {}, history = []) {
  if (session.type === "rest" || !recovery(checkin, history))
    return { ...session, todayRecovery: false };
  const minutes = Math.min(session.minutes, 20);
  return {
    ...session,
    type: "mobility",
    title: "Восстановление",
    minutes,
    warmup: 1,
    cooldown: 1,
    mainMinutes: Math.max(1, minutes - 2),
    optionalEasyMinutes: 0,
    exercises: lightExercises(
      Math.max(3, minutes - 2),
      session.day,
      "mobility",
    ).map((e) => ({ ...e, sets: 1, reps: 8 })),
    todayRecovery: true,
    reason:
      "Сегодня учтены сон, самочувствие и недавняя нагрузка: вместо силовой — мягкая подвижность или полный отдых. Пропуски не нужно компенсировать.",
  };
}

export function lightExercises(minutes, day = 0, type = "mobility") {
  const ids =
    type === "cardio"
      ? [
          "march",
          "side-step",
          "heel-raise",
          "seated-knee",
          "standing-reach",
          "side-leg",
          "ankle-rock",
          "walk",
        ]
      : [
          "seated-knee",
          "thoracic-turn",
          "ankle-rock",
          "standing-reach",
          "cat-cow",
          "dead-bug",
          "side-leg",
          "wall-slide",
          "balance",
          "seated-fold",
          "heel-raise",
          "march",
        ];
  const count = Math.min(ids.length, Math.max(3, Math.ceil(minutes / 2)));
  return Array.from({ length: count }, (_, i) => ({
    ...CATALOG.find((e) => e.id === ids[(i + day) % ids.length]),
    sets: 1,
    reps: 8,
  }));
}
export function workoutTimeline(s) {
  const warm = s.warmup * 60,
    cool = s.cooldown * 60,
    total = Math.max(1, s.minutes * 60 - warm - cool),
    result = [
      {
        kind: "warmup",
        name: "Мягкая разминка",
        seconds: warm,
        steps: ["Спокойные шаги и небольшие движения в комфортном диапазоне."],
      },
    ];
  const cycles=Math.max(1,Math.ceil(total/(Math.max(1,s.exercises.length)*90)));
  const rounds=s.type==='strength'?s.exercises.flatMap(e=>Array.from({length:e.sets},(_,i)=>({e,round:i+1}))):Array.from({length:cycles},(_,i)=>s.exercises.map(e=>({e,round:i+1}))).flat();
  const count = rounds.length || 1;
  rounds.forEach(({ e, round }, i) => {
    const slot = Math.floor(total / count) + (i < total % count ? 1 : 0),
      work = Math.max(
        1,
        Math.min(s.type === "strength" ? 60 : 75, Math.floor(slot * 0.7)),
      ),
      rest = slot - work;
    result.push({
      kind: "exercise",
      name: e.name,
      exerciseId: e.id,
      seconds: work,
      steps: e.steps,
      reps: e.reps,
      round,
    });
    if (rest)
      result.push({
        kind: "rest",
        name: "Пауза и смена положения",
        seconds: rest,
        steps: [
          "Отдохни, восстанови дыхание и подготовься к следующему движению.",
        ],
      });
  });
  if (!rounds.length)
    result.push({
      kind: "rest",
      name: "Спокойное дыхание",
      seconds: total,
      steps: [],
    });
  result.push({
    kind: "cooldown",
    name: "Заминка",
    seconds: cool,
    steps: ["Замедли темп, расслабь плечи, дыши свободно."],
  });
  return result.filter((x) => x.seconds > 0);
}
