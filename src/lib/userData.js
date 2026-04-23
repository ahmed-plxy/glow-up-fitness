const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const getDateKey = () => new Date().toISOString().slice(0, 10)

const profileKey = (userId) => `glow-profile-${userId}`
const weightKey = (userId) => `glow-weight-log-${userId}`
const waterKey = (userId) => `glow-water-log-${userId}`

const sortByDate = (entries) => [...entries].sort((a, b) => String(a.date).localeCompare(String(b.date)))

export function loadProfile(userId, fallbackProfile) {
  if (!canUseStorage || !userId) return fallbackProfile
  return safeParse(window.localStorage.getItem(profileKey(userId)), fallbackProfile)
}

export function saveProfile(userId, profile) {
  if (!canUseStorage || !userId) return
  window.localStorage.setItem(profileKey(userId), JSON.stringify(profile))
}

export function loadWeightLog(userId) {
  if (!canUseStorage || !userId) return []
  return safeParse(window.localStorage.getItem(weightKey(userId)), [])
}

export function saveWeightLog(userId, entries) {
  if (!canUseStorage || !userId) return
  window.localStorage.setItem(weightKey(userId), JSON.stringify(sortByDate(entries)))
}

export function addWeightEntry(userId, weight, date = getDateKey()) {
  const next = loadWeightLog(userId)
  next.push({ date, weight: Number(weight) })
  saveWeightLog(userId, next)
  return sortByDate(next)
}

export function loadWaterLog(userId) {
  if (!canUseStorage || !userId) return []
  return safeParse(window.localStorage.getItem(waterKey(userId)), [])
}

export function saveWaterLog(userId, entries) {
  if (!canUseStorage || !userId) return
  window.localStorage.setItem(waterKey(userId), JSON.stringify(sortByDate(entries)))
}

export function addWaterIntake(userId, amount, date = getDateKey()) {
  const next = loadWaterLog(userId)
  const existing = next.find((entry) => entry.date === date)
  if (existing) {
    existing.amount += Number(amount)
  } else {
    next.push({ date, amount: Number(amount) })
  }
  saveWaterLog(userId, next)
  return sortByDate(next)
}

export function resetWaterToday(userId, date = getDateKey()) {
  const next = loadWaterLog(userId).filter((entry) => entry.date !== date)
  saveWaterLog(userId, next)
  return sortByDate(next)
}
