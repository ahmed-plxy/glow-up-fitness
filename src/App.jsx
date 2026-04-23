import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'خامل', factor: 1.2 },
  { value: 'moderate', label: 'متوسط', factor: 1.55 },
  { value: 'athletic', label: 'رياضي', factor: 1.725 },
]

const GOALS = [
  { value: 'fast_bulk', label: 'تضخم سريع', adjust: 400 },
  { value: 'lean_bulk', label: 'تضخم عضلي صافي', adjust: 250 },
  { value: 'maintenance', label: 'ثبات', adjust: 0 },
]

const QUICK_MEALS = [
  { name: 'سموزي الطاقة', calories: 420, protein: 28, carbs: 48, fat: 12 },
  { name: 'وجبة الغداء', calories: 760, protein: 45, carbs: 78, fat: 24 },
  { name: 'سناك المكسرات', calories: 230, protein: 8, carbs: 10, fat: 18 },
]

const STORAGE_KEY = 'glow-up-fitness-v1'

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const defaultState = {
  gender: 'male',
  age: 27,
  height: 178,
  weight: 78,
  goalWeight: 84,
  activity: 'moderate',
  goal: 'lean_bulk',
  proteinTarget: 180,
  carbsTarget: 320,
  fatTarget: 75,
  meals: [],
  weights: [],
}

function loadState() {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num))
}

function round(num) {
  return Math.round(num)
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-CA')
}

function addWeightPoint(weight, targetWeight) {
  const now = new Date()
  return {
    date: formatDate(now),
    weight: Number(weight),
    target: Number(targetWeight),
  }
}

function getBmr({ gender, weight, height, age }) {
  const base = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age)
  return gender === 'female' ? base - 161 : base + 5
}

function getSelected(options, value) {
  return options.find((item) => item.value === value) ?? options[0]
}

function MacroBar({ label, current, target }) {
  const percent = target > 0 ? clamp((current / target) * 100, 0, 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="text-white/60">{round(current)} / {round(target)} g</span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-primary to-orange-300"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [weightInput, setWeightInput] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const bmr = useMemo(() => getBmr(state), [state])
  const activity = getSelected(ACTIVITY_LEVELS, state.activity)
  const goal = getSelected(GOALS, state.goal)
  const tdee = useMemo(() => round(bmr * activity.factor), [bmr, activity.factor])
  const targetCalories = useMemo(() => round(tdee + goal.adjust), [tdee, goal.adjust])

  const macroTargets = useMemo(() => {
    const protein = Number(state.proteinTarget)
    const fat = Number(state.fatTarget)
    const carbs = Number(state.carbsTarget)
    return { protein, fat, carbs }
  }, [state.carbsTarget, state.fatTarget, state.proteinTarget])

  const consumed = useMemo(
    () =>
      state.meals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [state.meals],
  )

  const proteinGap = macroTargets.protein - consumed.protein
  const calorieGap = targetCalories - consumed.calories

  const timeline = useMemo(() => {
    const history = state.weights.length ? state.weights : [addWeightPoint(state.weight, state.goalWeight)]
    return history.map((item) => ({
      ...item,
      difference: round(item.weight - item.target),
    }))
  }, [state.goalWeight, state.weight, state.weights])

  useEffect(() => {
    if (proteinGap > 40) {
      setFeedback('أحمد، محتاجين بروتين أكتر عشان البناء.')
    } else if (calorieGap < -150) {
      setFeedback('الوجبات اليوم أعلى من الهدف، حاول توازنها شويّة.')
    } else if (calorieGap > 300) {
      setFeedback('لسّه في مساحة لوجبة إضافية نظيفة.')
    } else {
      setFeedback('الوضع ممتاز، كمل على نفس الإيقاع.')
    }
  }, [proteinGap, calorieGap])

  const onFieldChange = (field) => (event) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value
    setState((prev) => ({ ...prev, [field]: value }))
  }

  const quickAddMeal = (meal) => {
    setState((prev) => ({
      ...prev,
      meals: [...prev.meals, { ...meal, id: makeId(), addedAt: Date.now() }],
    }))
  }

  const addWeight = () => {
    const value = Number(weightInput)
    if (!value || value <= 0) return
    setState((prev) => ({
      ...prev,
      weights: [...prev.weights, addWeightPoint(value, state.goalWeight)],
      weight: value,
    }))
    setWeightInput('')
  }

  const clearAll = () => {
    setState(defaultState)
    setWeightInput('')
  }

  const progressData = [
    { name: 'البروتين', value: clamp((consumed.protein / macroTargets.protein) * 100, 0, 100) },
    { name: 'الكاربوهيدرات', value: clamp((consumed.carbs / macroTargets.carbs) * 100, 0, 100) },
    { name: 'الدهون', value: clamp((consumed.fat / macroTargets.fat) * 100, 0, 100) },
  ]

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-[2rem] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-sm text-brand-cream">
                <span className="h-2 w-2 rounded-full bg-brand-primary" />
                Glow Up Fitness Dashboard
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                  منصة متطورة لمتابعة اللياقة والتحول الجسدي
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
                  حساب دقيق للسعرات، تتبع المغذيات الكبرى، ولوحة تحكم مريحة بتصميم Minimalist Corporate مع لمسة Glassmorphism.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[32rem]">
              <div className="glass rounded-3xl p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">BMR</div>
                <div className="mt-2 text-2xl font-bold">{round(bmr)}</div>
              </div>
              <div className="glass rounded-3xl p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">TDEE</div>
                <div className="mt-2 text-2xl font-bold">{tdee}</div>
              </div>
              <div className="glass rounded-3xl p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Target</div>
                <div className="mt-2 text-2xl font-bold text-brand-primary">{targetCalories}</div>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="mt-6 grid gap-6 xl:grid-cols-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="glass rounded-[2rem] p-6 xl:col-span-4"
          >
            <h2 className="card-title">محرك الحساب الذكي</h2>
            <p className="mt-1 text-sm text-white/60">تعديل القيم يحسب النتائج لحظيًا.</p>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="label">الجنس</label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setState((prev) => ({ ...prev, gender: g }))}
                      className={`rounded-2xl px-4 py-3 text-sm transition ${state.gender === g ? 'bg-brand-primary text-black' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
                    >
                      {g === 'male' ? 'ذكر' : 'أنثى'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">العمر</label>
                  <input className="input" type="number" min="10" max="100" value={state.age} onChange={onFieldChange('age')} />
                </div>
                <div>
                  <label className="label">الطول (سم)</label>
                  <input className="input" type="number" min="100" max="250" value={state.height} onChange={onFieldChange('height')} />
                </div>
                <div>
                  <label className="label">الوزن (كجم)</label>
                  <input className="input" type="number" min="30" max="300" value={state.weight} onChange={onFieldChange('weight')} />
                </div>
                <div>
                  <label className="label">الوزن المستهدف</label>
                  <input className="input" type="number" min="30" max="300" value={state.goalWeight} onChange={onFieldChange('goalWeight')} />
                </div>
              </div>

              <div>
                <label className="label">مستوى النشاط</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {ACTIVITY_LEVELS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setState((prev) => ({ ...prev, activity: item.value }))}
                      className={`rounded-2xl px-3 py-3 text-sm transition ${state.activity === item.value ? 'bg-brand-primary text-black' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">الهدف</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {GOALS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setState((prev) => ({ ...prev, goal: item.value }))}
                      className={`rounded-2xl px-3 py-3 text-sm transition ${state.goal === item.value ? 'bg-brand-primary text-black' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Protein</label>
                  <input className="input" type="number" min="0" max="500" value={state.proteinTarget} onChange={onFieldChange('proteinTarget')} />
                </div>
                <div>
                  <label className="label">Carbs</label>
                  <input className="input" type="number" min="0" max="800" value={state.carbsTarget} onChange={onFieldChange('carbsTarget')} />
                </div>
                <div>
                  <label className="label">Fat</label>
                  <input className="input" type="number" min="0" max="300" value={state.fatTarget} onChange={onFieldChange('fatTarget')} />
                </div>
              </div>

              <button
                onClick={clearAll}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
              >
                إعادة ضبط البيانات
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-[2rem] p-6 xl:col-span-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="card-title">لوحة التحكم</h2>
                <p className="mt-1 text-sm text-white/60">عدادات، إضافة سريعة، ورسالة سياقية ذكية.</p>
              </div>
              <div className="rounded-3xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-sm text-brand-cream">
                {feedback}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="glass rounded-[1.75rem] p-5 lg:col-span-1">
                <div className="text-xs uppercase tracking-[0.25em] text-white/45">Status Card</div>
                <div className="mt-3 text-5xl font-black text-brand-primary">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={targetCalories}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                    >
                      {targetCalories}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p className="mt-2 text-sm text-white/60">kcal كهدف يومي محسوب من BMR + TDEE + الهدف.</p>

                <div className="mt-5 space-y-3 rounded-3xl bg-black/20 p-4">
                  <div className="flex items-center justify-between text-sm text-white/70">
                    <span>السعرات المستهلكة</span>
                    <span>{round(consumed.calories)} / {targetCalories}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-primary to-orange-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${clamp((consumed.calories / targetCalories) * 100, 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>المتبقي</span>
                    <span>{round(calorieGap)} kcal</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[1.75rem] p-5 lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="card-title">Macro Tracker</h3>
                    <p className="text-sm text-white/60">ثلاثة مؤشرات واضحة للبروتين والكاربوهيدرات والدهون.</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
                    Daily balance
                  </div>
                </div>

                <div className="mt-6 grid gap-5">
                  <MacroBar label="البروتين" current={consumed.protein} target={macroTargets.protein} />
                  <MacroBar label="الكربوهيدرات" current={consumed.carbs} target={macroTargets.carbs} />
                  <MacroBar label="الدهون" current={consumed.fat} target={macroTargets.fat} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {QUICK_MEALS.map((meal) => (
                    <button
                      key={meal.name}
                      onClick={() => quickAddMeal(meal)}
                      className="rounded-3xl border border-white/10 bg-white/5 p-4 text-right transition hover:-translate-y-1 hover:bg-white/10"
                    >
                      <div className="font-semibold text-white">{meal.name}</div>
                      <div className="mt-2 text-sm text-white/60">{meal.calories} kcal</div>
                      <div className="mt-2 text-xs text-white/40">
                        P {meal.protein} · C {meal.carbs} · F {meal.fat}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass rounded-[2rem] p-6 xl:col-span-5"
          >
            <h2 className="card-title">نظام المتابعة</h2>
            <p className="mt-1 text-sm text-white/60">إدخال الوزن اليومي أو الأسبوعي وتسجيله محليًا.</p>

            <div className="mt-5 flex gap-3">
              <input
                className="input flex-1"
                type="number"
                min="30"
                max="300"
                placeholder="أدخل الوزن بالكيلو"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
              <button
                onClick={addWeight}
                className="rounded-2xl bg-brand-primary px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                حفظ
              </button>
            </div>

            <div className="mt-5 h-72 rounded-[1.75rem] border border-white/10 bg-black/20 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,.35)" />
                  <YAxis stroke="rgba(255,255,255,.35)" />
                  <Tooltip
                    contentStyle={{ background: '#0B0F14', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#FF8C00" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target" stroke="#F5EBDD" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-[2rem] p-6 xl:col-span-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="card-title">خارطة الطريق</h2>
                <p className="mt-1 text-sm text-white/60">تقدم واضح للنسخة الحالية والمهام القادمة.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
                Responsive 100%
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['1', 'بناء الواجهة', 'React + Tailwind + Glassmorphism'],
                ['2', 'المعادلات', 'BMR / TDEE / Sliders'],
                ['3', 'الحفظ', 'LocalStorage for persistence'],
                ['4', 'التوسعة', 'Charts + favorite meals'],
              ].map(([step, title, desc]) => (
                <div key={step} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="text-sm text-brand-primary">المرحلة {step}</div>
                  <div className="mt-2 text-lg font-semibold">{title}</div>
                  <div className="mt-2 text-sm text-white/60">{desc}</div>
                </div>
              ))}
            </div>
          </motion.section>
        </main>

        <footer className="mt-6 glass rounded-[2rem] px-6 py-5 text-sm text-white/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>جميع الحقوق محفوظة © 2026</div>
            <div className="flex items-center gap-2">
              <span>Developed by</span>
              <a
                href="https://ahmed-plxy.github.io/my-profile/"
                target="_blank"
                rel="noreferrer"
                className="font-extrabold text-brand-primary underline decoration-brand-primary/50 underline-offset-4 transition hover:text-brand-cream"
              >
                Ahmed
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
