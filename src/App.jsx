import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const STORAGE_KEY = 'glow-up-fitness-data-v4'
const LEGACY_STORAGE_KEY = 'glow-up-fitness-v3'
const SETTINGS_KEY = 'glow-up-fitness-settings-v4'
const LEGACY_SETTINGS_KEY = 'glow-up-fitness-settings-v3'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', ar: 'قليل جدًا', en: 'Sedentary', factor: 1.2 },
  { value: 'moderate', ar: 'متوسط', en: 'Moderate', factor: 1.55 },
  { value: 'athletic', ar: 'عالي', en: 'Athletic', factor: 1.725 },
]

const GOALS = [
  { value: 'lose', ar: 'خسارة وزن', en: 'Lose weight', adjust: -300 },
  { value: 'maintain', ar: 'ثبات', en: 'Maintain', adjust: 0 },
  { value: 'gain', ar: 'زيادة عضلية', en: 'Gain muscle', adjust: 250 },
]

const QUICK_MEALS = [
  { id: 'q1', ar: 'سموزي بروتين', en: 'Protein smoothie', calories: 420, protein: 28, carbs: 48, fat: 12 },
  { id: 'q2', ar: 'وجبة غداء', en: 'Lunch bowl', calories: 760, protein: 45, carbs: 78, fat: 24 },
  { id: 'q3', ar: 'سناك خفيف', en: 'Light snack', calories: 230, protein: 8, carbs: 10, fat: 18 },
]

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

const PAGE_ORDER = ['home', 'dashboard', 'progress', 'settings']

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function formatDate(dateKey, lang) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function loadJson(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round(value) {
  return Math.round(Number(value) || 0)
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getBmr(profile) {
  const weight = Number(profile.weight)
  const height = Number(profile.height)
  const age = Number(profile.age)
  const base = 10 * weight + 6.25 * height - 5 * age
  return profile.gender === 'female' ? base - 161 : base + 5
}

function getGoal(goalValue) {
  return GOALS.find((goal) => goal.value === goalValue) ?? GOALS[1]
}

function getActivity(activityValue) {
  return ACTIVITY_LEVELS.find((level) => level.value === activityValue) ?? ACTIVITY_LEVELS[1]
}

function loadState() {
  const stored = loadJson(STORAGE_KEY, loadJson(LEGACY_STORAGE_KEY, null))

  if (!stored) {
    const seedDate = todayKey()
    return {
      profile: DEFAULT_PROFILE,
      macros: DEFAULT_MACROS,
      meals: [],
      weights: [{ id: makeId(), date: seedDate, weight: DEFAULT_PROFILE.weight }],
      water: [{ id: makeId(), date: seedDate, amount: 300 }],
    }
  }

  return {
    profile: { ...DEFAULT_PROFILE, ...(stored.profile ?? {}) },
    macros: { ...DEFAULT_MACROS, ...(stored.macros ?? {}) },
    meals: Array.isArray(stored.meals) ? stored.meals : [],
    weights: Array.isArray(stored.weights) ? stored.weights : [],
    water: Array.isArray(stored.water) ? stored.water : [],
  }
}

const translations = {
  ar: {
    nav: {
      brand: 'Glow Up',
      home: 'الرئيسية',
      dashboard: 'لوحة التحكم',
      progress: 'التقدم',
      settings: 'الإعدادات',
      cta: 'ابدأ الآن',
    },
    hero: {
      badge: 'منصة عربية / إنجليزية لتتبع اللياقة بشكل عملي',
      title: 'موقع أنظف، أخف، ومقسّم بطريقة تفهمها بسرعة',
      description:
        'الصفحة الأساسية هنا تقدم الفكرة بوضوح، واللوحة تتولى كل الأدوات اليومية: تسجيل الوجبات، الماء، الوزن، والاتجاه الأسبوعي — بدون زحمة أو كلام زائد.',
      primary: 'استعرض الصفحة',
      secondary: 'افتح اللوحة',
      stats: [
        ['هدف يومي', 'حسابات ذكية'],
        ['تتبع أسبوعي', 'اتجاه واضح'],
        ['لغة كاملة', 'AR / EN'],
      ],
    },
    home: {
      title: 'كيف يستخدمه الزائر؟',
      description: 'ثلاث خطوات فقط توصل المستخدم للفكرة مباشرة من غير ما يتوه وسط عناصر شكلية.',
      cards: [
        ['اختر الهدف', 'خسارة، ثبات، أو زيادة حسب احتياجك الحقيقي.'],
        ['سجّل يومك', 'وجبات، ماء، ووزن من مكان واحد.'],
        ['راقب الاتجاه', 'شوف الأسبوع كله بدل رقم يوم واحد.'],
      ],
    },
    dashboard: {
      title: 'لوحة التحكم',
      description: 'المكان الفعلي لإدارة البيانات اليومية والتعديل عليها بسرعة.',
      caloriesToday: 'سعرات اليوم',
      remaining: 'المتبقي',
      waterToday: 'أكواب الماء',
      macros: 'الماكروز',
      protein: 'بروتين',
      carbs: 'كارب',
      fat: 'دهون',
      quickAdd: 'إضافة سريعة',
      customMeal: 'وجبة مخصصة',
      mealName: 'اسم الوجبة',
      addMeal: 'إضافة وجبة',
      updateMeal: 'تحديث الوجبة',
      cancel: 'إلغاء',
      mealHistory: 'الوجبات المسجلة',
      edit: 'تعديل',
      remove: 'حذف',
      reset: 'تصفير',
      water: 'الماء',
      addWater: 'إضافة كوب',
      weightLog: 'سجل الوزن',
      addWeight: 'إضافة وزن',
      updateWeight: 'تحديث الوزن',
      smartNote: 'تنبيه سريع',
      noteA: 'أنت قريب جدًا من الهدف اليوم.',
      noteB: 'السعرات أعلى من الخطة قليلًا، راجع الوجبة التالية.',
      noteC: 'لسه عندك مساحة جيدة لوجبة إضافية.',
      emptyMeals: 'لا توجد وجبات مسجلة بعد.',
    },
    progress: {
      title: 'التقدم الأسبوعي',
      description: 'عرض مبسط لاتجاه الوزن والسعرات والماء خلال آخر 7 أيام.',
      trend: 'الاتجاه العام',
      latestWeight: 'آخر وزن',
      todayWater: 'ماء اليوم',
      empty: 'لا توجد بيانات كافية بعد — أضف شيئًا اليوم.',
      weight: 'الوزن',
      calories: 'السعرات',
      water: 'الماء (لتر)',
    },
    settings: {
      title: 'الإعدادات والملف الشخصي',
      description: 'الملف هنا منفصل عن المحتوى الرئيسي، وفيه الهدف والبيانات الأساسية فقط.',
      name: 'الاسم',
      gender: 'النوع',
      age: 'العمر',
      height: 'الطول (سم)',
      weight: 'الوزن (كجم)',
      goalWeight: 'الوزن المستهدف',
      activity: 'النشاط',
      goal: 'الهدف',
      save: 'حفظ البيانات',
      theme: 'المظهر',
      language: 'اللغة',
      profileCard: 'ملخص سريع',
      caloriesTarget: 'السعرات المستهدفة',
      waterTarget: 'الماء اليومي',
      bmr: 'معدل الحرق',
      tdee: 'الاحتياج اليومي',
    },
    footer: {
      note: 'Glow Up مبني كتجربة واضحة: أقسام قليلة ومفيدة، ولوحة فعّالة، وصفحة رئيسية أخف.',
      rights: 'جميع الحقوق محفوظة',
    },
  },
  en: {
    nav: {
      brand: 'Glow Up',
      home: 'Home',
      dashboard: 'Dashboard',
      progress: 'Progress',
      settings: 'Settings',
      cta: 'Get started',
    },
    hero: {
      badge: 'A bilingual fitness platform with a clear structure',
      title: 'A cleaner site, lighter layout, and faster understanding',
      description:
        'The home page explains the idea fast, while the dashboard handles the daily work: meals, water, weight, and weekly direction — without visual noise.',
      primary: 'Explore home',
      secondary: 'Open dashboard',
      stats: [
        ['Daily target', 'Smart calculations'],
        ['Weekly view', 'Clear direction'],
        ['Full language', 'AR / EN'],
      ],
    },
    home: {
      title: 'How a visitor uses it',
      description: 'Three simple steps that make the product understandable right away.',
      cards: [
        ['Pick a goal', 'Lose, maintain, or gain according to your real needs.'],
        ['Log your day', 'Meals, water, and weight in one place.'],
        ['Watch the trend', 'See the week instead of one noisy day.'],
      ],
    },
    dashboard: {
      title: 'Dashboard',
      description: 'The real place for daily tracking and quick edits.',
      caloriesToday: 'Calories today',
      remaining: 'Remaining',
      waterToday: 'Water cups',
      macros: 'Macros',
      protein: 'Protein',
      carbs: 'Carbs',
      fat: 'Fat',
      quickAdd: 'Quick add',
      customMeal: 'Custom meal',
      mealName: 'Meal name',
      addMeal: 'Add meal',
      updateMeal: 'Update meal',
      cancel: 'Cancel',
      mealHistory: 'Logged meals',
      edit: 'Edit',
      remove: 'Delete',
      reset: 'Reset',
      water: 'Water',
      addWater: 'Add cup',
      weightLog: 'Weight log',
      addWeight: 'Add weight',
      updateWeight: 'Update weight',
      smartNote: 'Quick note',
      noteA: 'You are very close to today’s target.',
      noteB: 'Calories are a little high — review the next meal.',
      noteC: 'There is still room for one more meal.',
      emptyMeals: 'No meals logged yet.',
    },
    progress: {
      title: 'Weekly progress',
      description: 'A simple view of weight, calories, and water over the last 7 days.',
      trend: 'Overall trend',
      latestWeight: 'Latest weight',
      todayWater: 'Today water',
      empty: 'Not enough data yet — add something today.',
      weight: 'Weight',
      calories: 'Calories',
      water: 'Water (L)',
    },
    settings: {
      title: 'Settings and profile',
      description: 'The profile is separated from the main content and contains only the essentials.',
      name: 'Name',
      gender: 'Gender',
      age: 'Age',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      goalWeight: 'Goal weight',
      activity: 'Activity',
      goal: 'Goal',
      save: 'Save data',
      theme: 'Theme',
      language: 'Language',
      profileCard: 'Quick summary',
      caloriesTarget: 'Target calories',
      waterTarget: 'Daily water',
      bmr: 'BMR',
      tdee: 'TDEE',
    },
    footer: {
      note: 'Glow Up is built as a clear experience: fewer sections, more use, and a cleaner main page.',
      rights: 'All rights reserved',
    },
  },
}

function ThemePill({ active, children, onClick, theme }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
        active
          ? 'bg-brand-primary text-black'
          : theme === 'dark'
            ? 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

function SectionHeading({ eyebrow, title, description, theme }) {
  const muted = theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-bold uppercase tracking-[0.35em] text-brand-primary">{eyebrow}</div>
      <h2 className={`mt-3 text-2xl font-black sm:text-3xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <p className={`mt-3 text-sm leading-7 sm:text-base ${muted}`}>{description}</p>
    </div>
  )
}

function MetricCard({ label, value, theme, accent = false }) {
  return (
    <div className={`rounded-3xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white shadow-sm'} ${accent ? 'ring-1 ring-brand-primary/20' : ''}`}>
      <div className={`text-sm ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>{label}</div>
      <div className="mt-2 text-2xl font-black text-brand-primary">{value}</div>
    </div>
  )
}

function ProgressBar({ label, value, max, theme, suffix = '' }) {
  const percent = max > 0 ? clamp((value / max) * 100, 0, 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={theme === 'dark' ? 'text-white/75' : 'text-slate-700'}>{label}</span>
        <span className={theme === 'dark' ? 'text-white/55' : 'text-slate-500'}>
          {round(value)} / {round(max)}
          {suffix}
        </span>
      </div>
      <div className={`h-3 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-primary to-orange-300"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const initialSettings = loadJson(SETTINGS_KEY, loadJson(LEGACY_SETTINGS_KEY, { lang: 'ar', theme: 'dark', page: 'home' }))

  const [lang, setLang] = useState(initialSettings.lang === 'en' ? 'en' : 'ar')
  const [theme, setTheme] = useState(initialSettings.theme === 'light' ? 'light' : 'dark')
  const [page, setPage] = useState(PAGE_ORDER.includes(initialSettings.page) ? initialSettings.page : 'home')
  const [state, setState] = useState(loadState)
  const [editingMealId, setEditingMealId] = useState(null)
  const [editingWeightId, setEditingWeightId] = useState(null)
  const [mealForm, setMealForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' })
  const [weightInput, setWeightInput] = useState('')
  const [waterInput, setWaterInput] = useState('250')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ lang, theme, page }))
  }, [lang, theme, page])

  useEffect(() => {
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    document.title = lang === 'ar' ? 'Glow Up Fitness | عربي / English' : 'Glow Up Fitness | Arabic / English'
  }, [lang, theme])

  const t = translations[lang]
  const goal = getGoal(state.profile.goal)
  const activity = getActivity(state.profile.activity)
  const bmr = useMemo(() => round(getBmr(state.profile)), [state.profile])
  const tdee = useMemo(() => round(bmr * activity.factor), [bmr, activity.factor])
  const targetCalories = useMemo(() => round(tdee + goal.adjust), [tdee, goal.adjust])
  const waterGoal = useMemo(() => round(Math.max(2000, Number(state.profile.weight) * 35)), [state.profile.weight])

  const consumed = useMemo(() => {
    return state.meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + safeNumber(meal.calories),
        protein: acc.protein + safeNumber(meal.protein),
        carbs: acc.carbs + safeNumber(meal.carbs),
        fat: acc.fat + safeNumber(meal.fat),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }, [state.meals])

  const today = todayKey()

  const waterToday = useMemo(
    () => state.water.filter((entry) => entry.date === today).reduce((sum, entry) => sum + safeNumber(entry.amount), 0),
    [state.water, today],
  )

  const weightLatest = useMemo(() => {
    if (!state.weights.length) return Number(state.profile.weight)
    const sorted = [...state.weights].sort((a, b) => new Date(a.date) - new Date(b.date))
    return Number(sorted[sorted.length - 1].weight)
  }, [state.profile.weight, state.weights])

  const weeklyData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = todayKey(date)
      const meals = state.meals.filter((item) => item.date === key)
      const water = state.water.filter((item) => item.date === key)
      const weightPoints = state.weights.filter((item) => item.date === key)
      days.push({
        date: key,
        label: formatDate(key, lang),
        weight: weightPoints.length ? Number(weightPoints[weightPoints.length - 1].weight) : null,
        calories: meals.reduce((sum, item) => sum + safeNumber(item.calories), 0),
        water: water.reduce((sum, item) => sum + safeNumber(item.amount), 0) / 1000,
      })
    }
    return days
  }, [lang, state.meals, state.water, state.weights])

  const trend = useMemo(() => {
    const valid = state.weights.filter((item) => Number.isFinite(Number(item.weight)))
    if (valid.length < 2) return 0
    const sorted = [...valid].sort((a, b) => new Date(a.date) - new Date(b.date))
    return Number(sorted[sorted.length - 1].weight) - Number(sorted[0].weight)
  }, [state.weights])

  const feedback = useMemo(() => {
    const calorieGap = targetCalories - consumed.calories
    if (calorieGap < -150) return t.dashboard.noteB
    if (calorieGap > 300) return t.dashboard.noteC
    return t.dashboard.noteA
  }, [consumed.calories, targetCalories, t.dashboard.noteA, t.dashboard.noteB, t.dashboard.noteC])

  const navigate = (nextPage) => {
    setPage(nextPage)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const applyQuickMeal = (meal) => {
    setState((prev) => ({
      ...prev,
      meals: [
        {
          id: makeId(),
          name: lang === 'ar' ? meal.ar : meal.en,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          date: today,
        },
        ...prev.meals,
      ],
    }))
  }

  const handleMealSubmit = (event) => {
    event.preventDefault()
    const nextMeal = {
      id: editingMealId ?? makeId(),
      name: mealForm.name.trim() || (lang === 'ar' ? 'وجبة مخصصة' : 'Custom meal'),
      calories: round(mealForm.calories),
      protein: round(mealForm.protein),
      carbs: round(mealForm.carbs),
      fat: round(mealForm.fat),
      date: today,
    }

    setState((prev) => {
      const filtered = prev.meals.filter((item) => item.id !== editingMealId)
      return { ...prev, meals: [nextMeal, ...filtered] }
    })

    setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '' })
    setEditingMealId(null)
  }

  const startEditMeal = (meal) => {
    setEditingMealId(meal.id)
    setMealForm({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    })
  }

  const deleteMeal = (id) => {
    setState((prev) => ({ ...prev, meals: prev.meals.filter((item) => item.id !== id) }))
    if (editingMealId === id) {
      setEditingMealId(null)
      setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '' })
    }
  }

  const addWeight = () => {
    const weight = safeNumber(weightInput)
    if (!weight) return
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, weight },
      weights: [{ id: makeId(), date: today, weight }, ...prev.weights],
    }))
    setWeightInput('')
  }

  const startEditWeight = (item) => {
    setEditingWeightId(item.id)
    setWeightInput(String(item.weight))
  }

  const saveEditedWeight = () => {
    const weight = safeNumber(weightInput)
    if (!weight || !editingWeightId) return
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, weight },
      weights: prev.weights.map((item) => (item.id === editingWeightId ? { ...item, weight } : item)),
    }))
    setWeightInput('')
    setEditingWeightId(null)
  }

  const deleteWeight = (id) => {
    setState((prev) => ({ ...prev, weights: prev.weights.filter((item) => item.id !== id) }))
    if (editingWeightId === id) {
      setEditingWeightId(null)
      setWeightInput('')
    }
  }

  const addWater = () => {
    const amount = safeNumber(waterInput, 250)
    if (!amount) return
    setState((prev) => ({
      ...prev,
      water: [{ id: makeId(), date: today, amount }, ...prev.water],
    }))
  }

  const removeWater = (id) => {
    setState((prev) => ({ ...prev, water: prev.water.filter((item) => item.id !== id) }))
  }

  const saveProfile = () => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: prev.profile.name.trim() || (lang === 'ar' ? 'مستخدم Glow Up' : 'Glow Up user'),
        age: clamp(round(prev.profile.age), 14, 99),
        height: clamp(round(prev.profile.height), 120, 230),
        weight: clamp(round(prev.profile.weight), 30, 250),
        goalWeight: clamp(round(prev.profile.goalWeight), 30, 250),
      },
    }))
  }

  const resetAll = () => {
    const seedDate = todayKey()
    setState({
      profile: DEFAULT_PROFILE,
      macros: DEFAULT_MACROS,
      meals: [],
      weights: [{ id: makeId(), date: seedDate, weight: DEFAULT_PROFILE.weight }],
      water: [{ id: makeId(), date: seedDate, amount: 300 }],
    })
    setEditingMealId(null)
    setEditingWeightId(null)
    setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '' })
    setWeightInput('')
  }

  const pageShell = theme === 'dark'
    ? 'bg-[#0b0f14] text-white'
    : 'bg-[#f5f7fb] text-slate-900'

  const cardShell = theme === 'dark'
    ? 'border-white/10 bg-white/5 text-white shadow-glass'
    : 'border-slate-200 bg-white text-slate-900 shadow-sm'

  const lineCard = theme === 'dark'
    ? 'border-white/10 bg-white/5'
    : 'border-slate-200 bg-white'

  const mutedText = theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  const strongText = theme === 'dark' ? 'text-white' : 'text-slate-900'
  const inputShell = theme === 'dark'
    ? 'border-white/10 bg-black/30 text-white placeholder:text-white/35'
    : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'

  const navItems = [
    ['home', t.nav.home],
    ['dashboard', t.nav.dashboard],
    ['progress', t.nav.progress],
    ['settings', t.nav.settings],
  ]

  const mealsToday = state.meals.filter((meal) => meal.date === today)

  return (
    <div className={`${pageShell} min-h-screen transition-colors duration-300`}>
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <header className={`sticky top-3 z-50 rounded-[1.5rem] border px-4 py-3 backdrop-blur-xl ${cardShell}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/15 text-sm font-black text-brand-primary">G</div>
                <div>
                  <div className="text-lg font-black tracking-tight text-brand-primary">{t.nav.brand}</div>
                  <div className={`text-[11px] uppercase tracking-[0.22em] ${mutedText}`}>
                    {lang === 'ar' ? 'fitness tracker' : 'fitness tracker'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <ThemePill active={lang === 'ar'} onClick={() => setLang('ar')} theme={theme}>AR</ThemePill>
                <ThemePill active={lang === 'en'} onClick={() => setLang('en')} theme={theme}>EN</ThemePill>
              </div>
            </div>

            <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
              {navItems.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(key)}
                  className={`whitespace-nowrap rounded-full px-3 py-2 transition ${
                    page === key
                      ? 'bg-brand-primary text-black'
                      : theme === 'dark'
                        ? 'text-white/75 hover:bg-white/5 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`rounded-full px-3 py-2 text-xs font-bold transition sm:text-sm ${
                  theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <div className="hidden items-center gap-2 lg:flex">
                <ThemePill active={lang === 'ar'} onClick={() => setLang('ar')} theme={theme}>AR</ThemePill>
                <ThemePill active={lang === 'en'} onClick={() => setLang('en')} theme={theme}>EN</ThemePill>
              </div>
              <button
                type="button"
                onClick={() => navigate('dashboard')}
                className="rounded-full bg-brand-primary px-4 py-2 text-xs font-bold text-black transition hover:opacity-90 sm:text-sm"
              >
                {t.nav.cta}
              </button>
            </div>
          </div>
        </header>

        <main className="mt-4 space-y-4 lg:mt-6 lg:space-y-6">
          {page === 'home' && (
            <>
              <section className={`grid gap-5 rounded-[1.75rem] border p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] ${cardShell}`}>
                <div className="space-y-5">
                  <div className="inline-flex items-center rounded-full border border-brand-primary/25 bg-brand-primary/10 px-4 py-2 text-xs font-bold text-brand-primary">
                    {t.hero.badge}
                  </div>
                  <div>
                    <h1 className={`max-w-3xl text-3xl font-black leading-tight sm:text-4xl ${strongText}`}>
                      {t.hero.title}
                    </h1>
                    <p className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${mutedText}`}>
                      {t.hero.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('dashboard')}
                      className="rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90"
                    >
                      {t.hero.primary}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('dashboard')}
                      className={`rounded-full border px-5 py-3 text-sm font-bold transition ${
                        theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-white hover:border-brand-primary/30'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-brand-primary/30'
                      }`}
                    >
                      {t.hero.secondary}
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {t.hero.stats.map(([value, label]) => (
                      <MetricCard key={label} label={label} value={value} theme={theme} accent />
                    ))}
                  </div>
                </div>

                <div className={`rounded-[1.5rem] border p-5 ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
                  <div className={`text-xs font-bold uppercase tracking-[0.28em] text-brand-primary`}>
                    {lang === 'ar' ? 'الفكرة الأساسية' : 'Core idea'}
                  </div>
                  <div className={`mt-3 text-xl font-black ${strongText}`}>
                    {lang === 'ar' ? 'صفحة أولى سريعة، ثم أداة حقيقية.' : 'Fast landing page, then a real tool.'}
                  </div>
                  <div className={`mt-4 text-sm leading-7 ${mutedText}`}>
                    {lang === 'ar'
                      ? 'الزائر يفهم الفكرة من أول نظرة، ثم ينتقل مباشرةً إلى اللوحة بدون عناصر زائدة.'
                      : 'The visitor understands the product at a glance, then moves straight into the dashboard without extra clutter.'}
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
                      <div className={`text-sm ${mutedText}`}>{lang === 'ar' ? 'أقسام أقل' : 'Fewer sections'}</div>
                      <div className="mt-1 text-lg font-bold">Home • Dashboard • Progress • Settings</div>
                    </div>
                    <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
                      <div className={`text-sm ${mutedText}`}>{lang === 'ar' ? 'التركيز' : 'Focus'}</div>
                      <div className="mt-1 text-lg font-bold">{lang === 'ar' ? 'الفعل قبل الزينة' : 'Action before decoration'}</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className={`rounded-[1.75rem] border p-5 sm:p-6 ${cardShell}`}>
                <SectionHeading
                  eyebrow={lang === 'ar' ? 'طريقة الاستخدام' : 'How it works'}
                  title={t.home.title}
                  description={t.home.description}
                  theme={theme}
                />
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {t.home.cards.map(([title, desc], index) => (
                    <div key={title} className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                      <div className="text-xs font-black uppercase tracking-[0.25em] text-brand-primary">
                        0{index + 1}
                      </div>
                      <div className="mt-3 text-lg font-bold">{title}</div>
                      <div className={`mt-3 text-sm leading-7 ${mutedText}`}>{desc}</div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {page === 'dashboard' && (
            <section className={`rounded-[1.75rem] border p-5 sm:p-6 ${cardShell}`}>
              <SectionHeading
                eyebrow={t.nav.dashboard}
                title={t.dashboard.title}
                description={t.dashboard.description}
                theme={theme}
              />

              <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5">
                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <MetricCard label={t.dashboard.caloriesToday} value={consumed.calories} theme={theme} accent />
                      <MetricCard label={t.dashboard.remaining} value={targetCalories - consumed.calories} theme={theme} />
                      <MetricCard label={t.dashboard.waterToday} value={Math.round(waterToday / 250)} theme={theme} />
                    </div>
                    <div className="mt-5 space-y-4">
                      <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.macros}</div>
                      <ProgressBar label={t.dashboard.protein} value={consumed.protein} max={state.macros.protein} theme={theme} suffix="g" />
                      <ProgressBar label={t.dashboard.carbs} value={consumed.carbs} max={state.macros.carbs} theme={theme} suffix="g" />
                      <ProgressBar label={t.dashboard.fat} value={consumed.fat} max={state.macros.fat} theme={theme} suffix="g" />
                    </div>
                  </div>

                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.quickAdd}</div>
                        <div className={`mt-1 text-xl font-black ${strongText}`}>{t.dashboard.customMeal}</div>
                      </div>
                      <button
                        type="button"
                        onClick={resetAll}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                          theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {t.dashboard.reset}
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {QUICK_MEALS.map((meal) => (
                        <button
                          key={meal.id}
                          type="button"
                          onClick={() => applyQuickMeal(meal)}
                          className={`rounded-[1.25rem] border p-4 text-left transition hover:-translate-y-0.5 ${
                            theme === 'dark'
                              ? 'border-white/10 bg-white/5 hover:border-brand-primary/30'
                              : 'border-slate-200 bg-white hover:border-brand-primary/30'
                          }`}
                        >
                          <div className="font-bold">{lang === 'ar' ? meal.ar : meal.en}</div>
                          <div className={`mt-2 text-sm ${mutedText}`}>{meal.calories} kcal • {meal.protein}P</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.customMeal}</div>
                        <div className={`mt-1 text-xl font-black ${strongText}`}>
                          {editingMealId ? t.dashboard.updateMeal : t.dashboard.addMeal}
                        </div>
                      </div>
                      {editingMealId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMealId(null)
                            setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '' })
                          }}
                          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                            theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {t.dashboard.cancel}
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleMealSubmit} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <input
                        className={`input ${inputShell} xl:col-span-2`}
                        placeholder={t.dashboard.mealName}
                        value={mealForm.name}
                        onChange={(e) => setMealForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                      <input
                        type="number"
                        className={`input ${inputShell}`}
                        placeholder="kcal"
                        value={mealForm.calories}
                        onChange={(e) => setMealForm((prev) => ({ ...prev, calories: e.target.value }))}
                      />
                      <input
                        type="number"
                        className={`input ${inputShell}`}
                        placeholder={t.dashboard.protein}
                        value={mealForm.protein}
                        onChange={(e) => setMealForm((prev) => ({ ...prev, protein: e.target.value }))}
                      />
                      <input
                        type="number"
                        className={`input ${inputShell}`}
                        placeholder={t.dashboard.carbs}
                        value={mealForm.carbs}
                        onChange={(e) => setMealForm((prev) => ({ ...prev, carbs: e.target.value }))}
                      />
                      <input
                        type="number"
                        className={`input ${inputShell}`}
                        placeholder={t.dashboard.fat}
                        value={mealForm.fat}
                        onChange={(e) => setMealForm((prev) => ({ ...prev, fat: e.target.value }))}
                      />
                      <button type="submit" className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90 xl:col-span-5">
                        {editingMealId ? t.dashboard.updateMeal : t.dashboard.addMeal}
                      </button>
                    </form>
                  </div>

                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.water}</div>
                        <div className={`mt-1 text-xl font-black ${strongText}`}>{Math.round(waterToday / 250)} {lang === 'ar' ? 'كوب' : 'cups'}</div>
                      </div>
                      <div className={`rounded-2xl border px-3 py-2 text-xs font-bold ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/70' : 'border-slate-200 bg-white text-slate-600'}`}>
                        {waterGoal} ml
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <input type="number" className={`input ${inputShell} max-w-[180px]`} value={waterInput} onChange={(e) => setWaterInput(e.target.value)} />
                      <button type="button" onClick={addWater} className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90">
                        {t.dashboard.addWater}
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {state.water
                        .filter((entry) => entry.date === today)
                        .slice(0, 6)
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/75' : 'border-slate-200 bg-white text-slate-700'}`}
                          >
                            <span>{entry.amount} ml</span>
                            <button type="button" onClick={() => removeWater(entry.id)} className="font-bold text-brand-primary">
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.smartNote}</div>
                        <div className={`mt-1 text-xl font-black ${strongText}`}>{feedback}</div>
                      </div>
                      <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-xs font-bold text-brand-primary">
                        {bmr} / {tdee}
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <MetricCard label={t.dashboard.remaining} value={targetCalories - consumed.calories} theme={theme} />
                      <MetricCard label={lang === 'ar' ? 'الوزن المستهدف' : 'Goal weight'} value={`${state.profile.goalWeight} kg`} theme={theme} />
                    </div>
                  </div>

                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.weightLog}</div>
                        <div className={`mt-1 text-xl font-black ${strongText}`}>{weightLatest} kg</div>
                      </div>
                      <div className={`rounded-2xl border px-3 py-2 text-xs font-bold ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/70' : 'border-slate-200 bg-white text-slate-600'}`}>
                        {state.weights.length}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <input
                        type="number"
                        className={`input ${inputShell} max-w-[180px]`}
                        placeholder={t.dashboard.addWeight}
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={editingWeightId ? saveEditedWeight : addWeight}
                        className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90"
                      >
                        {editingWeightId ? t.dashboard.updateWeight : t.dashboard.addWeight}
                      </button>
                      {editingWeightId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWeightId(null)
                            setWeightInput('')
                          }}
                          className={`rounded-2xl border px-5 py-3 text-sm font-bold transition ${
                            theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          {t.dashboard.cancel}
                        </button>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {state.weights.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}
                        >
                          <div>
                            <div className="font-bold">{item.weight} kg</div>
                            <div className={mutedText}>{formatDate(item.date, lang)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => startEditWeight(item)} className="rounded-full border border-brand-primary/20 px-3 py-1 text-xs font-bold text-brand-primary">
                              {t.dashboard.edit}
                            </button>
                            <button type="button" onClick={() => deleteWeight(item.id)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/70">
                              {t.dashboard.remove}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.mealHistory}</div>
                    <div className="mt-4 space-y-3">
                      {mealsToday.length ? mealsToday.map((meal) => (
                        <div
                          key={meal.id}
                          className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-bold">{meal.name}</div>
                              <div className={`mt-1 text-xs ${mutedText}`}>{formatDate(meal.date, lang)}</div>
                            </div>
                            <div className="text-right text-sm font-bold text-brand-primary">{meal.calories} kcal</div>
                          </div>
                          <div className={`mt-3 grid grid-cols-4 gap-2 text-xs ${mutedText}`}>
                            <span>P {meal.protein}</span>
                            <span>C {meal.carbs}</span>
                            <span>F {meal.fat}</span>
                            <span>{meal.date}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => startEditMeal(meal)} className="rounded-full border border-brand-primary/20 px-3 py-1 text-xs font-bold text-brand-primary">
                              {t.dashboard.edit}
                            </button>
                            <button type="button" onClick={() => deleteMeal(meal.id)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/70">
                              {t.dashboard.remove}
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className={`rounded-2xl border border-dashed p-6 text-sm ${mutedText}`}>{t.dashboard.emptyMeals}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === 'progress' && (
            <section className={`rounded-[1.75rem] border p-5 sm:p-6 ${cardShell}`}>
              <SectionHeading
                eyebrow={t.nav.progress}
                title={t.progress.title}
                description={t.progress.description}
                theme={theme}
              />

              <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <div className={`rounded-[1.5rem] border p-4 ${lineCard}`}>
                  {weeklyData.every((item) => item.weight === null && item.calories === 0 && item.water === 0) ? (
                    <div className={`flex min-h-[360px] items-center justify-center rounded-[1.25rem] border border-dashed p-6 text-center ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'} ${mutedText}`}>
                      {t.progress.empty}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.10)'} />
                        <XAxis dataKey="label" tick={{ fill: theme === 'dark' ? '#ffffff99' : '#475569', fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fill: theme === 'dark' ? '#ffffff99' : '#475569', fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: theme === 'dark' ? '#ffffff99' : '#475569', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            background: theme === 'dark' ? '#111827' : '#ffffff',
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.08)',
                            borderRadius: 20,
                            color: theme === 'dark' ? '#fff' : '#0f172a',
                          }}
                        />
                        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#FF8C00" strokeWidth={3} dot={{ r: 4 }} name={t.progress.weight} connectNulls />
                        <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} name={t.progress.calories} />
                        <Line yAxisId="right" type="monotone" dataKey="water" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} name={t.progress.water} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="grid gap-4">
                  <MetricCard label={t.progress.trend} value={`${trend > 0 ? '+' : ''}${trend.toFixed(1)} kg`} theme={theme} accent />
                  <MetricCard label={t.progress.latestWeight} value={`${weightLatest} kg`} theme={theme} />
                  <MetricCard label={t.progress.todayWater} value={`${(waterToday / 1000).toFixed(1)} L`} theme={theme} />
                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className={`text-sm leading-7 ${mutedText}`}>
                      {lang === 'ar'
                        ? 'الرسمة هنا بتوضح الاتجاه من أول بيانات مسجلة لآخر بيانات، وده أوضح من رقم واحد منفصل.'
                        : 'The chart shows direction across the full week, which is more useful than a single isolated number.'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === 'settings' && (
            <section className={`rounded-[1.75rem] border p-5 sm:p-6 ${cardShell}`}>
              <SectionHeading
                eyebrow={t.nav.settings}
                title={t.settings.title}
                description={t.settings.description}
                theme={theme}
              />

              <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">{t.settings.name}</label>
                      <input className={`input ${inputShell}`} value={state.profile.name} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="label">{t.settings.gender}</label>
                      <select className={`input ${inputShell}`} value={state.profile.gender} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, gender: e.target.value } }))}>
                        <option value="male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                        <option value="female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">{t.settings.age}</label>
                      <input type="number" className={`input ${inputShell}`} value={state.profile.age} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, age: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="label">{t.settings.activity}</label>
                      <select className={`input ${inputShell}`} value={state.profile.activity} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, activity: e.target.value } }))}>
                        {ACTIVITY_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>{lang === 'ar' ? level.ar : level.en}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">{t.settings.height}</label>
                      <input type="number" className={`input ${inputShell}`} value={state.profile.height} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, height: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="label">{t.settings.weight}</label>
                      <input type="number" className={`input ${inputShell}`} value={state.profile.weight} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, weight: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="label">{t.settings.goalWeight}</label>
                      <input type="number" className={`input ${inputShell}`} value={state.profile.goalWeight} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, goalWeight: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="label">{t.settings.goal}</label>
                      <select className={`input ${inputShell}`} value={state.profile.goal} onChange={(e) => setState((prev) => ({ ...prev, profile: { ...prev.profile, goal: e.target.value } }))}>
                        {GOALS.map((item) => (
                          <option key={item.value} value={item.value}>{lang === 'ar' ? item.ar : item.en}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={saveProfile} className="rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90">
                      {t.settings.save}
                    </button>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`rounded-full border px-5 py-3 text-sm font-bold transition ${
                        theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
                      className={`rounded-full border px-5 py-3 text-sm font-bold transition ${
                        theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      {lang === 'ar' ? 'EN' : 'AR'}
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className={`text-xs font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.settings.profileCard}</div>
                    <div className={`mt-2 text-2xl font-black ${strongText}`}>{state.profile.name}</div>
                    <div className={`mt-4 grid gap-3 sm:grid-cols-2`}>
                      <MetricCard label={t.settings.bmr} value={bmr} theme={theme} />
                      <MetricCard label={t.settings.tdee} value={tdee} theme={theme} />
                      <MetricCard label={t.settings.caloriesTarget} value={targetCalories} theme={theme} />
                      <MetricCard label={t.settings.waterTarget} value={`${waterGoal} ml`} theme={theme} />
                    </div>
                  </div>

                  <div className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                    <div className={`text-sm leading-7 ${mutedText}`}>
                      {lang === 'ar'
                        ? 'الملف الشخصي هنا منفصل عن المحتوى الرئيسي، والهدف ينعكس على الحسابات مباشرة.'
                        : 'The profile is separate from the main content, and the chosen goal directly affects the calculations.'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className={`mt-4 rounded-[1.5rem] border p-5 sm:p-6 ${cardShell}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-black text-brand-primary">{t.nav.brand}</div>
              <p className={`mt-2 max-w-2xl text-sm leading-7 ${mutedText}`}>{t.footer.note}</p>
            </div>
            <div className={`text-sm ${mutedText}`}>© 2026 — {t.footer.rights}</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
