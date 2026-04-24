const PREFIX = 'glowup-fitness'

function hasWindow() {
  return typeof window !== 'undefined'
}

function normalizeFallback(parsed, fallback) {
  if (parsed === null || parsed === undefined) return fallback
  if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed : fallback
  if (fallback && typeof fallback === "object") {
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback
  }
  return parsed
}

function readJSON(key, fallback) {
  if (!hasWindow()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return normalizeFallback(parsed, fallback)
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  if (!hasWindow()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getTheme() {
  if (!hasWindow()) return 'dark'
  return window.localStorage.getItem(`${PREFIX}:theme`) || 'dark'
}

export function setTheme(theme) {
  if (!hasWindow()) return
  window.localStorage.setItem(`${PREFIX}:theme`, theme)
}

export function getProfileKey(userId) {
  return `${PREFIX}:profile:${userId}`
}

export function getWeightKey(userId) {
  return `${PREFIX}:weights:${userId}`
}

export function getWaterKey(userId) {
  return `${PREFIX}:water:${userId}`
}

export function getMealsKey(userId) {
  return `${PREFIX}:meals:${userId}`
}

export function getOnboardingKey(userId) {
  return `${PREFIX}:onboarding:${userId}`
}

export function getSettingsKey(userId) {
  return `${PREFIX}:settings:${userId}`
}

export function loadProfile(userId, fallback = {}) {
  return readJSON(getProfileKey(userId), fallback)
}

export function saveProfile(userId, profile) {
  writeJSON(getProfileKey(userId), profile)
}

export function loadWeightEntries(userId) {
  return readJSON(getWeightKey(userId), [])
}

export function saveWeightEntries(userId, entries) {
  writeJSON(getWeightKey(userId), entries)
}

export function appendWeightEntry(userId, entry) {
  const current = loadWeightEntries(userId)
  const next = [entry, ...current].slice(0, 120)
  saveWeightEntries(userId, next)
  return next
}

export function loadWaterEntries(userId) {
  return readJSON(getWaterKey(userId), [])
}

export function saveWaterEntries(userId, entries) {
  writeJSON(getWaterKey(userId), entries)
}

export function appendWaterEntry(userId, entry) {
  const current = loadWaterEntries(userId)
  const next = [entry, ...current].slice(0, 120)
  saveWaterEntries(userId, next)
  return next
}

export function loadMealEntries(userId) {
  return readJSON(getMealsKey(userId), [])
}

export function saveMealEntries(userId, entries) {
  writeJSON(getMealsKey(userId), entries)
}

export function appendMealEntry(userId, entry) {
  const current = loadMealEntries(userId)
  const next = [entry, ...current].slice(0, 200)
  saveMealEntries(userId, next)
  return next
}

export function removeMealEntry(userId, id) {
  const current = loadMealEntries(userId)
  const next = current.filter((item) => item.id !== id)
  saveMealEntries(userId, next)
  return next
}

export function loadOnboardingState(userId, fallback = null) {
  return readJSON(getOnboardingKey(userId), fallback)
}

export function saveOnboardingState(userId, state) {
  writeJSON(getOnboardingKey(userId), state)
}

export function loadSettings(userId, fallback = {}) {
  return readJSON(getSettingsKey(userId), fallback)
}

export function saveSettings(userId, settings) {
  writeJSON(getSettingsKey(userId), settings)
}
