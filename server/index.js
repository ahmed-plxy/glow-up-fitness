import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'db.json')
const PORT = Number(process.env.PORT || 3001)
const JWT_SECRET = process.env.JWT_SECRET || 'glow-up-dev-secret-change-me'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

const DEFAULT_PROFILE = {
  name: 'Glow User',
  gender: 'male',
  age: 27,
  height: 178,
  weight: 78,
  goalWeight: 74,
  activity: 'moderate',
  goal: 'maintain',
}

const DEFAULT_MACROS = {
  protein: 170,
  carbs: 260,
  fat: 70,
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function createDefaultState() {
  const seedDate = todayKey()
  return {
    profile: { ...DEFAULT_PROFILE },
    macros: { ...DEFAULT_MACROS },
    meals: [],
    weights: [{ id: makeId(), date: seedDate, weight: DEFAULT_PROFILE.weight }],
    water: [{ id: makeId(), date: seedDate, amount: 300 }],
  }
}

async function readDb() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed.users || !Array.isArray(parsed.users)) return { users: [] }
    return parsed
  } catch {
    const fallback = { users: [] }
    await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2), 'utf8')
    return fallback
  }
}

async function writeDb(db) {
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8')
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
}

function stripSensitive(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
}

function normalizeState(state) {
  const defaults = createDefaultState()
  return {
    profile: {
      ...defaults.profile,
      ...(state?.profile ?? {}),
    },
    macros: {
      ...defaults.macros,
      ...(state?.macros ?? {}),
    },
    meals: Array.isArray(state?.meals) ? state.meals : defaults.meals,
    weights: Array.isArray(state?.weights) ? state.weights : defaults.weights,
    water: Array.isArray(state?.water) ? state.water : defaults.water,
  }
}

async function getAuthedUser(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const [, token] = header.split(' ')
    if (!token) {
      return res.status(401).json({ error: 'Missing auth token' })
    }

    const payload = jwt.verify(token, JWT_SECRET)
    const db = await readDb()
    const user = db.users.find((item) => item.id === payload.sub)
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    req.db = db
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'glow-up-backend' })
})

app.post('/auth/signup', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (!name || !email || password.length < 6) {
    return res.status(400).json({ error: 'Please provide a name, a valid email, and a password with at least 6 characters.' })
  }

  const db = await readDb()
  const existing = db.users.find((user) => user.email === email)
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' })
  }

  const user = {
    id: makeId(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
    state: createDefaultState(),
  }

  db.users.push(user)
  await writeDb(db)

  return res.status(201).json({
    token: signToken(user),
    user: stripSensitive(user),
  })
})

app.post('/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const db = await readDb()
  const user = db.users.find((item) => item.email === email)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  return res.json({
    token: signToken(user),
    user: stripSensitive(user),
  })
})

app.get('/auth/me', getAuthedUser, (req, res) => {
  res.json({ user: stripSensitive(req.user) })
})

app.get('/state', getAuthedUser, (req, res) => {
  res.json({ state: normalizeState(req.user.state) })
})

app.put('/state', getAuthedUser, async (req, res) => {
  const db = req.db
  const state = normalizeState(req.body)

  const idx = db.users.findIndex((item) => item.id === req.user.id)
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  db.users[idx] = {
    ...db.users[idx],
    state,
  }

  await writeDb(db)
  res.json({ ok: true, state })
})

app.use((_, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Glow Up backend running on http://localhost:${PORT}`)
})
