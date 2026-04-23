import React, { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Droplets,
  Footprints,
  Home,
  LogOut,
  MoonStar,
  PencilLine,
  PlusCircle,
  RefreshCcw,
  Salad,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Target,
  Trash2,
  UserRound,
  KeyRound,
  Search,
  Barcode,
  Soup,
  X,
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  MEAL_TYPES,
  calculateBmr,
  calculateMacros,
  calculateTargetCalories,
  calculateTdee,
  calculateWaterNeed,
  buildMealEntry,
  formatCalories,
  formatKg,
  formatMl,
  getFoodByBarcode,
  groupMealsByType,
  makeSeriesFromEntries,
  searchFoods,
  sumMacros,
  sumMealCalories,
} from '../lib/fitness'
import {
  appendMealEntry,
  appendWaterEntry,
  appendWeightEntry,
  getMealsKey,
  getOnboardingKey,
  getProfileKey,
  getSettingsKey,
  getWaterKey,
  getWeightKey,
  loadMealEntries,
  loadProfile,
  loadSettings,
  loadWaterEntries,
  loadWeightEntries,
  removeMealEntry,
  saveProfile,
  saveSettings,
  saveWeightEntries,
} from '../lib/storage'
import {
  BottomNav,
  Button,
  ChoiceCard,
  GlassCard,
  IconButton,
  Input,
  Label,
  Pill,
  ProgressRing,
  SectionTitle,
  Select,
  SettingsRow,
  StatTile,
  TopBar,
  formatDateShort,
  formatTimeShort,
  MetricStrip,
} from '../components/ui'
import FeatureLauncherGrid from '../features/dashboard/FeatureLauncherGrid'
import WorkoutStudio from '../features/dashboard/WorkoutStudio'
import NutritionCenter from '../features/dashboard/NutritionCenter'
import RecoveryCenter from '../features/dashboard/RecoveryCenter'
import CommunityBoard from '../features/dashboard/CommunityBoard'
import { SETTINGS_SHORTCUTS } from '../data/extendedLibrary'

const NAV = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'log', label: 'السجل اليومي', icon: Salad },
  { id: 'plans', label: 'الخطط', icon: BarChart3 },
  { id: 'profile', label: 'الملف', icon: UserRound },
]

const DEFAULT_SETTINGS = {
  mealReminders: true,
  waterReminders: true,
  sleepReminder: true,
  weeklyReportEnabled: true,
  bedtime: '23:00',
  wakeTime: '07:00',
  stepGoal: 8000,
  currentSteps: 0,
  appearance: 'dark',
  passwordHint: '',
}

function useDailyEntries(userId) {
  const [meals, setMeals] = useState(() => loadMealEntries(userId))
  const [water, setWater] = useState(() => loadWaterEntries(userId))
  const [weights, setWeights] = useState(() => loadWeightEntries(userId))
  return { meals, setMeals, water, setWater, weights, setWeights }
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/42">{subtitle}</div>
        <div className="mt-2 text-2xl font-black text-white">{title}</div>
      </div>
      {action || null}
    </div>
  )
}

function MiniProgress({ label, value, max, accent = 'sky', icon: Icon }) {
  const progress = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between text-sm text-white/68">
        <span className="inline-flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-white/55" /> : null}
          {label}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${accent === 'sky' ? 'bg-sky-400' : accent === 'green' ? 'bg-emerald-400' : 'bg-[#ffd64d]'}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 text-xs text-white/45">{value} / {max}</div>
    </div>
  )
}

function CollapsibleSection({ title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20">
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right">
        <div>
          <div className="text-base font-black text-white">{title}</div>
          <div className="mt-1 text-sm text-white/48">{count} عنصر</div>
        </div>
        <div className="text-xl text-white/55">{open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</div>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function FoodItem({ item, onAdd }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-black text-white">{item.name}</div>
          <div className="mt-1 text-sm text-white/55">{item.serving} · كود {item.barcode}</div>
        </div>
        <Button variant="secondary" onClick={() => onAdd(item)} className="shrink-0 px-4 py-2 text-xs" leftIcon={PlusCircle}>
          إضافة
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs text-white/68">
        <div className="rounded-2xl border border-white/8 bg-black/20 px-2 py-2">{item.calories}<div className="mt-1 text-white/45">سعرة</div></div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-2 py-2">{item.protein}<div className="mt-1 text-white/45">بروتين</div></div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-2 py-2">{item.carbs}<div className="mt-1 text-white/45">كارب</div></div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-2 py-2">{item.fat}<div className="mt-1 text-white/45">دهون</div></div>
      </div>
    </div>
  )
}

function SettingsOverlay({
  open,
  onClose,
  user,
  profile,
  setProfile,
  settings,
  setSettings,
  theme,
  toggleTheme,
  onLogout,
  onDeleteAccount,
  onChangePassword,
  weeklySummary,
}) {
  const [password, setPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    if (!open) return
    setPassword('')
    setPasswordMessage('')
  }, [open])

  if (!open) return null

  const updateSetting = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }))
  const updateProfile = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  const handlePassword = async () => {
    const result = await onChangePassword(password)
    setPasswordMessage(result)
    if (result?.includes('تم')) setPassword('')
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 px-4 py-6 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#091018] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/70">Settings</div>
            <div className="mt-1 text-2xl font-black text-white">لوحة الإعدادات</div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton icon={X} variant="secondary" onClick={onClose} aria-label="إغلاق" />
          </div>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 sm:p-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-6">
            <GlassCard className="p-5 sm:p-6">
              <SectionTitle title="تعديل الملف الشخصي" description="غيّر الاسم، الهدف، الوزن، والوحدة من نفس المكان." icon={PencilLine} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><Label>الاسم</Label><Input value={profile.name} onChange={(e) => updateProfile('name', e.target.value)} /></div>
                <div><Label>الهدف</Label><Select value={profile.goal} onChange={(e) => updateProfile('goal', e.target.value)}>{GOAL_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
                <div><Label>الوزن الحالي</Label><Input type="number" step="0.1" value={profile.weight} onChange={(e) => updateProfile('weight', e.target.value)} /></div>
                <div><Label>العمر</Label><Input type="number" value={profile.age} onChange={(e) => updateProfile('age', e.target.value)} /></div>
                <div><Label>الوحدة</Label><Select value={profile.units || 'metric'} onChange={(e) => updateProfile('units', e.target.value)}><option value="metric">كيلو / سم</option><option value="imperial">رطل / قدم</option></Select></div>
                <div><Label>النوع</Label><Select value={profile.gender} onChange={(e) => updateProfile('gender', e.target.value)}>{['male', 'female'].map((v) => <option key={v} value={v}>{v === 'male' ? 'ذكر' : 'أنثى'}</option>)}</Select></div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <SectionTitle title="منظم النوم والالتزامات" description="موعد نوم، موعد استيقاظ، وتنبيهات يومية منظمة." icon={MoonStar} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><Label>موعد النوم</Label><Input type="time" value={settings.bedtime} onChange={(e) => updateSetting('bedtime', e.target.value)} /></div>
                <div><Label>موعد الاستيقاظ</Label><Input type="time" value={settings.wakeTime} onChange={(e) => updateSetting('wakeTime', e.target.value)} /></div>
                <SettingsRow
                  icon={BellRing}
                  title="تذكير تسجيل الوجبات"
                  description="إشعار خفيف يذكرك بإضافة وجباتك في الوقت المناسب."
                  action={<input type="checkbox" checked={settings.mealReminders} onChange={(e) => updateSetting('mealReminders', e.target.checked)} />}
                />
                <SettingsRow
                  icon={Droplets}
                  title="تذكير شرب الماء"
                  description="تنبيه مساعد للحفاظ على معدل الماء اليومي."
                  action={<input type="checkbox" checked={settings.waterReminders} onChange={(e) => updateSetting('waterReminders', e.target.checked)} />}
                />
                <SettingsRow
                  icon={Footprints}
                  title="متبع الخطوات"
                  description="نظام بسيط لتتبع عدد خطواتك مقارنة بالهدف اليومي."
                  action={<input type="checkbox" checked={settings.stepsEnabled ?? true} onChange={(e) => updateSetting('stepsEnabled', e.target.checked)} />}
                />
                <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
                  <div><Label>هدف الخطوات</Label><Input type="number" step="100" min="1000" value={settings.stepGoal} onChange={(e) => updateSetting('stepGoal', e.target.value)} /></div>
                  <div><Label>الخطوات الحالية</Label><Input type="number" step="1" min="0" value={settings.currentSteps} onChange={(e) => updateSetting('currentSteps', e.target.value)} /></div>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-5 sm:p-6">
              <SectionTitle title="تقرير أسبوعي عن الإنجاز" description="ملخص سريع مبني على السجل الفعلي الموجود داخل التطبيق." icon={Sparkles} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">متوسط السعرات</div>
                  <div className="mt-2 text-2xl font-black text-white">{weeklySummary.calorieAvg}</div>
                  <div className="mt-1 text-sm text-white/54">في آخر 7 أيام</div>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">متوسط الماء</div>
                  <div className="mt-2 text-2xl font-black text-white">{weeklySummary.waterAvg}</div>
                  <div className="mt-1 text-sm text-white/54">يوميًا</div>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">تغير الوزن</div>
                  <div className="mt-2 text-2xl font-black text-white">{weeklySummary.weightDelta}</div>
                  <div className="mt-1 text-sm text-white/54">مقارنة بأول وآخر سجل</div>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/42">الالتزام</div>
                  <div className="mt-2 text-2xl font-black text-white">{weeklySummary.adherence}</div>
                  <div className="mt-1 text-sm text-white/54">أيام نشطة هذا الأسبوع</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <SectionTitle title="المظهر والتحكم في الحساب" description="الوضع الليلي، تغيير الباسورد، تسجيل الخروج، والحذف المحلي للحساب." icon={Settings2} />
              <div className="mt-5 space-y-3">
                <SettingsRow
                  icon={theme === 'dark' ? MoonStar : SunMedium}
                  title="المظهر"
                  description={theme === 'dark' ? 'الوضع الليلي مفعّل حاليًا.' : 'الوضع النهاري مفعّل حاليًا.'}
                  action={<Button variant="secondary" onClick={toggleTheme} leftIcon={theme === 'dark' ? SunMedium : MoonStar}>{theme === 'dark' ? 'تفعيل النهاري' : 'تفعيل الليلي'}</Button>}
                />
                <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-bold text-white">تغيير الباسورد</div>
                  <div className="mt-2 text-sm leading-6 text-white/58">غيّر كلمة السر من هنا إذا كان الحساب مرتبطًا بخدمة تسجيل دخول فعلية.</div>
                  <div className="mt-4 flex gap-3">
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة سر جديدة" />
                    <Button onClick={handlePassword} leftIcon={KeyRound} className="shrink-0">حفظ</Button>
                  </div>
                  {passwordMessage ? <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/70">{passwordMessage}</div> : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="secondary" onClick={onLogout} leftIcon={LogOut}>تسجيل الخروج</Button>
                  <Button variant="secondary" onClick={onDeleteAccount} leftIcon={Trash2} className="border-rose-500/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15">حذف الحساب</Button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <SectionTitle title="اختصارات الإعدادات" description="شاشات مباشرة للوصول السريع لأهم الأجزاء المطلوبة." icon={ShieldCheck} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {SETTINGS_SHORTCUTS.map((item) => (
                  <div key={item.id} className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-white/58">{item.description}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <SectionTitle title="ملاحظات سريعة" description="كل إعداد هنا يُحفظ تلقائيًا داخل الحساب الحالي." icon={ShieldAlert} />
              <div className="mt-5 space-y-3 text-sm leading-7 text-white/64">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">الاسم والهدف والوحدة يمكن تعديلهم مباشرة من هذه الشاشة.</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">منظم النوم والخطوات والتنبيهات مدمجين داخل الإعدادات لتسهيل المتابعة اليومية.</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">الحذف هنا يزيل بيانات الحساب المخزنة محليًا ثم يخرجك من الجلسة.</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function useWeeklySummary(meals, water, weights, targetCalories, profile) {
  return useMemo(() => {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)

    const from = sevenDaysAgo.toISOString().slice(0, 10)
    const weekMeals = meals.filter((entry) => entry.date.slice(0, 10) >= from)
    const weekWater = water.filter((entry) => entry.date.slice(0, 10) >= from)
    const weekWeights = weights.filter((entry) => entry.date.slice(0, 10) >= from)

    const daySet = new Set([...weekMeals, ...weekWater, ...weekWeights].map((entry) => entry.date.slice(0, 10)))
    const caloriesTotal = weekMeals.reduce((sum, entry) => sum + Number(entry.calories || 0), 0)
    const waterTotal = weekWater.reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const firstWeight = weekWeights[weekWeights.length - 1]?.weight ?? profile.weight
    const lastWeight = weekWeights[0]?.weight ?? profile.weight
    const delta = Number(lastWeight || 0) - Number(firstWeight || 0)

    return {
      calorieAvg: `${Math.round(caloriesTotal / 7) || 0}`,
      waterAvg: `${formatMl(waterTotal / 7 || 0)}`,
      weightDelta: `${delta > 0 ? '+' : ''}${delta.toFixed(1)} كجم`,
      adherence: `${daySet.size} / 7`,
    }
  }, [meals, water, weights, profile.weight])
}

function HomeTab({ profile, targetCalories, meals, water, weights, settings }) {
  const today = new Date().toISOString().slice(0, 10)
  const todayMeals = meals.filter((entry) => entry.date.slice(0, 10) === today)
  const calories = sumMealCalories(todayMeals)
  const remaining = Math.max(0, targetCalories - calories)
  const waterTarget = calculateWaterNeed(profile)
  const waterToday = water.filter((entry) => entry.date.slice(0, 10) === today).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)

  const weightSeries = makeSeriesFromEntries(weights.slice(0, 12).reverse(), 'weight').map((item) => ({
    name: formatDateShort(item.date),
    الوزن: item.value,
  }))

  const mealBar = MEAL_TYPES.map((meal) => ({
    name: meal.label,
    value: sumMealCalories(todayMeals.filter((entry) => entry.mealType === meal.value)),
  }))

  const latestWeight = weights[0]?.weight ?? profile.weight
  const previousWeight = weights[1]?.weight ?? null
  const delta = previousWeight !== null ? Number(latestWeight) - Number(previousWeight) : 0
  const steps = Number(settings.currentSteps || 0)
  const stepGoal = Number(settings.stepGoal || 8000)
  const [focusRoom, setFocusRoom] = useState('nutrition-lab')
  const focusRoomMap = {
    'nutrition-lab': {
      title: 'معمل التغذية',
      desc: 'بحث الطعام والباركود والوصفات السريعة والماكروز كلها في مكان واحد.',
      bullets: ['اقتراح وجبات', 'بحث ذكي', 'قراءة الباركود'],
    },
    'workout-studio': {
      title: 'استوديو التمرين',
      desc: 'خطة تدريب أسبوعية مع تقسيم واضح ومؤشرات التزام.',
      bullets: ['Push / Pull / Legs', 'شدة التمرين', 'استرجاع الأداء'],
    },
    'sleep-control': {
      title: 'مركز النوم',
      desc: 'منبهات النوم، الاستيقاظ، وروتين الاستشفاء الليلي.',
      bullets: ['موعد النوم', 'استيقاظ ثابت', 'تهدئة قبل النوم'],
    },
    'community-board': {
      title: 'لوحة التحديات',
      desc: 'شارات وإنجازات صغيرة تحافظ على الحماس اليومي.',
      bullets: ['Streak', 'شارات', 'تحديات أسبوعية'],
    },
  }
  const focusRoomData = focusRoomMap[focusRoom] || focusRoomMap['nutrition-lab']

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <CardHeader subtitle="الرئيسية" title={`أهلًا ${profile.name || 'مستخدم'}`} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center">
            <ProgressRing
              label="السعرات"
              value={`${Math.round((calories / targetCalories) * 100 || 0)}%`}
              progress={(calories / targetCalories) * 100}
              hint={`${remaining} متبقية`}
            />
          </div>
          <MetricStrip
            items={[
              { label: 'المأكول اليوم', value: formatCalories(calories), hint: `هدفك ${targetCalories}`, icon: Soup },
              { label: 'المتبقي اليوم', value: `${remaining}`, hint: 'سعرة', icon: Target },
              { label: 'الماء', value: formatMl(waterToday), hint: `من ${formatMl(waterTarget)}`, icon: Droplets },
              { label: 'الوزن الحالي', value: latestWeight ? formatKg(latestWeight) : '—', hint: previousWeight !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} كجم عن آخر سجل` : 'لا يوجد سجل سابق', icon: ScaleIcon },
            ]}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <SectionTitle
          title="بوابة المنصة"
          description="محتوى أكبر بكثير: اختصارات واضحة، أقسام كثيرة، وتنقل بصري يخدم المستخدم من أول الشاشة."
          icon={Sparkles}
        />
        <div className="mt-5">
          <FeatureLauncherGrid onPick={setFocusRoom} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/42">القسم المختار</div>
            <div className="mt-2 text-2xl font-black text-white">{focusRoomData.title}</div>
            <div className="mt-3 text-sm leading-7 text-white/62">{focusRoomData.desc}</div>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/70">ماذا يفعل هذا القسم</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {focusRoomData.bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6">
        <WorkoutStudio profile={profile} targetCalories={targetCalories} />
        <NutritionCenter targetCalories={targetCalories} />
        <RecoveryCenter settings={settings} weeklySummary={weeklySummary} />
        <CommunityBoard weeklySummary={weeklySummary} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <GlassCard className="p-6 sm:p-8">
          <SectionTitle title="مخطط الوزن" description="يوضح تغير الوزن عبر السجلات المحفوظة." icon={BarChart3} />
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(7,11,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="الوزن" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <MiniProgress label="الماء" value={waterToday} max={waterTarget} icon={Droplets} />
          <MiniProgress label="السعرات" value={calories} max={targetCalories} accent="green" icon={Soup} />
          <MiniProgress label="الخطوات" value={steps} max={stepGoal} accent="amber" icon={Footprints} />
          <GlassCard className="p-5">
            <div className="text-xs uppercase tracking-[0.28em] text-white/42">توزيع الوجبات</div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(7,11,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, color: '#fff' }} />
                  <Bar dataKey="value" fill="#ffd64d" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function DailyLog({ userId, profile, targetCalories, meals, setMeals, water, setWater }) {
  const [query, setQuery] = useState('')
  const [mealType, setMealType] = useState('breakfast')
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')
  const [barcode, setBarcode] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [waterAmount, setWaterAmount] = useState('250')

  const today = new Date().toISOString().slice(0, 10)
  const todayMeals = meals.filter((entry) => entry.date.slice(0, 10) === today)
  const grouped = groupMealsByType(todayMeals)
  const suggestions = useMemo(() => searchFoods(query), [query])

  useEffect(() => {
    const found = getFoodByBarcode(barcode)
    if (found) setSelectedFood(found)
  }, [barcode])

  const addFood = (food) => {
    const entry = buildMealEntry(food, mealType, quantity, note)
    const next = appendMealEntry(userId, entry)
    setMeals(next)
    setSelectedFood(food)
  }

  const addSelected = () => {
    if (!selectedFood) return
    addFood(selectedFood)
    setNote('')
  }

  const addWater = (amount) => {
    const numeric = Number(amount)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    const next = appendWaterEntry(userId, { date: new Date().toISOString(), amount: numeric })
    setWater(next)
  }

  const deleteMeal = (id) => {
    const next = removeMealEntry(userId, id)
    setMeals(next)
  }

  const consumedCalories = sumMealCalories(todayMeals)
  const macroTotals = sumMacros(todayMeals)
  const waterTarget = calculateWaterNeed(profile)
  const waterToday = water.filter((entry) => entry.date.slice(0, 10) === today).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <CardHeader subtitle="السجل اليومي" title="إضافة الأكل والماء بسرعة" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <Label>ابحث عن أكلة</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اكتب أول حرفين" className="pr-11" />
              </div>
            </div>
            <div>
              <Label>باركود المنتج</Label>
              <div className="relative">
                <Barcode className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="مثال: 1004" className="pr-11" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>نوع الوجبة</Label>
                <Select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  {MEAL_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>الكمية</Label>
                <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="1" step="1" />
              </div>
            </div>
            <div>
              <Label>ملاحظة اختيارية</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثال: قبل التمرين" />
            </div>
            <Button onClick={addSelected} className="w-full sm:w-auto" leftIcon={PlusCircle}>إضافة العنصر المحدد</Button>
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-white/42">العنصر المحدد</div>
              <div className="mt-2 text-2xl font-black text-white">{selectedFood ? selectedFood.name : 'لا يوجد'}</div>
              <div className="mt-2 text-sm text-white/58">{selectedFood ? `${selectedFood.calories} سعرة / ${selectedFood.serving}` : 'اختر من الاقتراحات أو اكتب الكود.'}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => addWater(250)} leftIcon={Droplets}>+ 250 مل</Button>
              <Button variant="secondary" onClick={() => addWater(500)} leftIcon={Droplets}>+ 500 مل</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input value={waterAmount} onChange={(e) => setWaterAmount(e.target.value)} type="number" min="1" />
              <Button onClick={() => addWater(waterAmount)} leftIcon={Droplets}>إضافة ماء</Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-8">
        <SectionTitle title="اقتراحات سريعة" description="اختيار مباشر من قاعدة البيانات الصغيرة الحالية، مع إمكانية البحث بالكود أو الاسم." icon={Search} />
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((item) => <FoodItem key={item.id} item={item} onAdd={addFood} />)}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <GlassCard className="p-6 sm:p-8">
          <CardHeader subtitle="تجميع اليوم" title="الإفطار والغداء والعشاء والسناكات" />
          <div className="mt-6 space-y-4">
            {MEAL_TYPES.map((meal) => (
              <CollapsibleSection key={meal.value} title={meal.label} count={grouped[meal.value].length} defaultOpen={meal.value === 'breakfast'}>
                <div className="space-y-3">
                  {grouped[meal.value].length === 0 ? (
                    <div className="rounded-[1.25rem] border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">لا توجد عناصر بعد.</div>
                  ) : grouped[meal.value].map((entry) => (
                    <div key={entry.id} className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-black text-white">{entry.name}</div>
                          <div className="mt-1 text-sm text-white/50">{formatTimeShort(entry.date)} · {entry.quantity}× {entry.serving}</div>
                        </div>
                        <Button variant="ghost" onClick={() => deleteMeal(entry.id)} className="px-4 py-2 text-xs" leftIcon={Trash2}>حذف</Button>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-white/64">
                        <div className="rounded-2xl border border-white/8 bg-black/20 p-2 text-center">{entry.calories}<div className="mt-1 text-white/45">سعرة</div></div>
                        <div className="rounded-2xl border border-white/8 bg-black/20 p-2 text-center">{entry.protein}<div className="mt-1 text-white/45">بروتين</div></div>
                        <div className="rounded-2xl border border-white/8 bg-black/20 p-2 text-center">{entry.carbs}<div className="mt-1 text-white/45">كارب</div></div>
                        <div className="rounded-2xl border border-white/8 bg-black/20 p-2 text-center">{entry.fat}<div className="mt-1 text-white/45">دهون</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <StatTile label="سعرات اليوم" value={formatCalories(consumedCalories)} hint={`المتبقي ${Math.max(0, targetCalories - consumedCalories)} سعرة`} accent="blue" icon={Soup} />
          <StatTile label="ماء اليوم" value={formatMl(waterToday)} hint={`الهدف ${formatMl(waterTarget)}`} accent="green" icon={Droplets} />
          <StatTile label="بروتين اليوم" value={`${macroTotals.protein} جم`} hint="إجمالي الوجبات المسجلة حتى الآن" icon={Activity} />
          <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
            <div className="text-sm text-white/68">معدل الماء اليوم</div>
            <div className="mt-4 flex items-center justify-center">
              <ProgressRing label="ماء" value={`${Math.min(100, Math.round((waterToday / waterTarget) * 100))}%`} progress={(waterToday / waterTarget) * 100} hint="اليوم" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlansTab({ profile, setProfile }) {
  const bmr = useMemo(() => calculateBmr(profile), [profile])
  const tdee = useMemo(() => calculateTdee(bmr, profile.activity), [bmr, profile.activity])
  const targetCalories = useMemo(() => calculateTargetCalories({ tdee, goal: profile.goal }), [tdee, profile.goal])
  const macros = useMemo(() => calculateMacros({ calories: targetCalories, weight: profile.weight, goal: profile.goal }), [targetCalories, profile.weight, profile.goal])

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <CardHeader subtitle="الخطط" title="السعرات والماكروز والاحتياج اليومي" />
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
          الحسابات هنا مباشرة ومبنية على الطول والوزن والعمر والنشاط والهدف. كل تعديل في البيانات ينعكس فورًا على الرقم النهائي.
        </p>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <GlassCard className="p-6 sm:p-8">
          <SectionTitle title="المدخلات الأساسية" description="يمكنك تعديل القيم مباشرة من هنا." icon={Target} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><Label>الاسم</Label><Input value={profile.name} onChange={(e) => update('name', e.target.value)} /></div>
            <div><Label>العمر</Label><Input type="number" value={profile.age} onChange={(e) => update('age', e.target.value)} /></div>
            <div><Label>النوع</Label><Select value={profile.gender} onChange={(e) => update('gender', e.target.value)}>{['male','female'].map((v) => <option key={v} value={v}>{v === 'male' ? 'ذكر' : 'أنثى'}</option>)}</Select></div>
            <div><Label>الطول (سم)</Label><Input type="number" step="0.1" value={profile.height} onChange={(e) => update('height', e.target.value)} /></div>
            <div><Label>الوزن (كجم)</Label><Input type="number" step="0.1" value={profile.weight} onChange={(e) => update('weight', e.target.value)} /></div>
            <div><Label>النشاط</Label><Select value={profile.activity} onChange={(e) => update('activity', e.target.value)}>{ACTIVITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
            <div className="sm:col-span-2"><Label>الهدف</Label><Select value={profile.goal} onChange={(e) => update('goal', e.target.value)}>{GOAL_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <StatTile label="السعرات المستهدفة" value={`${targetCalories}`} hint="رقم يومي مقترح" accent="blue" icon={Target} />
          <StatTile label="معدل الأيض الأساسي" value={`${bmr}`} hint="BMR" icon={RefreshCcw} />
          <StatTile label="الاحتياج اليومي الكلي" value={`${tdee}`} hint="TDEE" accent="green" icon={BarChart3} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StatTile label="بروتين" value={`${macros.protein} جم`} hint="للحفاظ على العضلات" accent="blue" icon={Dumbbell} />
        <StatTile label="كربوهيدرات" value={`${macros.carbs} جم`} hint="طاقة متبقية" icon={Sparkles} />
        <StatTile label="دهون" value={`${macros.fat} جم`} hint="توازن يومي" accent="green" icon={ShieldCheck} />
      </div>

      <GlassCard className="p-6 sm:p-8">
        <SectionTitle title="شرح سريع" description="زيادة الوزن أو خسارته أو الثبات يتطبق على الاحتياج اليومي تلقائيًا." icon={CheckCircle2} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {GOAL_OPTIONS.map((goal) => (
            <div key={goal.value} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/42">{goal.label}</div>
              <div className="mt-3 text-sm leading-7 text-white/68">{goal.description}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function HomeTab({ profile, targetCalories, meals, water, weights, settings }) {
  const today = new Date().toISOString().slice(0, 10)
  const todayMeals = meals.filter((entry) => entry.date.slice(0, 10) === today)
  const calories = sumMealCalories(todayMeals)
  const remaining = Math.max(0, targetCalories - calories)
  const waterTarget = calculateWaterNeed(profile)
  const waterToday = water.filter((entry) => entry.date.slice(0, 10) === today).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)

  const weightSeries = makeSeriesFromEntries(weights.slice(0, 12).reverse(), 'weight').map((item) => ({
    name: formatDateShort(item.date),
    الوزن: item.value,
  }))

  const mealBar = MEAL_TYPES.map((meal) => ({
    name: meal.label,
    value: sumMealCalories(todayMeals.filter((entry) => entry.mealType === meal.value)),
  }))

  const latestWeight = weights[0]?.weight ?? profile.weight
  const previousWeight = weights[1]?.weight ?? null
  const delta = previousWeight !== null ? Number(latestWeight) - Number(previousWeight) : 0
  const steps = Number(settings.currentSteps || 0)
  const stepGoal = Number(settings.stepGoal || 8000)

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <CardHeader subtitle="الرئيسية" title={`أهلًا ${profile.name || 'مستخدم'}`} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center">
            <ProgressRing
              label="السعرات"
              value={`${Math.round((calories / targetCalories) * 100 || 0)}%`}
              progress={(calories / targetCalories) * 100}
              hint={`${remaining} متبقية`}
            />
          </div>
          <MetricStrip
            items={[
              { label: 'المأكول اليوم', value: formatCalories(calories), hint: `هدفك ${targetCalories}`, icon: Soup },
              { label: 'المتبقي اليوم', value: `${remaining}`, hint: 'سعرة', icon: Target },
              { label: 'الماء', value: formatMl(waterToday), hint: `من ${formatMl(waterTarget)}`, icon: Droplets },
              { label: 'الوزن الحالي', value: latestWeight ? formatKg(latestWeight) : '—', hint: previousWeight !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} كجم عن آخر سجل` : 'لا يوجد سجل سابق', icon: Dumbbell },
            ]}
          />
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <GlassCard className="p-6 sm:p-8">
          <SectionTitle title="مخطط الوزن" description="يوضح تغير الوزن عبر السجلات المحفوظة." icon={BarChart3} />
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(7,11,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="الوزن" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <MiniProgress label="الماء" value={waterToday} max={waterTarget} icon={Droplets} />
          <MiniProgress label="السعرات" value={calories} max={targetCalories} accent="green" icon={Soup} />
          <MiniProgress label="الخطوات" value={steps} max={stepGoal} accent="amber" icon={Footprints} />
          <GlassCard className="p-5">
            <div className="text-xs uppercase tracking-[0.28em] text-white/42">توزيع الوجبات</div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(7,11,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, color: '#fff' }} />
                  <Bar dataKey="value" fill="#ffd64d" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user, profile, setProfile, theme, toggleTheme, onLogout, onSaveWeight, weights, onOpenSettings }) {
  const settings = loadSettings(user?.id || user?.email || 'guest', DEFAULT_SETTINGS)
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    saveSettings(user?.id || user?.email || 'guest', localSettings)
  }, [localSettings, user])

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <CardHeader subtitle="الملف الشخصي" title="الإعدادات والمعلومات الأساسية" action={<Button variant="secondary" leftIcon={Settings2} onClick={onOpenSettings}>Settings</Button>} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-white/42">الحساب</div>
              <div className="mt-2 text-2xl font-black text-white">{profile.name}</div>
              <div className="mt-1 text-sm text-white/58">{user?.email}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>الاسم</Label><Input value={profile.name} onChange={(e) => update('name', e.target.value)} /></div>
              <div><Label>العمر</Label><Input type="number" value={profile.age} onChange={(e) => update('age', e.target.value)} /></div>
              <div><Label>الوزن الحالي</Label><Input type="number" step="0.1" value={profile.weight} onChange={(e) => update('weight', e.target.value)} /></div>
              <div><Label>الهدف</Label><Select value={profile.goal} onChange={(e) => update('goal', e.target.value)}>{GOAL_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
              <div><Label>الوحدة</Label><Select value={profile.units || 'metric'} onChange={(e) => update('units', e.target.value)}><option value="metric">كيلو / سم</option><option value="imperial">رطل / قدم</option></Select></div>
              <div><Label>النوع</Label><Select value={profile.gender} onChange={(e) => update('gender', e.target.value)}>{['male','female'].map((v) => <option key={v} value={v}>{v === 'male' ? 'ذكر' : 'أنثى'}</option>)}</Select></div>
            </div>
          </div>

          <div className="space-y-4">
            <StatTile label="آخر وزن محفوظ" value={weights[0]?.weight ? formatKg(weights[0].weight) : '—'} hint="يُحفظ تلقائيًا" accent="blue" icon={Dumbbell} />
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-bold text-white">التنبيهات</div>
              <div className="mt-4 space-y-3 text-sm text-white/66">
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <span className="inline-flex items-center gap-2"><BellRing className="h-4 w-4" /> تذكير تسجيل الوجبات</span>
                  <input type="checkbox" checked={localSettings.mealReminders} onChange={(e) => setLocalSettings((p) => ({ ...p, mealReminders: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <span className="inline-flex items-center gap-2"><Droplets className="h-4 w-4" /> تذكير شرب الماء</span>
                  <input type="checkbox" checked={localSettings.waterReminders} onChange={(e) => setLocalSettings((p) => ({ ...p, waterReminders: e.target.checked }))} />
                </label>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={toggleTheme} leftIcon={theme === 'dark' ? SunMedium : MoonStar}>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</Button>
              <Button variant="secondary" onClick={onLogout} leftIcon={LogOut}>تسجيل الخروج</Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-8">
        <SectionTitle title="إضافة سجل وزن" description="كل سجل جديد يدخل الرسم البياني تلقائيًا." icon={Dumbbell} />
        <WeightComposer profile={profile} onSaveWeight={onSaveWeight} />
      </GlassCard>
    </div>
  )
}

function WeightComposer({ profile, onSaveWeight }) {
  const [weight, setWeight] = useState(profile.weight || '')
  const [note, setNote] = useState('')

  useEffect(() => {
    setWeight(profile.weight || '')
  }, [profile.weight])

  const save = () => {
    const numeric = Number(weight)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    onSaveWeight({ weight: numeric, note })
    setNote('')
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>الوزن</Label><Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
        <div><Label>ملاحظة</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="بعد التمرين مثلًا" /></div>
      </div>
      <div className="flex items-end">
        <Button onClick={save} className="w-full lg:w-auto" leftIcon={CheckCircle2}>حفظ الوزن</Button>
      </div>
    </div>
  )
}

function ScaleIcon(props) {
  return <Dumbbell {...props} />
}

export default function MainShell({ session, initialProfile = {}, onLogout, theme, toggleTheme }) {
  const user = session?.user
  const userId = user?.id || user?.email || 'guest'
  const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'مستخدم'

  const baseProfile = useMemo(() => ({
    name: initialProfile.name || loadProfile(userId, {}).name || fallbackName,
    age: Number(initialProfile.age || loadProfile(userId, {}).age || 26),
    gender: initialProfile.gender || loadProfile(userId, {}).gender || 'male',
    height: Number(initialProfile.height || loadProfile(userId, {}).height || 175),
    weight: Number(initialProfile.weight || loadProfile(userId, {}).weight || 75),
    activity: initialProfile.activity || loadProfile(userId, {}).activity || 'moderate',
    goal: initialProfile.goal || loadProfile(userId, {}).goal || 'maintain',
    units: initialProfile.units || loadProfile(userId, {}).units || 'metric',
    theme: initialProfile.theme || loadProfile(userId, {}).theme || 'dark',
    notifications: initialProfile.notifications ?? loadProfile(userId, {}).notifications ?? true,
    waterReminder: initialProfile.waterReminder ?? loadProfile(userId, {}).waterReminder ?? true,
    stepGoal: initialProfile.stepGoal || loadProfile(userId, {}).stepGoal || 8000,
    currentSteps: initialProfile.currentSteps || loadProfile(userId, {}).currentSteps || 0,
    bedtime: initialProfile.bedtime || loadProfile(userId, {}).bedtime || '23:00',
    wakeTime: initialProfile.wakeTime || loadProfile(userId, {}).wakeTime || '07:00',
  }), [userId, initialProfile, fallbackName])

  const [activeTab, setActiveTab] = useState('home')
  const [profile, setProfile] = useState(baseProfile)
  const [settings, setSettings] = useState(() => loadSettings(userId, { ...DEFAULT_SETTINGS, appearance: theme || 'dark' }))
  const [ready, setReady] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [meals, setMeals] = useState(() => loadMealEntries(userId))
  const [water, setWater] = useState(() => loadWaterEntries(userId))
  const [weights, setWeights] = useState(() => loadWeightEntries(userId))

  useEffect(() => setProfile(baseProfile), [baseProfile])
  useEffect(() => setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, appearance: theme || prev.appearance || 'dark' })), [theme, userId])

  useEffect(() => {
    saveProfile(userId, profile)
    saveSettings(userId, settings)
    setReady(true)
  }, [userId, profile, settings])

  useEffect(() => {
    saveWeightEntries(userId, weights)
  }, [userId, weights])

  const bmr = useMemo(() => calculateBmr(profile), [profile])
  const tdee = useMemo(() => calculateTdee(bmr, profile.activity), [bmr, profile.activity])
  const targetCalories = useMemo(() => calculateTargetCalories({ tdee, goal: profile.goal }), [tdee, profile.goal])
  const weeklySummary = useWeeklySummary(meals, water, weights, targetCalories, profile)

  const handleSaveWeight = ({ weight, note }) => {
    const entry = { date: new Date().toISOString(), weight, note }
    const next = appendWeightEntry(userId, entry)
    setWeights(next)
    setProfile((prev) => ({ ...prev, weight }))
  }

  const handleChangePassword = async (password) => {
    if (!password || password.length < 6) return 'الرجاء إدخال كلمة سر جديدة لا تقل عن 6 أحرف.'
    try {
      if (!supabase) return 'الربط بالخدمة غير متاح حاليًا.'
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      return 'تم تغيير الباسورد بنجاح.'
    } catch (err) {
      return err?.message || 'تعذر تغيير الباسورد.'
    }
  }

  const handleDeleteAccount = async () => {
    if (typeof window !== 'undefined') {
      ;[getProfileKey(userId), getWeightKey(userId), getWaterKey(userId), getMealsKey(userId), getOnboardingKey(userId), getSettingsKey(userId)].forEach((key) => window.localStorage.removeItem(key))
    }
    await onLogout?.()
    setSettings({ ...DEFAULT_SETTINGS, appearance: theme || 'dark' })
    setProfile(baseProfile)
    setMeals([])
    setWater([])
    setWeights([])
  }

  useEffect(() => {
    const handler = () => setReady((prev) => prev)
    window.addEventListener('online', handler)
    window.addEventListener('offline', handler)
    return () => {
      window.removeEventListener('online', handler)
      window.removeEventListener('offline', handler)
    }
  }, [])

  const pageTitle = NAV.find((item) => item.id === activeTab)?.label || 'الرئيسية'

  return (
    <div className="min-h-screen px-4 pb-28 pt-4 text-white sm:px-6 lg:px-8">
      <TopBar
        title={pageTitle}
        subtitle="لوحة شخصية داكنة مع شريط تنقل سفلي وحفظ تلقائي"
        progress={activeTab === 'home' ? 100 : activeTab === 'log' ? 75 : activeTab === 'plans' ? 50 : 25}
        stepText={ready ? 'جاهز للاستخدام' : 'جارٍ التحضير'}
        rightSlot={<div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-white/48">{typeof navigator !== 'undefined' && navigator.onLine ? 'Online' : 'Offline'}</div>}
        onSettings={() => setSettingsOpen(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'home' ? <HomeTab profile={profile} targetCalories={targetCalories} meals={meals} water={water} weights={weights} settings={settings} /> : null}
            {activeTab === 'log' ? <DailyLog userId={userId} profile={profile} targetCalories={targetCalories} meals={meals} setMeals={setMeals} water={water} setWater={setWater} /> : null}
            {activeTab === 'plans' ? <PlansTab profile={profile} setProfile={setProfile} /> : null}
            {activeTab === 'profile' ? <ProfileTab user={user} profile={profile} setProfile={setProfile} theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} onSaveWeight={handleSaveWeight} weights={weights} onOpenSettings={() => setSettingsOpen(true)} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav items={NAV} active={activeTab} onChange={setActiveTab} />

      <SettingsOverlay
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        profile={profile}
        setProfile={setProfile}
        settings={settings}
        setSettings={setSettings}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={onLogout}
        onDeleteAccount={handleDeleteAccount}
        onChangePassword={handleChangePassword}
        weeklySummary={weeklySummary}
      />
    </div>
  )
}
