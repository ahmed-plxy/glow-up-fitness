import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

const STORAGE_THEME = 'glow-up-theme-v6'
const STORAGE_LANG = 'glow-up-lang-v6'
const STORAGE_PAGE = 'glow-up-page-v6'

const PAGES = ['home', 'dashboard', 'progress', 'settings']

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: { ar: 'قليل جدًا', en: 'Sedentary' }, factor: 1.2 },
  { value: 'moderate', label: { ar: 'متوسط', en: 'Moderate' }, factor: 1.55 },
  { value: 'athletic', label: { ar: 'عالي', en: 'Athletic' }, factor: 1.725 },
]

const GOALS = [
  { value: 'lose', label: { ar: 'خسارة وزن', en: 'Lose weight' }, adjust: -300 },
  { value: 'maintain', label: { ar: 'ثبات', en: 'Maintain' }, adjust: 0 },
  { value: 'gain', label: { ar: 'زيادة عضلية', en: 'Gain muscle' }, adjust: 250 },
]

const QUICK_MEALS = [
  { name: { ar: 'سموزي بروتين', en: 'Protein smoothie' }, calories: 420, protein: 28, carbs: 48, fat: 12 },
  { name: { ar: 'وجبة غداء', en: 'Lunch bowl' }, calories: 760, protein: 45, carbs: 78, fat: 24 },
  { name: { ar: 'سناك خفيف', en: 'Light snack' }, calories: 230, protein: 8, carbs: 10, fat: 18 },
]

const DEFAULT_PROFILE_FORM = {
  full_name: '',
  gender: 'male',
  age: 27,
  height_cm: 178,
  weight_kg: 78,
  goal_weight_kg: 74,
  activity_level: 'moderate',
  goal_type: 'maintain',
}

const DEFAULT_AUTH_FORM = {
  email: '',
  password: '',
  full_name: '',
}

const DEFAULT_MEAL_FORM = {
  meal_name: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  log_date: new Date().toISOString().slice(0, 10),
}

const DEFAULT_WEIGHT_FORM = {
  weight_kg: '',
  log_date: new Date().toISOString().slice(0, 10),
}

const strings = {
  ar: {
    brand: 'Glow Up',
    hero_badge: 'منصة لياقة عصرية بربط حقيقي مع Supabase',
    hero_title: 'واجهة ناعمة، حسابات حقيقية، وتجربة موبايل أولًا',
    hero_desc:
      'سجل بحسابك، خزن بياناتك بشكل منفصل، تابع الوزن والوجبات والماء، وكل شيء يزامن تلقائيًا مع Supabase.',
    open_dashboard: 'افتح اللوحة',
    sign_in: 'تسجيل دخول',
    sign_up: 'إنشاء حساب',
    google: 'المتابعة بـ Google',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    full_name: 'الاسم الكامل',
    auth_hint: 'يعتمد النظام على Supabase Auth الافتراضي للتأكيد واسترجاع كلمة المرور.',
    auth_ready: 'اتصال Supabase جاهز',
    auth_missing: 'أضف مفاتيح Supabase في ملف .env',
    logout: 'تسجيل خروج',
    save: 'حفظ',
    cancel: 'إلغاء',
    profile: 'الملف الشخصي',
    dashboard: 'لوحة التحكم',
    progress: 'التقدم',
    settings: 'الإعدادات',
    home: 'الرئيسية',
    calories_today: 'سعرات اليوم',
    remaining: 'المتبقي',
    water_today: 'الماء اليوم',
    target: 'الهدف',
    weight: 'الوزن',
    latest_weight: 'آخر وزن',
    bmr: 'BMR',
    tdee: 'TDEE',
    update_profile: 'تحديث البيانات',
    add_weight: 'إضافة وزن',
    log_meal: 'إضافة وجبة',
    meal_name: 'اسم الوجبة',
    meal_date: 'تاريخ الوجبة',
    meal_calories: 'السعرات',
    meal_protein: 'بروتين',
    meal_carbs: 'كارب',
    meal_fat: 'دهون',
    meal_history: 'سجل الوجبات',
    weight_history: 'سجل الوزن',
    add_water: 'إضافة كوب ماء',
    remove_water: 'حذف كوب ماء',
    no_meals: 'لا توجد وجبات مسجلة بعد.',
    no_weights: 'لا توجد بيانات وزن بعد.',
    quick_add: 'إضافة سريعة',
    quick_note: 'تنبيه سريع',
    profile_card: 'ملخص الحساب',
    theme: 'المظهر',
    language: 'اللغة',
    light: 'فاتح',
    dark: 'داكن',
    connection_ok: 'الاتصال بالخادم نشط',
    setup_needed: 'إعداد Supabase غير مكتمل',
    save_success: 'تم الحفظ بنجاح.',
    auth_success: 'تم تسجيل الدخول.',
    signup_success: 'تم إنشاء الحساب.',
    google_note: 'فعّل Google Provider من إعدادات Supabase قبل الاستخدام.',
    weekly_progress: 'تقدم الأسبوع',
    last_7_days: 'آخر 7 أيام',
    water_target: 'هدف الماء',
    calories_target: 'هدف السعرات',
    start_tracking: 'ابدأ التتبع الآن',
  },
  en: {
    brand: 'Glow Up',
    hero_badge: 'Modern fitness platform with real Supabase sync',
    hero_title: 'Soft UI, real accounts, mobile-first experience',
    hero_desc:
      'Sign in, keep data separate per user, track weight, meals, and water, and sync everything to Supabase automatically.',
    open_dashboard: 'Open dashboard',
    sign_in: 'Sign in',
    sign_up: 'Sign up',
    google: 'Continue with Google',
    email: 'Email',
    password: 'Password',
    full_name: 'Full name',
    auth_hint: 'This uses Supabase Auth defaults for verification and password reset.',
    auth_ready: 'Supabase connection ready',
    auth_missing: 'Add Supabase keys in .env',
    logout: 'Log out',
    save: 'Save',
    cancel: 'Cancel',
    profile: 'Profile',
    dashboard: 'Dashboard',
    progress: 'Progress',
    settings: 'Settings',
    home: 'Home',
    calories_today: 'Calories today',
    remaining: 'Remaining',
    water_today: 'Water today',
    target: 'Target',
    weight: 'Weight',
    latest_weight: 'Latest weight',
    bmr: 'BMR',
    tdee: 'TDEE',
    update_profile: 'Update profile',
    add_weight: 'Add weight',
    log_meal: 'Add meal',
    meal_name: 'Meal name',
    meal_date: 'Meal date',
    meal_calories: 'Calories',
    meal_protein: 'Protein',
    meal_carbs: 'Carbs',
    meal_fat: 'Fat',
    meal_history: 'Meal history',
    weight_history: 'Weight history',
    add_water: 'Add water cup',
    remove_water: 'Remove water cup',
    no_meals: 'No meals logged yet.',
    no_weights: 'No weight entries yet.',
    quick_add: 'Quick add',
    quick_note: 'Quick note',
    profile_card: 'Account summary',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    connection_ok: 'Connected to backend',
    setup_needed: 'Supabase setup missing',
    save_success: 'Saved successfully.',
    auth_success: 'Signed in successfully.',
    signup_success: 'Account created successfully.',
    google_note: 'Enable the Google provider in Supabase before using this button.',
    weekly_progress: 'Weekly progress',
    last_7_days: 'Last 7 days',
    water_target: 'Water target',
    calories_target: 'Calories target',
    start_tracking: 'Start tracking now',
  },
}

const today = () => new Date().toISOString().slice(0, 10)

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatDate = (value, lang) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const calcBmr = (profile) => {
  const age = toNumber(profile.age)
  const height = toNumber(profile.height_cm)
  const weight = toNumber(profile.weight_kg)
  const isFemale = profile.gender === 'female'
  return Math.round(isFemale ? 10 * weight + 6.25 * height - 5 * age - 161 : 10 * weight + 6.25 * height - 5 * age + 5)
}

const calcTargets = (profile) => {
  const bmr = calcBmr(profile)
  const activity = ACTIVITY_LEVELS.find((item) => item.value === profile.activity_level)?.factor ?? 1.55
  const adjust = GOALS.find((item) => item.value === profile.goal_type)?.adjust ?? 0
  const tdee = Math.round(bmr * activity)
  const calories_target = Math.max(1200, Math.round(tdee + adjust))
  const water_target_cups = Math.max(6, Math.round(toNumber(profile.weight_kg) / 10))
  return { bmr, tdee, calories_target, water_target_cups }
}

const cloneProfile = (profile, email, userMeta) => {
  const fullName = profile?.full_name ?? userMeta?.full_name ?? userMeta?.name ?? ''
  const base = {
    ...DEFAULT_PROFILE_FORM,
    ...profile,
    full_name: fullName,
    email: email ?? profile?.email ?? '',
  }
  const targets = calcTargets(base)
  return {
    ...base,
    ...targets,
  }
}

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="label text-white/70 dark:text-white/70 text-slate-600">{label}</span>
    {children}
    {hint ? <span className="mt-2 block text-xs text-white/45 dark:text-white/45 text-slate-500">{hint}</span> : null}
  </label>
)

const Card = ({ title, subtitle, children, className = '' }) => (
  <section className={`glass rounded-[28px] border-white/10 bg-white/10 p-5 shadow-glass ${className}`}>
    {(title || subtitle) && (
      <div className="mb-4">
        {title ? <h3 className="card-title">{title}</h3> : null}
        {subtitle ? <p className="mt-1 text-sm text-white/65 dark:text-white/65 text-slate-500">{subtitle}</p> : null}
      </div>
    )}
    {children}
  </section>
)

const Stat = ({ label, value, sub }) => (
  <div className="rounded-[24px] border border-white/10 bg-black/10 p-4 backdrop-blur">
    <div className="text-xs uppercase tracking-[0.2em] text-white/45 dark:text-white/45 text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {sub ? <div className="mt-1 text-sm text-white/55 dark:text-white/55 text-slate-500">{sub}</div> : null}
  </div>
)

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_LANG) || 'ar')
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_THEME) || 'dark')
  const [page, setPage] = useState(() => localStorage.getItem(STORAGE_PAGE) || 'home')
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(DEFAULT_AUTH_FORM)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE_FORM)
  const [meals, setMeals] = useState([])
  const [weights, setWeights] = useState([])
  const [dailyMetrics, setDailyMetrics] = useState(null)
  const [mealForm, setMealForm] = useState(DEFAULT_MEAL_FORM)
  const [weightForm, setWeightForm] = useState(DEFAULT_WEIGHT_FORM)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingMeal, setSavingMeal] = useState(false)
  const [savingWeight, setSavingWeight] = useState(false)
  const [savingWater, setSavingWater] = useState(false)

  const t = strings[lang]
  const isRtl = lang === 'ar'
  const isReady = Boolean(supabase)

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG, lang)
    localStorage.setItem(STORAGE_THEME, theme)
    localStorage.setItem(STORAGE_PAGE, page)
  }, [lang, theme, page])

  useEffect(() => {
    document.body.dataset.theme = theme
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = lang
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [lang, theme, isRtl])

  useEffect(() => {
    if (!supabase) {
      setInitializing(false)
      return
    }

    let alive = true

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession()
      if (!alive) return
      setSession(data.session ?? null)
      setInitializing(false)
    }

    bootstrap()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setProfile(null)
        setProfileForm(DEFAULT_PROFILE_FORM)
        setMeals([])
        setWeights([])
        setDailyMetrics(null)
      }
    })

    return () => {
      alive = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user || !supabase) {
      setProfile(null)
      setMeals([])
      setWeights([])
      setDailyMetrics(null)
      return
    }

    let alive = true

    const loadAccount = async () => {
      setInitializing(true)
      const user = session.user

      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) throw profileError

      let activeProfile = existingProfile

      if (!activeProfile) {
        const starter = {
          id: user.id,
          email: user.email ?? '',
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
          ...DEFAULT_PROFILE_FORM,
          ...calcTargets(DEFAULT_PROFILE_FORM),
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(starter)
          .select('*')
          .single()

        if (createError) throw createError
        activeProfile = createdProfile
      }

      const [mealsResult, weightsResult, dailyResult] = await Promise.all([
        supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('log_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(60),
        supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('log_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(60),
        supabase
          .from('daily_metrics')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today())
          .maybeSingle(),
      ])

      if (!alive) return

      setProfile(activeProfile)
      setProfileForm({
        full_name: activeProfile.full_name || '',
        gender: activeProfile.gender || 'male',
        age: activeProfile.age ?? 27,
        height_cm: activeProfile.height_cm ?? 178,
        weight_kg: activeProfile.weight_kg ?? 78,
        goal_weight_kg: activeProfile.goal_weight_kg ?? 74,
        activity_level: activeProfile.activity_level || 'moderate',
        goal_type: activeProfile.goal_type || 'maintain',
      })
      setMeals(mealsResult.data ?? [])
      setWeights(weightsResult.data ?? [])
      setDailyMetrics(dailyResult.data ?? { water_cups: 0, log_date: today() })
      setWeightForm((prev) => ({
        ...prev,
        weight_kg: activeProfile.weight_kg ?? '',
      }))
      setInitializing(false)
    }

    loadAccount().catch((error) => {
      console.error(error)
      setInitializing(false)
      setAuthError(error?.message || 'Failed to load account')
    })

    return () => {
      alive = false
    }
  }, [session])

  const metrics = useMemo(() => {
    const activeProfile = profile ? cloneProfile(profile, session?.user?.email, session?.user?.user_metadata) : null
    const selectedDate = today()
    const todayMeals = meals.filter((meal) => meal.log_date === selectedDate)
    const caloriesToday = todayMeals.reduce((sum, meal) => sum + toNumber(meal.calories), 0)
    const proteinToday = todayMeals.reduce((sum, meal) => sum + toNumber(meal.protein), 0)
    const carbsToday = todayMeals.reduce((sum, meal) => sum + toNumber(meal.carbs), 0)
    const fatToday = todayMeals.reduce((sum, meal) => sum + toNumber(meal.fat), 0)
    const waterToday = toNumber(dailyMetrics?.water_cups, 0)
    const latestWeight = weights[0]?.weight_kg ?? activeProfile?.weight_kg ?? 0
    const previousWeight = weights[1]?.weight_kg ?? activeProfile?.weight_kg ?? 0
    const weightDelta = toNumber(latestWeight) - toNumber(previousWeight)
    const caloriesTarget = activeProfile?.calories_target ?? 2200
    const waterTarget = activeProfile?.water_target_cups ?? 8
    const remainingCalories = caloriesTarget - caloriesToday
    const weeklyWeights = [...weights]
      .slice(0, 7)
      .reverse()
      .map((entry) => ({
        date: formatDate(entry.log_date, lang),
        weight: toNumber(entry.weight_kg),
      }))
    const latestChange = Number.isFinite(weightDelta) ? weightDelta : 0

    return {
      activeProfile,
      caloriesToday,
      proteinToday,
      carbsToday,
      fatToday,
      waterToday,
      waterTarget,
      caloriesTarget,
      remainingCalories,
      latestWeight,
      latestChange,
      weeklyWeights,
    }
  }, [profile, session, meals, weights, dailyMetrics, lang])

  const statusBadge = isReady ? t.connection_ok : t.setup_needed

  const handleAuth = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!supabase) {
      setAuthError('Supabase environment variables are missing.')
      return
    }

    const email = authForm.email.trim()
    const password = authForm.password.trim()

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: authForm.full_name.trim(),
            },
          },
        })
        if (error) throw error
        setAuthMessage(t.signup_success)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setAuthMessage(t.auth_success)
      }
      setAuthForm(DEFAULT_AUTH_FORM)
    } catch (error) {
      setAuthError(error?.message || 'Authentication failed')
    }
  }

  const handleGoogleLogin = async () => {
    setAuthError('')
    setAuthMessage('')

    if (!supabase) {
      setAuthError('Supabase environment variables are missing.')
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          },
        },
      })
      if (error) throw error
    } catch (error) {
      setAuthError(error?.message || 'Google sign-in failed')
    }
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setSession(null)
    setProfile(null)
    setMeals([])
    setWeights([])
    setDailyMetrics(null)
    setAuthMessage('')
    setAuthError('')
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    if (!supabase || !session?.user) return
    setSavingProfile(true)
    setAuthError('')
    setAuthMessage('')
    try {
      const payload = {
        id: session.user.id,
        email: session.user.email ?? '',
        ...profileForm,
        age: toNumber(profileForm.age, 27),
        height_cm: toNumber(profileForm.height_cm, 178),
        weight_kg: toNumber(profileForm.weight_kg, 78),
        goal_weight_kg: toNumber(profileForm.goal_weight_kg, 74),
        ...calcTargets(profileForm),
      }
      const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single()
      if (error) throw error
      setProfile(data)
      setProfileForm({
        full_name: data.full_name ?? '',
        gender: data.gender ?? 'male',
        age: data.age ?? 27,
        height_cm: data.height_cm ?? 178,
        weight_kg: data.weight_kg ?? 78,
        goal_weight_kg: data.goal_weight_kg ?? 74,
        activity_level: data.activity_level ?? 'moderate',
        goal_type: data.goal_type ?? 'maintain',
      })
      setAuthMessage(t.save_success)
    } catch (error) {
      setAuthError(error?.message || 'Could not save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const addMeal = async (event) => {
    event.preventDefault()
    if (!supabase || !session?.user) return
    setSavingMeal(true)
    setAuthError('')
    setAuthMessage('')
    try {
      const payload = {
        user_id: session.user.id,
        meal_name: mealForm.meal_name.trim(),
        calories: toNumber(mealForm.calories),
        protein: toNumber(mealForm.protein),
        carbs: toNumber(mealForm.carbs),
        fat: toNumber(mealForm.fat),
        log_date: mealForm.log_date || today(),
      }
      if (!payload.meal_name) throw new Error('Meal name is required')
      const { data, error } = await supabase.from('meal_logs').insert(payload).select('*').single()
      if (error) throw error
      setMeals((prev) => [data, ...prev])
      setMealForm(DEFAULT_MEAL_FORM)
      setAuthMessage(t.save_success)
    } catch (error) {
      setAuthError(error?.message || 'Could not add meal')
    } finally {
      setSavingMeal(false)
    }
  }

  const addWeight = async (event) => {
    event.preventDefault()
    if (!supabase || !session?.user) return
    setSavingWeight(true)
    setAuthError('')
    setAuthMessage('')
    try {
      const weightValue = toNumber(weightForm.weight_kg)
      if (!weightValue) throw new Error('Weight is required')
      const payload = {
        user_id: session.user.id,
        weight_kg: weightValue,
        log_date: weightForm.log_date || today(),
      }
      const { data, error } = await supabase.from('weight_logs').insert(payload).select('*').single()
      if (error) throw error
      setWeights((prev) => [data, ...prev])
      setWeightForm({ weight_kg: '', log_date: today() })
      setAuthMessage(t.save_success)
    } catch (error) {
      setAuthError(error?.message || 'Could not add weight')
    } finally {
      setSavingWeight(false)
    }
  }

  const updateWater = async (delta) => {
    if (!supabase || !session?.user) return
    setSavingWater(true)
    setAuthError('')
    setAuthMessage('')
    try {
      const nextValue = Math.max(0, toNumber(dailyMetrics?.water_cups, 0) + delta)
      const payload = {
        user_id: session.user.id,
        log_date: today(),
        water_cups: nextValue,
      }
      const { data, error } = await supabase
        .from('daily_metrics')
        .upsert(payload, { onConflict: 'user_id,log_date' })
        .select('*')
        .single()
      if (error) throw error
      setDailyMetrics(data)
      setAuthMessage(t.save_success)
    } catch (error) {
      setAuthError(error?.message || 'Could not update water')
    } finally {
      setSavingWater(false)
    }
  }

  const deleteMeal = async (id) => {
    if (!supabase || !session?.user) return
    const { error } = await supabase.from('meal_logs').delete().eq('id', id)
    if (!error) {
      setMeals((prev) => prev.filter((meal) => meal.id !== id))
    }
  }

  const deleteWeight = async (id) => {
    if (!supabase || !session?.user) return
    const { error } = await supabase.from('weight_logs').delete().eq('id', id)
    if (!error) {
      setWeights((prev) => prev.filter((entry) => entry.id !== id))
    }
  }

  const fillQuickMeal = (meal) => {
    setMealForm({
      meal_name: meal.name[lang],
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      log_date: today(),
    })
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-200 text-sm font-black text-slate-950 shadow-lg shadow-orange-500/30">
              G
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.18em] uppercase text-white/55 dark:text-white/55 text-slate-500">{t.brand}</div>
              <div className="text-sm text-white/70 dark:text-white/70 text-slate-600">{statusBadge}</div>
            </div>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {PAGES.map((item) => (
              <button
                key={item}
                onClick={() => setPage(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  page === item
                    ? 'bg-white text-slate-950 shadow-lg shadow-orange-500/10'
                    : 'text-white/75 hover:bg-white/10 dark:text-slate-700 dark:hover:bg-slate-200/70'
                }`}
              >
                {t[item]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              {lang}
            </button>
            <button
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold"
            >
              {theme === 'dark' ? t.light : t.dark}
            </button>
            {session ? (
              <button
                onClick={handleLogout}
                className="rounded-full bg-orange-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:bg-orange-300"
              >
                {t.logout}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8 md:hidden">
          {PAGES.map((item) => (
            <button
              key={item}
              onClick={() => setPage(item)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                page === item
                  ? 'bg-white text-slate-950'
                  : 'border border-white/10 bg-white/5 text-white/70'
              }`}
            >
              {t[item]}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!session ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-[32px] border-white/10 bg-gradient-to-br from-white/12 to-white/5 p-6 shadow-glass"
            >
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-orange-200/30 bg-orange-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
                  {t.hero_badge}
                </span>
                <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                  {t.hero_title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 dark:text-white/70 text-slate-600">
                  {t.hero_desc}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setPage('dashboard')}
                    className="rounded-2xl bg-orange-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-orange-500/30 transition hover:bg-orange-300"
                  >
                    {t.open_dashboard}
                  </button>
                  <button
                    onClick={() => setPage('settings')}
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    {t.start_tracking}
                  </button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <Stat label={t.profile_card} value="Supabase" sub="Auth + database" />
                  <Stat label={t.calories_target} value="RLS" sub="Private rows per user" />
                  <Stat label={t.water_target} value="Google" sub="OAuth ready" />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">{lang === 'ar' ? 'واجهة نظيفة' : 'Clean UI'}</div>
                    <p className="mt-2 text-sm text-white/65 dark:text-white/65 text-slate-600">
                      {lang === 'ar' ? 'Glassmorphism خفيف وألوان برتقالي/كريمي.' : 'Soft glassmorphism with orange and cream tones.'}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">{lang === 'ar' ? 'بيانات حقيقية' : 'Real data'}</div>
                    <p className="mt-2 text-sm text-white/65 dark:text-white/65 text-slate-600">
                      {lang === 'ar' ? 'كل مستخدم له rows منفصلة في Supabase.' : 'Each user gets isolated rows in Supabase.'}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">{lang === 'ar' ? 'جاهز للنشر' : 'Vercel ready'}</div>
                    <p className="mt-2 text-sm text-white/65 dark:text-white/65 text-slate-600">
                      {lang === 'ar' ? 'الواجهة فقط على Vercel والبيانات على Supabase.' : 'Frontend on Vercel, data stays on Supabase.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                title={authMode === 'login' ? t.sign_in : t.sign_up}
                subtitle={t.auth_hint}
              >
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      authMode === 'login' ? 'bg-orange-400 text-slate-950' : 'bg-white/10 text-white/75 border border-white/10'
                    }`}
                  >
                    {t.sign_in}
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      authMode === 'signup' ? 'bg-orange-400 text-slate-950' : 'bg-white/10 text-white/75 border border-white/10'
                    }`}
                  >
                    {t.sign_up}
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'signup' ? (
                    <Field label={t.full_name}>
                      <input
                        className="input bg-white/5 border-white/10 text-white placeholder:text-white/35"
                        value={authForm.full_name}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, full_name: e.target.value }))}
                        placeholder={t.full_name}
                        autoComplete="name"
                      />
                    </Field>
                  ) : null}
                  <Field label={t.email}>
                    <input
                      type="email"
                      required
                      className="input bg-white/5 border-white/10 text-white placeholder:text-white/35"
                      value={authForm.email}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label={t.password}>
                    <input
                      type="password"
                      required
                      className="input bg-white/5 border-white/10 text-white placeholder:text-white/35"
                      value={authForm.password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    />
                  </Field>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-orange-500/30 transition hover:bg-orange-300"
                  >
                    {authMode === 'login' ? t.sign_in : t.sign_up}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    {t.google}
                  </button>
                </form>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-white/60 dark:text-white/60 text-slate-500">{t.auth_hint}</p>
                  <p className={`rounded-2xl border px-4 py-3 ${isReady ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-300/20 bg-amber-400/10 text-amber-100'}`}>
                    {isReady ? t.auth_ready : t.auth_missing}
                  </p>
                  {authMessage ? <p className="rounded-2xl border border-green-300/20 bg-green-400/10 px-4 py-3 text-green-100">{authMessage}</p> : null}
                  {authError ? <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-red-100">{authError}</p> : null}
                </div>
              </Card>
            </motion.section>
          </div>
        ) : (
          <>
            {page === 'home' && (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Card
                  title={lang === 'ar' ? 'مرحبًا بك' : 'Welcome back'}
                  subtitle={profile?.full_name || session?.user?.email || ''}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Stat
                      label={t.calories_today}
                      value={`${metrics.caloriesToday}`}
                      sub={`${t.target}: ${metrics.caloriesTarget}`}
                    />
                    <Stat
                      label={t.water_today}
                      value={`${metrics.waterToday}`}
                      sub={`${t.target}: ${metrics.waterTarget}`}
                    />
                    <Stat
                      label={t.latest_weight}
                      value={`${toNumber(metrics.latestWeight).toFixed(1)} kg`}
                      sub={`${metrics.latestChange >= 0 ? '+' : ''}${metrics.latestChange.toFixed(1)} kg`}
                    />
                    <Stat
                      label={t.remaining}
                      value={`${metrics.remainingCalories}`}
                      sub={lang === 'ar' ? 'سعرة متبقية' : 'kcal left'}
                    />
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">{lang === 'ar' ? 'ملخّص سريع' : 'Quick summary'}</div>
                    <p className="mt-2 text-sm leading-7 text-white/65 dark:text-white/65 text-slate-600">
                      {lang === 'ar'
                        ? 'تقدر تروح للوحة التحكم لتسجيل الأكل والماء، أو تفتح التقدم لمراجعة الترند الأسبوعي.'
                        : 'Use the dashboard to log meals and water, or open progress to review the weekly trend.'}
                    </p>
                  </div>
                </Card>

                <Card
                  title={lang === 'ar' ? 'ملاحظات الواجهة' : 'UI notes'}
                  subtitle={lang === 'ar' ? 'مناسبة للموبايل والفريمات النظيفة' : 'Mobile-first and polished'}
                >
                  <div className="space-y-3">
                    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold">{lang === 'ar' ? 'Minimalist' : 'Minimalist'}</div>
                      <p className="mt-1 text-sm text-white/65 dark:text-white/65 text-slate-600">
                        {lang === 'ar' ? 'بدون زحمة عناصر، والواجهة تركز على الفعل فقط.' : 'No clutter; the interface stays focused on the action.'}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold">{lang === 'ar' ? 'Glassmorphism' : 'Glassmorphism'}</div>
                      <p className="mt-1 text-sm text-white/65 dark:text-white/65 text-slate-600">
                        {lang === 'ar' ? 'بطاقات شفافة مع عمق بصري واضح.' : 'Translucent panels with clear depth and contrast.'}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold">{lang === 'ar' ? 'Supabase' : 'Supabase'}</div>
                      <p className="mt-1 text-sm text-white/65 dark:text-white/65 text-slate-600">
                        {lang === 'ar' ? 'Auth + database + RLS بدون backend منفصل.' : 'Auth, database, and RLS without a custom backend.'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {page === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Stat label={t.calories_today} value={`${metrics.caloriesToday}`} sub={`${t.remaining}: ${metrics.remainingCalories}`} />
                  <Stat label={t.water_today} value={`${metrics.waterToday}`} sub={`${t.target}: ${metrics.waterTarget}`} />
                  <Stat label={t.latest_weight} value={`${toNumber(metrics.latestWeight).toFixed(1)} kg`} sub={`${metrics.latestChange >= 0 ? '+' : ''}${metrics.latestChange.toFixed(1)} kg`} />
                  <Stat label={t.bmr} value={`${profile?.bmr ? Math.round(profile.bmr) : calcBmr(profileForm)} kcal`} sub={`${t.tdee}: ${profile?.tdee ? Math.round(profile.tdee) : calcTargets(profileForm).tdee}`} />
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <Card title={t.profile} subtitle={t.profile_card}>
                    <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
                      <Field label={t.full_name}>
                        <input
                          className="input bg-white/5 border-white/10 text-white placeholder:text-white/35"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))}
                        />
                      </Field>
                      <Field label={lang === 'ar' ? 'النوع' : 'Gender'}>
                        <select
                          className="input bg-white/5 border-white/10 text-white"
                          value={profileForm.gender}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, gender: e.target.value }))}
                        >
                          <option value="male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                          <option value="female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                        </select>
                      </Field>
                      <Field label={lang === 'ar' ? 'العمر' : 'Age'}>
                        <input
                          type="number"
                          className="input bg-white/5 border-white/10 text-white"
                          value={profileForm.age}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, age: e.target.value }))}
                        />
                      </Field>
                      <Field label={lang === 'ar' ? 'الطول (سم)' : 'Height (cm)'}>
                        <input
                          type="number"
                          className="input bg-white/5 border-white/10 text-white"
                          value={profileForm.height_cm}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, height_cm: e.target.value }))}
                        />
                      </Field>
                      <Field label={lang === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}>
                        <input
                          type="number"
                          className="input bg-white/5 border-white/10 text-white"
                          value={profileForm.weight_kg}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, weight_kg: e.target.value }))}
                        />
                      </Field>
                      <Field label={lang === 'ar' ? 'الوزن المستهدف' : 'Goal weight'}>
                        <input
                          type="number"
                          className="input bg-white/5 border-white/10 text-white"
                          value={profileForm.goal_weight_kg}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, goal_weight_kg: e.target.value }))}
                        />
                      </Field>
                      <Field label={lang === 'ar' ? 'النشاط' : 'Activity'}>
                        <select
                          className="input bg-white/5 border-white/10 text-white"
                          value={profileForm.activity_level}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, activity_level: e.target.value }))}
                        >
                          {ACTIVITY_LEVELS.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label[lang]}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={lang === 'ar' ? 'الهدف' : 'Goal'}>
                        <select
                          className="input bg-white/5 border-white/10 text-white"
                          value={profileForm.goal_type}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, goal_type: e.target.value }))}
                        >
                          {GOALS.map((goal) => (
                            <option key={goal.value} value={goal.value}>
                              {goal.label[lang]}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                        <Stat label={t.calories_target} value={`${calcTargets(profileForm).calories_target}`} />
                        <Stat label={t.water_target} value={`${calcTargets(profileForm).water_target_cups} cups`} />
                      </div>

                      <div className="sm:col-span-2 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="rounded-2xl bg-orange-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-orange-300 disabled:opacity-60"
                        >
                          {savingProfile ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : t.update_profile}
                        </button>
                      </div>
                    </form>
                  </Card>

                  <div className="space-y-6">
                    <Card title={t.quick_add} subtitle={lang === 'ar' ? 'اختيارات سريعة للوجبات' : 'Fast meal templates'}>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {QUICK_MEALS.map((meal) => (
                          <button
                            key={meal.name.en}
                            onClick={() => fillQuickMeal(meal)}
                            className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                          >
                            <div className="font-semibold">{meal.name[lang]}</div>
                            <div className="mt-2 text-xs text-white/55 dark:text-white/55 text-slate-500">
                              {meal.calories} kcal · {meal.protein}P · {meal.carbs}C · {meal.fat}F
                            </div>
                          </button>
                        ))}
                      </div>
                    </Card>

                    <Card title={t.log_meal} subtitle={lang === 'ar' ? 'خزن الأكل في Supabase' : 'Store food in Supabase'}>
                      <form onSubmit={addMeal} className="grid gap-4 sm:grid-cols-2">
                        <Field label={t.meal_name}>
                          <input
                            className="input bg-white/5 border-white/10 text-white placeholder:text-white/35"
                            value={mealForm.meal_name}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, meal_name: e.target.value }))}
                          />
                        </Field>
                        <Field label={t.meal_date}>
                          <input
                            type="date"
                            className="input bg-white/5 border-white/10 text-white"
                            value={mealForm.log_date}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, log_date: e.target.value }))}
                          />
                        </Field>
                        <Field label={t.meal_calories}>
                          <input
                            type="number"
                            className="input bg-white/5 border-white/10 text-white"
                            value={mealForm.calories}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, calories: e.target.value }))}
                          />
                        </Field>
                        <Field label={t.meal_protein}>
                          <input
                            type="number"
                            className="input bg-white/5 border-white/10 text-white"
                            value={mealForm.protein}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, protein: e.target.value }))}
                          />
                        </Field>
                        <Field label={t.meal_carbs}>
                          <input
                            type="number"
                            className="input bg-white/5 border-white/10 text-white"
                            value={mealForm.carbs}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, carbs: e.target.value }))}
                          />
                        </Field>
                        <Field label={t.meal_fat}>
                          <input
                            type="number"
                            className="input bg-white/5 border-white/10 text-white"
                            value={mealForm.fat}
                            onChange={(e) => setMealForm((prev) => ({ ...prev, fat: e.target.value }))}
                          />
                        </Field>
                        <div className="sm:col-span-2">
                          <button
                            type="submit"
                            disabled={savingMeal}
                            className="rounded-2xl bg-orange-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-orange-300 disabled:opacity-60"
                          >
                            {savingMeal ? (lang === 'ar' ? 'جارٍ الإضافة...' : 'Adding...') : t.log_meal}
                          </button>
                        </div>
                      </form>
                    </Card>

                    <Card title={t.add_weight} subtitle={lang === 'ar' ? 'سجل الوزن مع التاريخ' : 'Track body weight over time'}>
                      <form onSubmit={addWeight} className="grid gap-4 sm:grid-cols-2">
                        <Field label={t.weight}>
                          <input
                            type="number"
                            className="input bg-white/5 border-white/10 text-white"
                            value={weightForm.weight_kg}
                            onChange={(e) => setWeightForm((prev) => ({ ...prev, weight_kg: e.target.value }))}
                          />
                        </Field>
                        <Field label={t.meal_date}>
                          <input
                            type="date"
                            className="input bg-white/5 border-white/10 text-white"
                            value={weightForm.log_date}
                            onChange={(e) => setWeightForm((prev) => ({ ...prev, log_date: e.target.value }))}
                          />
                        </Field>
                        <div className="sm:col-span-2">
                          <button
                            type="submit"
                            disabled={savingWeight}
                            className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-white/90 disabled:opacity-60"
                          >
                            {savingWeight ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : t.add_weight}
                          </button>
                        </div>
                      </form>
                    </Card>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card title={t.meal_history} subtitle={lang === 'ar' ? 'آخر السجلات في الحساب' : 'Latest entries in the account'}>
                    <div className="space-y-3">
                      {meals.length ? (
                        meals.map((meal) => (
                          <div key={meal.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/5 p-4">
                            <div>
                              <div className="font-semibold">{meal.meal_name}</div>
                              <div className="mt-1 text-sm text-white/60 dark:text-white/60 text-slate-500">
                                {formatDate(meal.log_date, lang)} · {meal.calories} kcal
                              </div>
                            </div>
                            <button
                              onClick={() => deleteMeal(meal.id)}
                              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold"
                            >
                              {lang === 'ar' ? 'حذف' : 'Delete'}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/55 dark:text-white/55 text-slate-500">{t.no_meals}</p>
                      )}
                    </div>
                  </Card>

                  <Card title={t.weight_history} subtitle={lang === 'ar' ? 'اتجاه الوزن الحالي' : 'Current weight trend'}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateWater(-1)}
                          disabled={savingWater}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold"
                        >
                          {t.remove_water}
                        </button>
                        <button
                          onClick={() => updateWater(1)}
                          disabled={savingWater}
                          className="rounded-2xl bg-orange-400 px-4 py-3 text-sm font-semibold text-slate-950"
                        >
                          {savingWater ? (lang === 'ar' ? 'جارٍ التحديث...' : 'Updating...') : t.add_water}
                        </button>
                      </div>

                      {weights.length ? (
                        weights.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 p-4">
                            <div>
                              <div className="font-semibold">{toNumber(entry.weight_kg).toFixed(1)} kg</div>
                              <div className="mt-1 text-sm text-white/60 dark:text-white/60 text-slate-500">
                                {formatDate(entry.log_date, lang)}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteWeight(entry.id)}
                              className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold"
                            >
                              {lang === 'ar' ? 'حذف' : 'Delete'}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/55 dark:text-white/55 text-slate-500">{t.no_weights}</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {page === 'progress' && (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <Card title={t.weekly_progress} subtitle={`${t.last_7_days} · ${profile?.full_name || session.user.email || ''}`}>
                  {metrics.weeklyWeights.length ? (
                    <div className="h-[340px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.weeklyWeights}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 18,
                              border: '1px solid rgba(255,255,255,.12)',
                              background: 'rgba(10,15,20,.92)',
                              color: 'white',
                            }}
                          />
                          <Line type="monotone" dataKey="weight" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-white/65 dark:text-white/65 text-slate-600">
                      {lang === 'ar'
                        ? 'أضف أول وزن في لوحة التحكم ليظهر الترند هنا.'
                        : 'Add your first weight entry in the dashboard to show the trend here.'}
                    </div>
                  )}
                </Card>

                <div className="space-y-6">
                  <Card title={t.profile_card} subtitle={lang === 'ar' ? 'أرقام الحساب الحالية' : 'Current account numbers'}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Stat label={t.calories_target} value={`${metrics.caloriesTarget}`} />
                      <Stat label={t.water_target} value={`${metrics.waterTarget} cups`} />
                      <Stat label={t.bmr} value={`${profile?.bmr ? Math.round(profile.bmr) : calcBmr(profileForm)}`} />
                      <Stat label={t.tdee} value={`${profile?.tdee ? Math.round(profile.tdee) : calcTargets(profileForm).tdee}`} />
                    </div>
                  </Card>

                  <Card title={t.quick_note} subtitle={lang === 'ar' ? 'ملخص اليوم' : 'Today summary'}>
                    <div className="space-y-3 text-sm leading-7 text-white/70 dark:text-white/70 text-slate-600">
                      <p>
                        {lang === 'ar'
                          ? `سعرات اليوم ${metrics.caloriesToday} من هدف ${metrics.caloriesTarget}.`
                          : `Today is ${metrics.caloriesToday} of ${metrics.caloriesTarget} calories.`}
                      </p>
                      <p>
                        {lang === 'ar'
                          ? `الماء المسجل ${metrics.waterToday} كوب من هدف ${metrics.waterTarget}.`
                          : `Water logged: ${metrics.waterToday} cups out of ${metrics.waterTarget}.`}
                      </p>
                      <p>
                        {lang === 'ar'
                          ? `آخر وزن ${toNumber(metrics.latestWeight).toFixed(1)} كجم.`
                          : `Latest weight: ${toNumber(metrics.latestWeight).toFixed(1)} kg.`}
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {page === 'settings' && (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <Card title={t.settings} subtitle={lang === 'ar' ? 'المظهر والملف والحساب' : 'Theme, profile, and account'}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.theme}>
                      <select
                        className="input bg-white/5 border-white/10 text-white"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      >
                        <option value="dark">{t.dark}</option>
                        <option value="light">{t.light}</option>
                      </select>
                    </Field>
                    <Field label={t.language}>
                      <select
                        className="input bg-white/5 border-white/10 text-white"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                      >
                        <option value="ar">AR</option>
                        <option value="en">EN</option>
                      </select>
                    </Field>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Stat label={t.profile_card} value={profile?.full_name || session.user.email || '-'} />
                    <Stat label={t.auth_ready} value={isReady ? 'Yes' : 'No'} />
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-semibold">{lang === 'ar' ? 'كيف تربطه على Vercel' : 'Vercel deployment'}</div>
                    <p className="mt-2 text-sm leading-7 text-white/65 dark:text-white/65 text-slate-600">
                      {lang === 'ar'
                        ? 'ارفع الواجهة على Vercel، واضبط متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.'
                        : 'Deploy the frontend on Vercel and add VITE_SUPABASE_URL plus VITE_SUPABASE_ANON_KEY as environment variables.'}
                    </p>
                  </div>
                </Card>

                <Card title={t.auth_success} subtitle={lang === 'ar' ? 'Supabase Auth' : 'Supabase Auth'}>
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/70 dark:text-white/70 text-slate-600">
                      {t.auth_hint}
                    </div>
                    <div className="rounded-[24px] border border-orange-300/20 bg-orange-400/10 p-5 text-sm leading-7 text-orange-50">
                      {t.google_note}
                    </div>
                    {authMessage ? <p className="rounded-[24px] border border-green-300/20 bg-green-400/10 p-4 text-green-100">{authMessage}</p> : null}
                    {authError ? <p className="rounded-[24px] border border-red-300/20 bg-red-400/10 p-4 text-red-100">{authError}</p> : null}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        <footer className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-white/45 dark:text-white/45 text-slate-500">
          {lang === 'ar'
            ? 'Glow Up مبني بأسلوب واضح: واجهة خفيفة، حسابات منفصلة، وتخزين على Supabase.'
            : 'Glow Up is built with a clean interface, separate user accounts, and Supabase-backed storage.'}
        </footer>
      </main>

      {initializing ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
          <div className="rounded-3xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-medium text-white shadow-glass">
            {lang === 'ar' ? 'جاري تحميل الجلسة...' : 'Loading session...'}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
