export function parseFoodEstimate(reply) {
  let v;
  try {
    v = JSON.parse(
      reply
        .trim()
        .replace(/^```(?:json)?\s*/, "")
        .replace(/```$/, ""),
    );
  } catch {
    throw Error(
      "ИИ не смог оценить порцию. Уточни продукт и способ приготовления или введи данные вручную.",
    );
  }
  if (
    typeof v.name !== "string" ||
    !v.name.trim() ||
    v.name.length > 65 ||
    typeof v.explanation !== "string" ||
    v.explanation.length > 1000 ||
    !Number.isFinite(v.calories) ||
    v.calories < 0 ||
    v.calories > 10000 ||
    ["protein", "fat", "carbs"].some(
      (k) => !Number.isFinite(v[k]) || v[k] < 0 || v[k] > 1000,
    )
  )
    throw Error(
      "Оценка ИИ не прошла проверку. Введи данные с упаковки вручную.",
    );
  return {
    ...v,
    calories: Math.round(v.calories),
    ...Object.fromEntries(
      ["protein", "fat", "carbs"].map((k) => [k, Math.round(v[k] * 10) / 10]),
    ),
  };
}
