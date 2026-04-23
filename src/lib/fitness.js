export const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'خامل', factor: 1.2 },
  { value: 'light', label: 'خفيف', factor: 1.375 },
  { value: 'moderate', label: 'متوسط', factor: 1.55 },
  { value: 'active', label: 'رياضي', factor: 1.725 },
]

export const GOAL_OPTIONS = [
  { value: 'cut', label: 'تنشيف', delta: -0.18 },
  { value: 'loss', label: 'خسارة وزن', delta: -0.22 },
  { value: 'bulk', label: 'ضخامة', delta: 0.12 },
  { value: 'maintain', label: 'ثبات', delta: 0 },
]

export const GENDER_OPTIONS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
]

export function clampNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function calculateBmr({ weight, height, age, gender }) {
  const w = clampNumber(weight)
  const h = clampNumber(height)
  const a = clampNumber(age)
  const base = 10 * w + 6.25 * h - 5 * a
  const offset = gender === 'male' ? 5 : -161
  return Math.max(0, Math.round(base + offset))
}

export function calculateTdee(bmr, activity) {
  const factor = ACTIVITY_OPTIONS.find((item) => item.value === activity)?.factor ?? 1.2
  return Math.max(0, Math.round(clampNumber(bmr) * factor))
}

export function calculateTargetCalories({ tdee, goal }) {
  const delta = GOAL_OPTIONS.find((item) => item.value === goal)?.delta ?? 0
  return Math.max(0, Math.round(clampNumber(tdee) * (1 + delta)))
}

export function calculateMacros({ calories, weight, goal }) {
  const cals = clampNumber(calories)
  const w = Math.max(0, clampNumber(weight))
  const proteinFactor = goal === 'bulk' ? 1.8 : 2.1
  const fatFactor = 0.8
  const protein = Math.round(w * proteinFactor)
  const fat = Math.round(w * fatFactor)
  const caloriesFromProtein = protein * 4
  const caloriesFromFat = fat * 9
  const remaining = Math.max(0, cals - caloriesFromProtein - caloriesFromFat)
  const carbs = Math.round(remaining / 4)

  return {
    protein,
    fat,
    carbs,
    caloriesFromProtein,
    caloriesFromFat,
    caloriesFromCarbs: carbs * 4,
  }
}

export function calculateWaterNeed({ weight, age, gender, activity }) {
  const w = Math.max(0, clampNumber(weight))
  const a = clampNumber(age)
  let base = w * 35
  if (gender === 'male') base += 250
  if (gender === 'female') base -= 100
  if (a < 18) base += 250
  if (a >= 45) base -= 150

  const activityBoost = {
    sedentary: 0,
    light: 200,
    moderate: 450,
    active: 700,
  }[activity] ?? 0

  return Math.max(1200, Math.round(base + activityBoost))
}

export function formatKg(value) {
  const n = clampNumber(value)
  return `${n.toFixed(1)} كجم`
}

export function formatMl(value) {
  const n = clampNumber(value)
  return `${Math.round(n)} مل`
}

export function getLatestWeight(weightEntries, fallback = '') {
  if (!Array.isArray(weightEntries) || weightEntries.length === 0) return fallback
  return weightEntries[0]?.weight ?? fallback
}
