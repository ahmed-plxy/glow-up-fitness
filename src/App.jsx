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

const STORAGE_KEY = 'glow-up-fitness-v3'
const SETTINGS_KEY = 'glow-up-fitness-settings-v3'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', ar: 'خامل', en: 'Sedentary', factor: 1.2 },
  { value: 'moderate', ar: 'متوسط', en: 'Moderate', factor: 1.55 },
  { value: 'athletic', ar: 'رياضي', en: 'Athletic', factor: 1.725 },
]

const GOALS = [
  { value: 'lose', ar: 'خسارة وزن', en: 'Lose weight', adjust: -300, accent: 'from-emerald-400 to-green-500' },
  { value: 'maintain', ar: 'ثبات', en: 'Maintain', adjust: 0, accent: 'from-sky-400 to-cyan-500' },
  { value: 'gain', ar: 'زيادة عضلية', en: 'Gain muscle', adjust: 250, accent: 'from-orange-400 to-amber-500' },
]

const QUICK_MEALS = [
  { id: 'q1', ar: 'سموزي الطاقة', en: 'Power smoothie', calories: 420, protein: 28, carbs: 48, fat: 12 },
  { id: 'q2', ar: 'وجبة الغداء', en: 'Lunch bowl', calories: 760, protein: 45, carbs: 78, fat: 24 },
  { id: 'q3', ar: 'سناك المكسرات', en: 'Nut snack', calories: 230, protein: 8, carbs: 10, fat: 18 },
]

const DEFAULT_PROFILE = {
  name: 'Glow User',
  gender: 'male',
  age: 27,
  height: 178,
  weight: 78,
  goalWeight: 84,
  activity: 'moderate',
  goal: 'maintain',
}

const DEFAULT_MACROS = {
  protein: 170,
  carbs: 260,
  fat: 70,
}

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

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num))
}

function round(num) {
  return Math.round(Number(num) || 0)
}

function getBmr(profile) {
  const weight = Number(profile.weight)
  const height = Number(profile.height)
  const age = Number(profile.age)
  const base = 10 * weight + 6.25 * height - 5 * age
  return profile.gender === 'female' ? base - 161 : base + 5
}

function getGoal(profileGoal) {
  return GOALS.find((goal) => goal.value === profileGoal) ?? GOALS[1]
}

function getActivity(value) {
  return ACTIVITY_LEVELS.find((level) => level.value === value) ?? ACTIVITY_LEVELS[1]
}

function loadState() {
  const stored = loadJson(STORAGE_KEY, null)
  if (!stored) {
    const seedDate = todayKey()
    return {
      profile: DEFAULT_PROFILE,
      macros: DEFAULT_MACROS,
      meals: [],
      weights: [{ id: makeId(), date: seedDate, weight: 78 }],
      water: [{ id: makeId(), date: seedDate, amount: 300 }],
      theme: 'dark',
    }
  }

  return {
    profile: { ...DEFAULT_PROFILE, ...(stored.profile ?? {}) },
    macros: { ...DEFAULT_MACROS, ...(stored.macros ?? {}) },
    meals: Array.isArray(stored.meals) ? stored.meals : [],
    weights: Array.isArray(stored.weights) ? stored.weights : [],
    water: Array.isArray(stored.water) ? stored.water : [],
    theme: stored.theme === 'light' ? 'light' : 'dark',
  }
}

const translations = {
  ar: {
    nav: {
      brand: 'Glow Up',
      home: 'الرئيسية',
      features: 'المميزات',
      goal: 'الهدف',
      dashboard: 'لوحة التحكم',
      progress: 'التقدم',
      guides: 'النصائح',
      faq: 'الأسئلة',
      cta: 'ابدأ الآن',
    },
    hero: {
      badge: 'منصة فيتنس عربية / إنجليزية بتجربة كاملة',
      title: 'موقع أكبر، أهدى، وأقرب لبراند حقيقي',
      description:
        'Glow Up اتبني كصفحة كاملة فيها هوية، أقسام، أدوات ذكية، وتتبّع يومي يخلّي الفكرة تبان احترافية بدل ما تكون مجرد شاشة أرقام.',
      primary: 'استكشف الموقع',
      secondary: 'افتح اللوحة',
      stat1: 'هدف يومي ذكي',
      stat2: 'تتبع أسبوعي',
      stat3: 'لغة كاملة',
      highlight: 'الموقع دلوقتي فيه روح أكتر ومرتب على شكل تجربة حقيقية مش مجرد أداة.',
    },
    sectionLabels: {
      features: 'المميزات',
      goal: 'نظام الهدف',
      dashboard: 'اللوحة العملية',
      progress: 'التقدم الأسبوعي',
      guides: 'دليل سريع',
      faq: 'الأسئلة الشائعة',
    },
    features: {
      title: 'أقسام بتدي إحساس موقع مكتمل',
      description: 'كل جزء له دور واضح، وكل كارت بيدعم الفكرة بدل ما يكون حشو بصري.',
      items: [
        ['واجهة ثنائية اللغة', 'كل الموقع بيتبدل عربي/إنجليزي بالكامل بدون خلط.'],
        ['Navbar وFooter محترمين', 'الصفحة بقت منظمة وأسهل في التصفح.'],
        ['حسابات ذكية', 'BMR وTDEE والأهداف اليومية يتحسبوا تلقائيًا.'],
        ['حفظ محلي', 'البيانات تفضل محفوظة داخل المتصفح.'],
      ],
    },
    goal: {
      title: 'نظام الهدف',
      description: 'اختيارك هنا يغيّر السعرات والاتجاه العام للبرنامج.',
      profile: 'البروفايل',
      name: 'الاسم',
      age: 'العمر',
      height: 'الطول (سم)',
      weight: 'الوزن (كجم)',
      goalWeight: 'الوزن المستهدف',
      gender: 'النوع',
      activity: 'النشاط',
      goal: 'الهدف',
      save: 'حفظ البروفايل',
      mode: 'الوضع الحالي',
      weightGoal: 'الوزن المستهدف',
      caloriesTarget: 'السعرات المستهدفة',
      waterGoal: 'الماء اليومي',
      statusText: 'النظام يوازن لك اليوم بناءً على بياناتك.',
    },
    dashboard: {
      title: 'لوحة التحكم العملية',
      description: 'تسجيل سريع + حذف + تعديل + متابعة مباشرة من نفس المكان.',
      calorieSummary: 'السعرات اليوم',
      remaining: 'المتبقي',
      macros: 'الماكروز',
      addMeal: 'إضافة وجبة',
      mealName: 'اسم الوجبة',
      calories: 'سعرات',
      protein: 'بروتين',
      carbs: 'كارب',
      fat: 'دهون',
      quickAdd: 'إضافة سريعة',
      customMeal: 'إضافة مخصصة',
      mealHistory: 'سجل الوجبات',
      edit: 'تعديل',
      remove: 'حذف',
      reset: 'تصفير البيانات',
      water: 'الماء',
      addWater: 'أضف كوب ماء',
      waterStatus: 'أكواب اليوم',
      feedback: 'تنبيه ذكي',
      feedbackA: 'أنت قريب من الهدف اليوم.',
      feedbackB: 'السعرات عالية شوية، راجع الوجبة الجاية.',
      feedbackC: 'لسه في مساحة مناسبة لوجبة إضافية.',
      editMode: 'تعديل الوجبة',
      updateMeal: 'تحديث الوجبة',
      cancel: 'إلغاء',
      weightLog: 'سجل الوزن',
      addWeight: 'إضافة وزن',
      editWeight: 'تعديل',
      updateWeight: 'تحديث الوزن',
    },
    progress: {
      title: 'التقدم الأسبوعي',
      description: 'شوف اتجاه الوزن والسعرات والماء في آخر 7 أيام.',
      legend1: 'الوزن',
      legend2: 'السعرات',
      legend3: 'الماء (لتر)',
      empty: 'لسه مفيش بيانات كفاية — ابدأ وسجّل حاجة النهاردة.',
      trend: 'الاتجاه',
    },
    guides: {
      title: 'دليل سريع يدي للموقع روح',
      items: [
        ['ابدأ بهدف واحد', 'اختار خسارة أو زيادة أو ثبات، وبعدها خليك ثابت أسبوعين على الأقل.'],
        ['سجّل يومك بسرعة', 'إضافة وجبات صغيرة أفضل من ترك اليوم بلا متابعة.'],
        ['راقب الماء', 'الترطيب بيأثر على الأداء والإحساس العام.'],
        ['شوف الاتجاه', 'الأهم مش رقم يوم واحد، لكن المسار الأسبوعي كله.'],
      ],
    },
    faq: {
      title: 'أسئلة سريعة',
      items: [
        ['هل البيانات بتتحفظ؟', 'أيوه، كلها بتتحفظ محليًا داخل المتصفح.'],
        ['هل ينفع أبدل اللغة؟', 'أيوه، الصفحة كلها بتتبدل عربي / إنجليزي.'],
        ['هل أقدر أعدل البيانات؟', 'أيوه، الوجبات والوزن والماء قابلين للتعديل أو الحذف.'],
      ],
    },
    footer: {
      note: 'Glow Up بقى أقرب لمنتج حقيقي: أقسام منظمة، هوية واضحة، وتجربة استخدام أريح.',
      links: 'روابط سريعة',
      tech: 'الخصائص',
      rights: 'جميع الحقوق محفوظة',
    },
  },
  en: {
    nav: {
      brand: 'Glow Up',
      home: 'Home',
      features: 'Features',
      goal: 'Goal',
      dashboard: 'Dashboard',
      progress: 'Progress',
      guides: 'Guides',
      faq: 'FAQ',
      cta: 'Get Started',
    },
    hero: {
      badge: 'A bilingual fitness experience with a complete site structure',
      title: 'A bigger, calmer site that feels like a real brand',
      description:
        'Glow Up is now shaped like a full product page with identity, sections, smart tools, and daily tracking — not just a plain dashboard screen.',
      primary: 'Explore the site',
      secondary: 'Open dashboard',
      stat1: 'Smart daily goal',
      stat2: 'Weekly tracking',
      stat3: 'Full language switch',
      highlight: 'The site now feels more alive, with a structure that reads like a real experience.',
    },
    sectionLabels: {
      features: 'Features',
      goal: 'Goal system',
      dashboard: 'Practical dashboard',
      progress: 'Weekly progress',
      guides: 'Quick guides',
      faq: 'FAQ',
    },
    features: {
      title: 'Sections that make it feel like a complete product',
      description: 'Each block has a clear role and supports the idea instead of filling space.',
      items: [
        ['Full bilingual UI', 'The entire app switches between Arabic and English with no mixed text.'],
        ['Proper navbar and footer', 'The page is now organized and easier to navigate.'],
        ['Smart calculations', 'BMR, TDEE, and daily goals are calculated automatically.'],
        ['Local storage', 'Your data stays in the browser and loads again instantly.'],
      ],
    },
    goal: {
      title: 'Goal system',
      description: 'Your choice adjusts calories and the overall direction of the plan.',
      profile: 'Profile',
      name: 'Name',
      age: 'Age',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      goalWeight: 'Goal weight',
      gender: 'Gender',
      activity: 'Activity',
      goal: 'Goal',
      save: 'Save profile',
      mode: 'Current mode',
      weightGoal: 'Target weight',
      caloriesTarget: 'Target calories',
      waterGoal: 'Daily water',
      statusText: 'The system balances your day based on the information you enter.',
    },
    dashboard: {
      title: 'Practical dashboard',
      description: 'Quick add, edit, delete, and live tracking all in one place.',
      calorieSummary: 'Calories today',
      remaining: 'Remaining',
      macros: 'Macros',
      addMeal: 'Add meal',
      mealName: 'Meal name',
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fat: 'Fat',
      quickAdd: 'Quick add',
      customMeal: 'Custom meal',
      mealHistory: 'Meal history',
      edit: 'Edit',
      remove: 'Delete',
      reset: 'Reset data',
      water: 'Water',
      addWater: 'Add water cup',
      waterStatus: 'Today cups',
      feedback: 'Smart feedback',
      feedbackA: 'You are close to today’s target.',
      feedbackB: 'Calories are a bit high — check the next meal.',
      feedbackC: 'There is still room for one clean meal.',
      editMode: 'Edit meal',
      updateMeal: 'Update meal',
      cancel: 'Cancel',
      weightLog: 'Weight log',
      addWeight: 'Add weight',
      editWeight: 'Edit',
      updateWeight: 'Update weight',
    },
    progress: {
      title: 'Weekly progress',
      description: 'See weight, calories, and water trends across the last 7 days.',
      legend1: 'Weight',
      legend2: 'Calories',
      legend3: 'Water (L)',
      empty: 'Not enough data yet — add something today and the chart will come alive.',
      trend: 'Trend',
    },
    guides: {
      title: 'Quick guides that add soul',
      items: [
        ['Start with one goal', 'Pick lose, gain, or maintain, then stay consistent for at least two weeks.'],
        ['Log quickly', 'Small meal entries are better than leaving the day untracked.'],
        ['Track water', 'Hydration affects performance and how you feel overall.'],
        ['Watch the trend', 'One day is noise; the weekly direction is what matters.'],
      ],
    },
    faq: {
      title: 'Quick answers',
      items: [
        ['Is data saved?', 'Yes — everything is saved locally in the browser.'],
        ['Can I change the language?', 'Yes — the whole interface switches between Arabic and English.'],
        ['Can I edit data?', 'Yes — meals, weight, and water entries can be edited or deleted.'],
      ],
    },
    footer: {
      note: 'Glow Up now feels like a real product: organized sections, clear identity, and a smoother user experience.',
      links: 'Quick links',
      tech: 'Capabilities',
      rights: 'All rights reserved',
    },
  },
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function StatCard({ value, label, theme }) {
  return (
    <div className={`rounded-3xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white shadow-sm'}`}>
      <div className="text-2xl font-black text-brand-primary">{value}</div>
      <div className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>{label}</div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description, lang, theme }) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-bold uppercase tracking-[0.35em] text-brand-primary">{eyebrow}</div>
      <h2 className={`mt-3 text-3xl font-black sm:text-4xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <p className={`mt-4 text-sm leading-7 sm:text-base ${theme === 'dark' ? 'text-white/65' : 'text-slate-600'}`}>{description}</p>
    </div>
  )
}

function Pill({ children, active, onClick, theme, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${className} ${
        active
          ? 'bg-brand-primary text-black shadow-lg shadow-orange-500/20'
          : theme === 'dark'
            ? 'border border-white/10 bg-white/5 text-white/75 hover:border-brand-primary/40 hover:text-white'
            : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-primary/40 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function ProgressBar({ label, value, max, theme, suffix = '' }) {
  const percent = max > 0 ? clamp((value / max) * 100, 0, 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={theme === 'dark' ? 'text-white/75' : 'text-slate-700'}>{label}</span>
        <span className={theme === 'dark' ? 'text-white/55' : 'text-slate-500'}>{round(value)} / {round(max)}{suffix}</span>
      </div>
      <div className={`h-3 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
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
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'ar'
    return loadJson(SETTINGS_KEY, { lang: 'ar' }).lang === 'en' ? 'en' : 'ar'
  })
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
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ lang, theme: state.theme }))
  }, [lang, state.theme])

  useEffect(() => {
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = state.theme
    document.body.dataset.theme = state.theme
    document.title = lang === 'ar' ? 'Glow Up Fitness | عربي / English' : 'Glow Up Fitness | Arabic / English'
  }, [lang, state.theme])

  const t = translations[lang]
  const goal = getGoal(state.profile.goal)
  const activity = getActivity(state.profile.activity)
  const bmr = useMemo(() => round(getBmr(state.profile)), [state.profile])
  const tdee = useMemo(() => round(bmr * activity.factor), [bmr, activity.factor])
  const targetCalories = useMemo(() => round(tdee + goal.adjust), [tdee, goal.adjust])
  const waterGoal = useMemo(() => round(Math.max(2000, Number(state.profile.weight) * 35)), [state.profile.weight])

  const consumed = useMemo(
    () =>
      state.meals.reduce(
        (acc, meal) => ({
          calories: acc.calories + safeNumber(meal.calories),
          protein: acc.protein + safeNumber(meal.protein),
          carbs: acc.carbs + safeNumber(meal.carbs),
          fat: acc.fat + safeNumber(meal.fat),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [state.meals],
  )

  const waterToday = useMemo(
    () => state.water.filter((entry) => entry.date === todayKey()).reduce((sum, entry) => sum + safeNumber(entry.amount), 0),
    [state.water],
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
    if (calorieGap < -150) return t.dashboard.feedbackB
    if (calorieGap > 300) return t.dashboard.feedbackC
    return t.dashboard.feedbackA
  }, [consumed.calories, t.dashboard.feedbackA, t.dashboard.feedbackB, t.dashboard.feedbackC, targetCalories])

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
          date: todayKey(),
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
      date: todayKey(),
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
      weights: [{ id: makeId(), date: todayKey(), weight }, ...prev.weights],
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
      water: [{ id: makeId(), date: todayKey(), amount }, ...prev.water],
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
      theme: state.theme,
    })
    setEditingMealId(null)
    setEditingWeightId(null)
    setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '' })
    setWeightInput('')
  }

  const setProfileField = (field, value) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }))
  }

  const sectionIds = [
    { id: 'home', label: t.nav.home },
    { id: 'features', label: t.nav.features },
    { id: 'goal', label: t.nav.goal },
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'progress', label: t.nav.progress },
    { id: 'guides', label: t.nav.guides },
    { id: 'faq', label: t.nav.faq },
  ]

  const pageShell = state.theme === 'dark'
    ? 'bg-[#0b0f14] text-white'
    : 'bg-[#f5f7fb] text-slate-900'

  const cardShell = state.theme === 'dark'
    ? 'border-white/10 bg-white/5 text-white shadow-glass'
    : 'border-slate-200 bg-white text-slate-900 shadow-sm'

  const mutedText = state.theme === 'dark' ? 'text-white/65' : 'text-slate-600'
  const strongText = state.theme === 'dark' ? 'text-white' : 'text-slate-900'
  const lineCard = state.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'
  const inputShell = state.theme === 'dark'
    ? 'border-white/10 bg-black/30 text-white placeholder:text-white/35'
    : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'

  return (
    <div className={`${pageShell} min-h-screen transition-colors duration-300`}>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className={`sticky top-3 z-50 rounded-[1.75rem] border px-4 py-3 backdrop-blur-xl ${cardShell}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black tracking-tight text-brand-primary">{t.nav.brand}</div>
                <div className={`text-xs uppercase tracking-[0.3em] ${mutedText}`}>{lang === 'ar' ? 'Fitness experience' : 'Fitness experience'}</div>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <Pill theme={state.theme} active={lang === 'ar'} onClick={() => setLang('ar')}>AR</Pill>
                <Pill theme={state.theme} active={lang === 'en'} onClick={() => setLang('en')}>EN</Pill>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {sectionIds.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`rounded-full px-3 py-2 transition ${state.theme === 'dark' ? 'text-white/75 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${state.theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
              >
                {state.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <div className="hidden items-center gap-2 lg:flex">
                <Pill theme={state.theme} active={lang === 'ar'} onClick={() => setLang('ar')}>AR</Pill>
                <Pill theme={state.theme} active={lang === 'en'} onClick={() => setLang('en')}>EN</Pill>
              </div>
              <a href="#dashboard" className="rounded-full bg-brand-primary px-4 py-2 text-sm font-bold text-black transition hover:opacity-90">
                {t.nav.cta}
              </a>
            </div>
          </div>
        </header>

        <main className="mt-5 space-y-5 lg:mt-6 lg:space-y-6">
          <section id="home" className={`grid gap-5 rounded-[2rem] border p-6 sm:p-8 lg:grid-cols-[1.25fr_0.85fr] ${cardShell}`}>
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 text-xs font-bold text-brand-primary">
                {t.hero.badge}
              </div>
              <div>
                <h1 className={`max-w-3xl text-4xl font-black leading-tight sm:text-5xl ${strongText}`}>
                  {t.hero.title}
                </h1>
                <p className={`mt-5 max-w-2xl text-base leading-8 sm:text-lg ${mutedText}`}>{t.hero.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#features" className="rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90">
                  {t.hero.primary}
                </a>
                <a
                  href="#dashboard"
                  className={`rounded-full border px-5 py-3 text-sm font-bold transition ${state.theme === 'dark' ? 'border-white/10 bg-white/5 text-white hover:border-brand-primary/30' : 'border-slate-200 bg-white text-slate-800 hover:border-brand-primary/30'}`}
                >
                  {t.hero.secondary}
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  [t.hero.stat1, targetCalories],
                  [t.hero.stat2, `${weeklyData.filter((d) => d.weight !== null).length}/7`],
                  [t.hero.stat3, 'AR / EN'],
                ].map(([label, value]) => (
                  <StatCard key={label} value={value} label={label} theme={state.theme} />
                ))}
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-5 ${state.theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.28em] text-brand-primary">Glow Up</div>
                  <h2 className={`mt-2 text-2xl font-black ${strongText}`}>{lang === 'ar' ? 'موقع فيه روح وترتيب' : 'A site with soul and structure'}</h2>
                </div>
                <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-xs font-bold text-brand-primary">
                  {lang === 'ar' ? 'Live' : 'Live'}
                </div>
              </div>
              <div className={`mt-5 rounded-[1.5rem] p-5 ${state.theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                <div className={`text-sm leading-7 ${mutedText}`}>{t.hero.highlight}</div>
                <div className={`mt-5 grid gap-3 text-sm ${mutedText}`}>
                  <div>• {lang === 'ar' ? 'Navbar واضح + أقسام مرتبة' : 'Clear navbar + structured sections'}</div>
                  <div>• {lang === 'ar' ? 'تبديل لغة كامل' : 'Full language switch'}</div>
                  <div>• {lang === 'ar' ? 'مظهر احترافي أسهل في العرض' : 'Presentation-ready polished look'}</div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className={`rounded-[2rem] border p-6 sm:p-8 ${cardShell}`}>
            <SectionHeading
              eyebrow={t.nav.features}
              title={t.features.title}
              description={t.features.description}
              lang={lang}
              theme={state.theme}
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {t.features.items.map(([title, desc]) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -4 }}
                  className={`rounded-[1.5rem] border p-5 ${lineCard}`}
                >
                  <div className="text-lg font-bold">{title}</div>
                  <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="goal" className={`grid gap-5 rounded-[2rem] border p-6 sm:p-8 xl:grid-cols-[1.05fr_0.95fr] ${cardShell}`}>
            <div>
              <SectionHeading
                eyebrow={t.nav.goal}
                title={t.goal.title}
                description={t.goal.description}
                lang={lang}
                theme={state.theme}
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className={`rounded-[1.5rem] border p-4 ${lineCard}`}>
                  <div className={`text-sm ${mutedText}`}>{t.goal.mode}</div>
                  <div className="mt-2 text-2xl font-black text-brand-primary">{lang === 'ar' ? goal.ar : goal.en}</div>
                </div>
                <div className={`rounded-[1.5rem] border p-4 ${lineCard}`}>
                  <div className={`text-sm ${mutedText}`}>{t.goal.caloriesTarget}</div>
                  <div className="mt-2 text-2xl font-black text-brand-primary">{targetCalories}</div>
                </div>
                <div className={`rounded-[1.5rem] border p-4 ${lineCard}`}>
                  <div className={`text-sm ${mutedText}`}>{t.goal.waterGoal}</div>
                  <div className="mt-2 text-2xl font-black text-brand-primary">{waterGoal} ml</div>
                </div>
                <div className={`rounded-[1.5rem] border p-4 ${lineCard}`}>
                  <div className={`text-sm ${mutedText}`}>{t.goal.weightGoal}</div>
                  <div className="mt-2 text-2xl font-black text-brand-primary">{state.profile.goalWeight} kg</div>
                </div>
              </div>
              <div className={`mt-5 rounded-[1.5rem] border p-4 ${lineCard}`}>
                <div className={`text-sm leading-7 ${mutedText}`}>{t.goal.statusText}</div>
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.28em] text-brand-primary">{t.goal.profile}</div>
                  <div className={`mt-1 text-2xl font-black ${strongText}`}>{t.goal.profile}</div>
                </div>
                <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-xs font-bold text-brand-primary">
                  {round(bmr)} kcal
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t.goal.name}</label>
                  <input className={`input ${inputShell}`} value={state.profile.name} onChange={(e) => setProfileField('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t.goal.gender}</label>
                  <select className={`input ${inputShell}`} value={state.profile.gender} onChange={(e) => setProfileField('gender', e.target.value)}>
                    <option value="male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                    <option value="female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{t.goal.age}</label>
                  <input type="number" className={`input ${inputShell}`} value={state.profile.age} onChange={(e) => setProfileField('age', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t.goal.activity}</label>
                  <select className={`input ${inputShell}`} value={state.profile.activity} onChange={(e) => setProfileField('activity', e.target.value)}>
                    {ACTIVITY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>{lang === 'ar' ? level.ar : level.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t.goal.height}</label>
                  <input type="number" className={`input ${inputShell}`} value={state.profile.height} onChange={(e) => setProfileField('height', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t.goal.weight}</label>
                  <input type="number" className={`input ${inputShell}`} value={state.profile.weight} onChange={(e) => setProfileField('weight', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t.goal.goalWeight}</label>
                  <input type="number" className={`input ${inputShell}`} value={state.profile.goalWeight} onChange={(e) => setProfileField('goalWeight', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t.goal.goal}</label>
                  <select className={`input ${inputShell}`} value={state.profile.goal} onChange={(e) => setProfileField('goal', e.target.value)}>
                    {GOALS.map((item) => (
                      <option key={item.value} value={item.value}>{lang === 'ar' ? item.ar : item.en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={saveProfile} className="rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90">
                  {t.goal.save}
                </button>
                <button type="button" onClick={() => setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))} className={`rounded-full border px-5 py-3 text-sm font-bold transition ${state.theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  {state.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              </div>
            </div>
          </section>

          <section id="dashboard" className={`rounded-[2rem] border p-6 sm:p-8 ${cardShell}`}>
            <SectionHeading
              eyebrow={t.nav.dashboard}
              title={t.dashboard.title}
              description={t.dashboard.description}
              lang={lang}
              theme={state.theme}
            />

            <div className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-brand-primary/20 bg-brand-primary/10 p-4">
                      <div className="text-sm text-brand-primary">{t.dashboard.calorieSummary}</div>
                      <div className={`mt-2 text-3xl font-black ${strongText}`}>{consumed.calories}</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 p-4">
                      <div className={`text-sm ${mutedText}`}>{t.dashboard.remaining}</div>
                      <div className="mt-2 text-3xl font-black text-brand-primary">{targetCalories - consumed.calories}</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 p-4">
                      <div className={`text-sm ${mutedText}`}>{t.dashboard.water}</div>
                      <div className="mt-2 text-3xl font-black text-brand-primary">{round(waterToday / 250)}</div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-4">
                    <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.macros}</div>
                    <ProgressBar label={t.dashboard.protein} value={consumed.protein} max={state.macros.protein} theme={state.theme} suffix="g" />
                    <ProgressBar label={t.dashboard.carbs} value={consumed.carbs} max={state.macros.carbs} theme={state.theme} suffix="g" />
                    <ProgressBar label={t.dashboard.fat} value={consumed.fat} max={state.macros.fat} theme={state.theme} suffix="g" />
                  </div>
                </div>

                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.quickAdd}</div>
                      <div className={`mt-1 text-xl font-black ${strongText}`}>{t.dashboard.addMeal}</div>
                    </div>
                    <button type="button" onClick={resetAll} className={`rounded-full px-4 py-2 text-sm font-bold transition ${state.theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                      {t.dashboard.reset}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {QUICK_MEALS.map((meal) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => applyQuickMeal(meal)}
                        className={`rounded-[1.25rem] border p-4 text-left transition hover:-translate-y-0.5 ${state.theme === 'dark' ? 'border-white/10 bg-white/5 hover:border-brand-primary/30' : 'border-slate-200 bg-white hover:border-brand-primary/30'}`}
                      >
                        <div className="font-bold">{lang === 'ar' ? meal.ar : meal.en}</div>
                        <div className={`mt-2 text-sm ${mutedText}`}>{meal.calories} kcal • {meal.protein}P</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.customMeal}</div>
                      <div className={`mt-1 text-xl font-black ${strongText}`}>{editingMealId ? t.dashboard.editMode : t.dashboard.customMeal}</div>
                    </div>
                    {editingMealId && (
                      <button type="button" onClick={() => { setEditingMealId(null); setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '' }) }} className={`rounded-full px-4 py-2 text-sm font-bold transition ${state.theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800'}`}>
                        {t.dashboard.cancel}
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleMealSubmit} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <input className={`input ${inputShell} xl:col-span-2`} placeholder={t.dashboard.mealName} value={mealForm.name} onChange={(e) => setMealForm((prev) => ({ ...prev, name: e.target.value }))} />
                    <input type="number" className={`input ${inputShell}`} placeholder={t.dashboard.calories} value={mealForm.calories} onChange={(e) => setMealForm((prev) => ({ ...prev, calories: e.target.value }))} />
                    <input type="number" className={`input ${inputShell}`} placeholder={t.dashboard.protein} value={mealForm.protein} onChange={(e) => setMealForm((prev) => ({ ...prev, protein: e.target.value }))} />
                    <input type="number" className={`input ${inputShell}`} placeholder={t.dashboard.carbs} value={mealForm.carbs} onChange={(e) => setMealForm((prev) => ({ ...prev, carbs: e.target.value }))} />
                    <input type="number" className={`input ${inputShell}`} placeholder={t.dashboard.fat} value={mealForm.fat} onChange={(e) => setMealForm((prev) => ({ ...prev, fat: e.target.value }))} />
                    <button type="submit" className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90 xl:col-span-5">
                      {editingMealId ? t.dashboard.updateMeal : t.dashboard.addMeal}
                    </button>
                  </form>
                </div>

                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.water}</div>
                      <div className={`mt-1 text-xl font-black ${strongText}`}>{t.dashboard.waterStatus}: {round(waterToday / 250)}</div>
                    </div>
                    <div className={`rounded-2xl border px-3 py-2 text-xs font-bold ${state.theme === 'dark' ? 'border-white/10 bg-white/5 text-white/70' : 'border-slate-200 bg-white text-slate-600'}`}>
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
                    {state.water.filter((entry) => entry.date === todayKey()).slice(0, 6).map((entry) => (
                      <div key={entry.id} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${state.theme === 'dark' ? 'border-white/10 bg-white/5 text-white/75' : 'border-slate-200 bg-white text-slate-700'}`}>
                        <span>{entry.amount} ml</span>
                        <button type="button" onClick={() => removeWater(entry.id)} className="font-bold text-brand-primary">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.feedback}</div>
                      <div className={`mt-1 text-xl font-black ${strongText}`}>{feedback}</div>
                    </div>
                    <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-xs font-bold text-brand-primary">
                      {round(getBmr(state.profile))} / {tdee}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className={`rounded-2xl border p-4 ${state.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
                      <div className={`text-sm ${mutedText}`}>{t.dashboard.remaining}</div>
                      <div className="mt-1 text-3xl font-black text-brand-primary">{targetCalories - consumed.calories}</div>
                    </div>
                    <div className={`rounded-2xl border p-4 ${state.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
                      <div className={`text-sm ${mutedText}`}>{t.goal.weightGoal}</div>
                      <div className="mt-1 text-3xl font-black text-brand-primary">{state.profile.goalWeight} kg</div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.weightLog}</div>
                      <div className={`mt-1 text-xl font-black ${strongText}`}>{lang === 'ar' ? 'سجل الوزن' : 'Weight log'}</div>
                    </div>
                    <div className={`rounded-2xl border px-3 py-2 text-xs font-bold ${state.theme === 'dark' ? 'border-white/10 bg-white/5 text-white/70' : 'border-slate-200 bg-white text-slate-600'}`}>
                      {weightLatest} kg
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <input type="number" className={`input ${inputShell} max-w-[180px]`} placeholder={t.dashboard.addWeight} value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
                    <button type="button" onClick={editingWeightId ? saveEditedWeight : addWeight} className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-black transition hover:opacity-90">
                      {editingWeightId ? t.dashboard.updateWeight : t.dashboard.addWeight}
                    </button>
                    {editingWeightId && (
                      <button type="button" onClick={() => { setEditingWeightId(null); setWeightInput('') }} className={`rounded-2xl border px-5 py-3 text-sm font-bold transition ${state.theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                        {t.dashboard.cancel}
                      </button>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {state.weights.slice(0, 5).map((item) => (
                      <div key={item.id} className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${state.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
                        <div>
                          <div className="font-bold">{item.weight} kg</div>
                          <div className={mutedText}>{formatDate(item.date, lang)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => startEditWeight(item)} className="rounded-full border border-brand-primary/20 px-3 py-1 text-xs font-bold text-brand-primary">{t.dashboard.editWeight}</button>
                          <button type="button" onClick={() => deleteWeight(item.id)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/70">{t.dashboard.remove}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.dashboard.mealHistory}</div>
                  <div className="mt-4 space-y-3">
                    {state.meals.length ? state.meals.slice(0, 6).map((meal) => (
                      <div key={meal.id} className={`rounded-2xl border p-4 ${state.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold">{meal.name}</div>
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
                          <button type="button" onClick={() => startEditMeal(meal)} className="rounded-full border border-brand-primary/20 px-3 py-1 text-xs font-bold text-brand-primary">{t.dashboard.edit}</button>
                          <button type="button" onClick={() => deleteMeal(meal.id)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/70">{t.dashboard.remove}</button>
                        </div>
                      </div>
                    )) : (
                      <div className={`rounded-2xl border border-dashed p-6 text-sm ${mutedText}`}>{lang === 'ar' ? 'لسه مفيش وجبات مسجلة.' : 'No meals have been logged yet.'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="progress" className={`rounded-[2rem] border p-6 sm:p-8 ${cardShell}`}>
            <SectionHeading
              eyebrow={t.nav.progress}
              title={t.progress.title}
              description={t.progress.description}
              lang={lang}
              theme={state.theme}
            />
            <div className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className={`rounded-[1.75rem] border p-4 ${lineCard}`}>
                {weeklyData.every((item) => item.weight === null && item.calories === 0 && item.water === 0) ? (
                  <div className={`flex min-h-[360px] items-center justify-center rounded-[1.5rem] border border-dashed ${state.theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'} p-6 text-center ${mutedText}`}>
                    {t.progress.empty}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={state.theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.10)'} />
                      <XAxis dataKey="label" tick={{ fill: state.theme === 'dark' ? '#ffffff99' : '#475569', fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fill: state.theme === 'dark' ? '#ffffff99' : '#475569', fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: state.theme === 'dark' ? '#ffffff99' : '#475569', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: state.theme === 'dark' ? '#111827' : '#ffffff',
                          border: state.theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.08)',
                          borderRadius: 20,
                          color: state.theme === 'dark' ? '#fff' : '#0f172a',
                        }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#FF8C00" strokeWidth={3} dot={{ r: 4 }} name={t.progress.legend1} connectNulls />
                      <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} name={t.progress.legend2} />
                      <Line yAxisId="right" type="monotone" dataKey="water" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} name={t.progress.legend3} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid gap-4">
                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.progress.trend}</div>
                  <div className="mt-2 text-3xl font-black text-brand-primary">{trend > 0 ? '+' : ''}{trend.toFixed(1)} kg</div>
                  <div className={`mt-3 text-sm leading-7 ${mutedText}`}>{lang === 'ar' ? 'الاتجاه محسوب من أول وزن مسجل لآخر وزن مسجل.' : 'Trend is calculated from the earliest to the latest recorded weight.'}</div>
                </div>
                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.progress.legend1}</div>
                  <div className="mt-2 text-3xl font-black text-brand-primary">{weightLatest} kg</div>
                  <div className={`mt-3 text-sm leading-7 ${mutedText}`}>{lang === 'ar' ? 'أحدث وزن موجود في السجل.' : 'The latest weight in the log.'}</div>
                </div>
                <div className={`rounded-[1.75rem] border p-5 ${lineCard}`}>
                  <div className={`text-sm font-bold uppercase tracking-[0.25em] ${mutedText}`}>{t.progress.legend3}</div>
                  <div className="mt-2 text-3xl font-black text-brand-primary">{(waterToday / 1000).toFixed(1)} L</div>
                  <div className={`mt-3 text-sm leading-7 ${mutedText}`}>{lang === 'ar' ? 'الماء المسجل اليوم فقط.' : 'Water recorded today only.'}</div>
                </div>
              </div>
            </div>
          </section>

          <section id="guides" className={`rounded-[2rem] border p-6 sm:p-8 ${cardShell}`}>
            <SectionHeading
              eyebrow={t.nav.guides}
              title={t.guides.title}
              description={lang === 'ar' ? 'نصوص قصيرة تضيف إحساس محتوى حقيقي بدل شاشة أرقام فقط.' : 'Short content blocks that add real-life soul to the site.'}
              lang={lang}
              theme={state.theme}
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {t.guides.items.map(([title, text]) => (
                <div key={title} className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                  <div className="text-lg font-bold">{title}</div>
                  <div className={`mt-3 text-sm leading-7 ${mutedText}`}>{text}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className={`rounded-[2rem] border p-6 sm:p-8 ${cardShell}`}>
            <SectionHeading
              eyebrow={t.nav.faq}
              title={t.faq.title}
              description={lang === 'ar' ? 'أجوبة بسيطة توضح للمستخدم الفكرة بسرعة.' : 'Simple answers that help the user understand the product quickly.'}
              lang={lang}
              theme={state.theme}
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {t.faq.items.map(([q, a]) => (
                <div key={q} className={`rounded-[1.5rem] border p-5 ${lineCard}`}>
                  <div className="text-lg font-bold">{q}</div>
                  <div className={`mt-3 text-sm leading-7 ${mutedText}`}>{a}</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className={`mt-6 rounded-[2rem] border p-6 sm:p-8 ${cardShell}`}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <div className="text-2xl font-black text-brand-primary">{t.nav.brand}</div>
              <p className={`mt-3 max-w-md text-sm leading-7 ${mutedText}`}>{t.footer.note}</p>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-white/45">{t.footer.links}</div>
              <div className="mt-4 grid gap-2 text-sm">
                {sectionIds.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={`transition hover:text-brand-primary ${state.theme === 'dark' ? 'text-white/75' : 'text-slate-700'}`}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-white/45">{t.footer.tech}</div>
              <div className={`mt-4 grid gap-2 text-sm ${state.theme === 'dark' ? 'text-white/75' : 'text-slate-700'}`}>
                <span>Responsive layout</span>
                <span>AR / EN interface</span>
                <span>Local persistence</span>
                <span>Dark / Light mode</span>
              </div>
            </div>
          </div>

          <div className={`mt-8 flex flex-col gap-3 border-t pt-5 text-sm ${state.theme === 'dark' ? 'border-white/10 text-white/60' : 'border-slate-200 text-slate-500'} sm:flex-row sm:items-center sm:justify-between`}>
            <div>© 2026 Glow Up — {t.footer.rights}</div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))} className="font-semibold text-brand-primary transition hover:opacity-80">
                {lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              </button>
              <button type="button" onClick={() => setState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${state.theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                {state.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
