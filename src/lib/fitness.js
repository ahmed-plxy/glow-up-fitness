import { EXTRA_FOODS } from '../data/foodExtras'

export const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'خامل', factor: 1.2, hint: 'قليل الحركة أو عمل مكتبي' },
  { value: 'light', label: 'خفيف', factor: 1.375, hint: 'حركة خفيفة أو تمرين 1-3 أيام' },
  { value: 'moderate', label: 'متوسط', factor: 1.55, hint: 'تمرين منتظم 3-5 أيام' },
  { value: 'active', label: 'عالي', factor: 1.725, hint: 'نشاط كبير أو تمرين شبه يومي' },
]

export const GOAL_OPTIONS = [
  { value: 'cut', label: 'تنشيف', delta: -0.18, description: 'خفض تدريجي مع الحفاظ على العضلات.' },
  { value: 'loss', label: 'خسارة وزن', delta: -0.22, description: 'عجز أوضح لخفض الوزن بشكل ثابت.' },
  { value: 'bulk', label: 'زيادة وزن', delta: 0.12, description: 'فائض محسوب لدعم بناء الكتلة.' },
  { value: 'maintain', label: 'ثبات', delta: 0, description: 'الحفاظ على الوزن الحالي مع توازن.' },
]

export const GENDER_OPTIONS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
]

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'إفطار' },
  { value: 'lunch', label: 'غداء' },
  { value: 'dinner', label: 'عشاء' },
  { value: 'snack', label: 'سناك' },
]

const BASE_FOODS = [
  { id: 'egg', name: 'بيض مسلوق', barcode: '1001', calories: 78, protein: 6, carbs: 1, fat: 5, serving: 'بيضة' },
  { id: 'oats', name: 'شوفان', barcode: '1002', calories: 150, protein: 5, carbs: 27, fat: 3, serving: '40 جم' },
  { id: 'banana', name: 'موز', barcode: '1003', calories: 105, protein: 1, carbs: 27, fat: 0, serving: 'ثمرة' },
  { id: 'chicken', name: 'صدر دجاج مشوي', barcode: '1004', calories: 165, protein: 31, carbs: 0, fat: 4, serving: '100 جم' },
  { id: 'rice', name: 'أرز أبيض مطبوخ', barcode: '1005', calories: 205, protein: 4, carbs: 45, fat: 0, serving: 'كوب' },
  { id: 'bread', name: 'عيش بلدي', barcode: '1006', calories: 170, protein: 6, carbs: 35, fat: 1, serving: 'رغيف' },
  { id: 'yogurt', name: 'زبادي يوناني', barcode: '1007', calories: 100, protein: 10, carbs: 6, fat: 3, serving: 'علبة' },
  { id: 'tuna', name: 'تونة بالماء', barcode: '1008', calories: 120, protein: 26, carbs: 0, fat: 1, serving: 'علبة' },
  { id: 'apple', name: 'تفاح', barcode: '1009', calories: 95, protein: 0, carbs: 25, fat: 0, serving: 'ثمرة' },
  { id: 'almonds', name: 'لوز', barcode: '1010', calories: 170, protein: 6, carbs: 6, fat: 15, serving: '30 جم' },
  { id: 'milk', name: 'حليب قليل الدسم', barcode: '1011', calories: 102, protein: 8, carbs: 12, fat: 2, serving: 'كوب' },
  { id: 'peanut', name: 'زبدة فول سوداني', barcode: '1012', calories: 190, protein: 8, carbs: 7, fat: 16, serving: 'ملعقتان' },
  { id: 'salad', name: 'سلطة خضراء', barcode: '1013', calories: 45, protein: 2, carbs: 8, fat: 1, serving: 'طبق' },
  { id: 'salmon', name: 'سلمون مشوي', barcode: '1014', calories: 208, protein: 22, carbs: 0, fat: 13, serving: '100 جم' },
  { id: 'potato', name: 'بطاطس مشوية', barcode: '1015', calories: 160, protein: 4, carbs: 37, fat: 0, serving: 'حبة متوسطة' },
]

export const FOOD_DATABASE = [...BASE_FOODS, ...EXTRA_FOODS]

export function clampNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeNumber(value, digits = 1) {
  const n = clampNumber(value)
  return Number(n.toFixed(digits))
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
  const proteinFactor = goal === 'bulk' ? 1.9 : 2.0
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

export function formatCalories(value) {
  return `${Math.round(clampNumber(value))} سعرة`
}

export function getLatestWeight(weightEntries, fallback = '') {
  if (!Array.isArray(weightEntries) || weightEntries.length === 0) return fallback
  return weightEntries[0]?.weight ?? fallback
}

export function getFoodByBarcode(barcode) {
  return FOOD_DATABASE.find((item) => String(item.barcode) === String(barcode).trim()) ?? null
}

export function searchFoods(query) {
  const term = String(query || '').trim().toLowerCase()
  if (!term) return FOOD_DATABASE.slice(0, 8)
  return FOOD_DATABASE.filter((item) => item.name.toLowerCase().includes(term) || item.barcode.includes(term)).slice(0, 8)
}

export function buildMealEntry(food, mealType = 'snack', quantity = 1, note = '') {
  const count = Math.max(1, clampNumber(quantity, 1))
  return {
    id: `${food.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    mealType,
    foodId: food.id,
    name: food.name,
    barcode: food.barcode,
    calories: Math.round(food.calories * count),
    protein: Math.round(food.protein * count),
    carbs: Math.round(food.carbs * count),
    fat: Math.round(food.fat * count),
    quantity: count,
    serving: food.serving,
    note: String(note || '').trim(),
  }
}

export function groupMealsByType(entries = []) {
  return MEAL_TYPES.reduce((acc, meal) => {
    acc[meal.value] = entries.filter((entry) => entry.mealType === meal.value)
    return acc
  }, {})
}

export function sumMealCalories(entries = []) {
  return entries.reduce((sum, entry) => sum + clampNumber(entry.calories), 0)
}

export function sumMacros(entries = []) {
  return entries.reduce(
    (totals, entry) => ({
      protein: totals.protein + clampNumber(entry.protein),
      carbs: totals.carbs + clampNumber(entry.carbs),
      fat: totals.fat + clampNumber(entry.fat),
    }),
    { protein: 0, carbs: 0, fat: 0 },
  )
}

export function makeSeriesFromEntries(entries = [], key = 'weight') {
  return entries
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((entry) => ({
      date: entry.date,
      value: clampNumber(entry[key]),
    }))
}
