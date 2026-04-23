const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export const activityLevels = [
  { value: 'خامل', label: 'خامل', factor: 1.2 },
  { value: 'متوسط', label: 'متوسط', factor: 1.55 },
  { value: 'رياضي', label: 'رياضي', factor: 1.725 },
]

export const goals = [
  { value: 'تنشيف', label: 'تنشيف', factor: 0.85 },
  { value: 'ضخامة', label: 'ضخامة', factor: 1.12 },
  { value: 'خسارة وزن', label: 'خسارة وزن', factor: 0.8 },
]

export const genders = [
  { value: 'ذكر', label: 'ذكر' },
  { value: 'أنثى', label: 'أنثى' },
]

export function getDefaultProfile(user) {
  return {
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    age: 24,
    weight: 78,
    height: 175,
    gender: 'ذكر',
    activity: 'متوسط',
    goal: 'تنشيف',
  }
}

export function loadProfile(userId, fallbackProfile) {
  if (!canUseStorage || !userId) return fallbackProfile
  return safeParse(window.localStorage.getItem(`glow-profile-${userId}`), fallbackProfile)
}

export function saveProfile(userId, profile) {
  if (!canUseStorage || !userId) return
  window.localStorage.setItem(`glow-profile-${userId}`, JSON.stringify(profile))
}

export function loadWeightLog(userId) {
  if (!canUseStorage || !userId) return []
  return safeParse(window.localStorage.getItem(`glow-weight-log-${userId}`), [])
}

export function saveWeightLog(userId, entries) {
  if (!canUseStorage || !userId) return
  window.localStorage.setItem(`glow-weight-log-${userId}`, JSON.stringify(entries))
}

export function addWeightEntry(userId, weight, date = todayKey()) {
  const next = loadWeightLog(userId)
  next.push({ date, weight: Number(weight) })
  saveWeightLog(userId, next)
  return next
}

export function loadWaterLog(userId) {
  if (!canUseStorage || !userId) return []
  return safeParse(window.localStorage.getItem(`glow-water-log-${userId}`), [])
}

export function saveWaterLog(userId, entries) {
  if (!canUseStorage || !userId) return
  window.localStorage.setItem(`glow-water-log-${userId}`, JSON.stringify(entries))
}

export function addWaterIntake(userId, amount, date = todayKey()) {
  const next = loadWaterLog(userId)
  const existing = next.find((entry) => entry.date === date)
  if (existing) {
    existing.amount += Number(amount)
  } else {
    next.push({ date, amount: Number(amount) })
  }
  saveWaterLog(userId, next)
  return next
}

export function resetWaterToday(userId, date = todayKey()) {
  const next = loadWaterLog(userId).filter((entry) => entry.date !== date)
  saveWaterLog(userId, next)
  return next
}

export function getLatestWeight(profileWeight, weightLog) {
  if (weightLog?.length) {
    return weightLog[weightLog.length - 1].weight
  }
  return Number(profileWeight) || 0
}

export function calculateBmr({ weight, height, age, gender }) {
  const safeWeight = Number(weight) || 0
  const safeHeight = Number(height) || 0
  const safeAge = Number(age) || 0
  const base = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge
  return Math.round(base + (gender === 'أنثى' ? -161 : 5))
}

export function calculateTdee(profile) {
  const bmr = calculateBmr(profile)
  const activity = activityLevels.find((item) => item.value === profile.activity) || activityLevels[1]
  return Math.round(bmr * activity.factor)
}

export function calculateTargetCalories(profile) {
  const tdee = calculateTdee(profile)
  const goal = goals.find((item) => item.value === profile.goal) || goals[0]
  return Math.round(tdee * goal.factor)
}

export function calculateMacros(profile) {
  const weight = Number(profile.weight) || 0
  const calories = calculateTargetCalories(profile)
  const proteinPerKg = profile.goal === 'ضخامة' ? 1.8 : 2.2
  const fatPerKg = 0.8

  const protein = Math.round(weight * proteinPerKg)
  const fat = Math.round(weight * fatPerKg)
  const proteinCalories = protein * 4
  const fatCalories = fat * 9
  const carbs = Math.max(0, Math.round((calories - proteinCalories - fatCalories) / 4))

  return { protein, fat, carbs }
}

export function calculateWaterNeed(profile) {
  const weight = Number(profile.weight) || 0
  const age = Number(profile.age) || 0
  let amount = weight * 35

  if (profile.gender === 'ذكر') amount *= 1.05
  if (profile.gender === 'أنثى') amount *= 0.98

  const activity = activityLevels.find((item) => item.value === profile.activity)?.factor || 1.2
  amount *= activity >= 1.725 ? 1.12 : activity >= 1.55 ? 1.07 : 1

  if (age < 18) amount *= 1.08
  if (age > 55) amount *= 0.95

  return Math.round(amount)
}

export function buildWeightSeries(entries, span = 7) {
  const now = new Date()
  const dates = []
  const sorted = [...entries].sort((a, b) => String(a.date).localeCompare(String(b.date)))

  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }

  return dates.map((date) => {
    const item = [...sorted].reverse().find((entry) => entry.date <= date)
    return {
      date,
      الوزن: item?.weight ?? null,
    }
  })
}

export function buildWaterSeries(entries, span = 7) {
  const now = new Date()
  const dates = []
  const sorted = [...entries].sort((a, b) => String(a.date).localeCompare(String(b.date)))

  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }

  return dates.map((date) => {
    const item = sorted.find((entry) => entry.date === date)
    return {
      date,
      الماء: item?.amount ?? 0,
    }
  })
}

export function formatArabicNumber(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  return new Intl.NumberFormat('ar-EG').format(number)
}

export function formatShortDate(dateString) {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}
