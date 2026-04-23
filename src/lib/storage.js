const PREFIX = 'glowup-fitness'

function hasWindow() {
  return typeof window !== 'undefined'
}

function readJSON(key, fallback) {
  if (!hasWindow()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
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
  const next = [entry, ...current].slice(0, 100)
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
  const next = [entry, ...current].slice(0, 100)
  saveWaterEntries(userId, next)
  return next
}
