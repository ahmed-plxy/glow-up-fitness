import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, ArrowLeft, BellRing, CheckCircle2, Footprints, MoonStar, Ruler, Sparkles, Target, Weight } from 'lucide-react'
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  GENDER_OPTIONS,
  calculateBmr,
  calculateTargetCalories,
  calculateTdee,
} from '../lib/fitness'
import { loadOnboardingState, saveOnboardingState, saveProfile } from '../lib/storage'
import { Button, ChoiceCard, CountPill, Input, Label, Select, TopBar, GlassCard } from '../components/ui'

const STEPS = [
  { id: 'welcome', title: 'مرحبًا بك', subtitle: 'بضع خطوات سريعة ونبني لك الأساس', icon: Sparkles },
  { id: 'goal', title: 'اختيار الهدف', subtitle: 'حدد الاتجاه الرئيسي للتطبيق', icon: Target },
  { id: 'body', title: 'البيانات الأساسية', subtitle: 'الأرقام التي يعتمد عليها الحساب', icon: Weight },
  { id: 'habits', title: 'العادات والنشاط', subtitle: 'ما الذي تفعله عادة في يومك؟', icon: Activity },
  { id: 'finish', title: 'مراجعة نهائية', subtitle: 'تأكد من الملخص ثم ابدأ', icon: CheckCircle2 },
]

function StepPills({ current }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {STEPS.map((step, index) => {
        const Icon = step.icon
        const active = index <= current
        return (
          <div
            key={step.id}
            className={`flex items-center justify-center rounded-2xl border px-3 py-2 transition ${
              active ? 'border-sky-400/30 bg-sky-400/12 text-sky-100' : 'border-white/10 bg-white/[0.04] text-white/35'
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )
      })}
    </div>
  )
}

export default function OnboardingPage({ user, onComplete, onBackToAuth }) {
  const userId = user?.id || user?.email || 'guest'
  const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'مستخدم'

  const initialState = loadOnboardingState(userId, null) || {}

  const [step, setStep] = useState(Math.min(initialState.step ?? 0, STEPS.length - 1))
  const [form, setForm] = useState(() => ({
    name: initialState.name || fallbackName,
    age: initialState.age || 26,
    gender: initialState.gender || 'male',
    height: initialState.height || 175,
    weight: initialState.weight || 75,
    activity: initialState.activity || 'moderate',
    goal: initialState.goal || 'maintain',
    units: initialState.units || 'metric',
    notifications: initialState.notifications ?? true,
    waterReminder: initialState.waterReminder ?? true,
    bedtime: initialState.bedtime || '23:00',
    wakeTime: initialState.wakeTime || '07:00',
    stepGoal: initialState.stepGoal || 8000,
    theme: initialState.theme || 'dark',
  }))

  useEffect(() => {
    saveOnboardingState(userId, { ...form, step })
  }, [userId, form, step])

  const bmr = useMemo(() => calculateBmr(form), [form])
  const tdee = useMemo(() => calculateTdee(bmr, form.activity), [bmr, form.activity])
  const target = useMemo(() => calculateTargetCalories({ tdee, goal: form.goal }), [tdee, form.goal])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const finish = () => {
    const payload = {
      ...form,
      onboardingCompleted: true,
      targetCalories: target,
      tdee,
      bmr,
    }
    saveProfile(userId, payload)
    saveOnboardingState(userId, { ...payload, step: STEPS.length - 1 })
    onComplete(payload)
  }

  const next = () => setStep((current) => Math.min(STEPS.length - 1, current + 1))
  const back = () => {
    if (step === 0) {
      onBackToAuth?.()
      return
    }
    setStep((current) => Math.max(0, current - 1))
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100)
  const currentStep = STEPS[step]
  const CurrentIcon = currentStep.icon

  return (
    <div className="min-h-screen px-4 pb-28 pt-4 text-white sm:px-6 lg:px-8">
      <TopBar
        title={currentStep.title}
        subtitle={currentStep.subtitle}
        onBack={back}
        progress={progress}
        stepText={`الخطوة ${step + 1} من ${STEPS.length}`}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-6">
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/70">
                <CurrentIcon className="h-4 w-4" /> رحلة الإعداد
              </div>
              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">إعداد سريع يجهز الحساب للاستخدام اليومي</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
                كل خطوة تحفظ تلقائيًا. التصميم هنا مقصود يكون بسيط، واضح، ومرتب: اختيارات كبيرة، أرقام ضخمة، ومسافات مريحة للعين.
              </p>
            </div>
            <div className="min-w-[260px] rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-white/42">التقدم الحالي</div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-3xl font-black text-white">{progress}%</div>
                <div className="text-right text-sm leading-7 text-white/60">
                  <div>{form.name}</div>
                  <div>{form.goal === 'bulk' ? 'زيادة وزن' : form.goal === 'loss' ? 'خسارة وزن' : form.goal === 'cut' ? 'تنشيف' : 'ثبات'}</div>
                </div>
              </div>
              <div className="mt-4">
                <StepPills current={step} />
              </div>
            </div>
          </div>
        </GlassCard>

        {step === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <GlassCard className="p-6 sm:p-8">
              <div className="space-y-5">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/42">
                    <Sparkles className="h-4 w-4 text-[#ffd64d]" /> شاشة الترحيب
                  </div>
                  <div className="mt-3 text-3xl font-black text-white">أهلًا، {form.name}</div>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    هنا نجهز بياناتك بحيث يصبح الحساب قادرًا على حساب السعرات، متابعة الماء، وسجل الطعام بشكل منظم.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ChoiceCard icon={CheckCircle2} selected title="رحلة منظمة" description="أسئلة قصيرة وحقول واضحة" onClick={() => {}} badge="Smooth flow" />
                  <ChoiceCard icon={BellRing} selected={false} title="حفظ تلقائي" description="لا تحتاج لتكرار البيانات" onClick={() => {}} badge="Auto save" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">ماذا سيحدث بعد قليل؟</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/66">اختيار الهدف بطريقة بصرية واضحة.</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/66">إدخال العمر والطول والوزن بأرقام كبيرة في منتصف الشاشة.</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/66">إعدادات النشاط والعادات والتنبيهات.</div>
              </div>
            </GlassCard>
          </motion.div>
        ) : null}

        {step === 1 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 lg:grid-cols-2">
            {GOAL_OPTIONS.map((goal) => (
              <ChoiceCard
                key={goal.value}
                selected={form.goal === goal.value}
                title={goal.label}
                description={goal.description}
                onClick={() => update('goal', goal.value)}
                icon={Target}
                badge={goal.value}
              />
            ))}
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <GlassCard className="p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">البيانات الأساسية</div>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>الاسم</Label>
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div>
                  <Label>العمر</Label>
                  <Input type="number" min="1" value={form.age} onChange={(e) => update('age', e.target.value)} />
                </div>
                <div>
                  <Label>النوع</Label>
                  <Select value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                    {GENDER_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 sm:p-8">
              <div className="grid gap-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.32em] text-white/42">
                    <Weight className="h-4 w-4" /> الوزن
                  </div>
                  <div className="mt-2 text-6xl font-black text-white sm:text-7xl">{Number(form.weight || 0).toFixed(0)}</div>
                  <div className="mt-2 text-sm text-white/55">كيلو جرام</div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.32em] text-white/42">
                    <Ruler className="h-4 w-4" /> الطول
                  </div>
                  <div className="mt-2 text-6xl font-black text-white sm:text-7xl">{Number(form.height || 0).toFixed(0)}</div>
                  <div className="mt-2 text-sm text-white/55">سنتيمتر</div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>الوزن (كجم)</Label>
                  <Input type="number" min="1" step="0.1" value={form.weight} onChange={(e) => update('weight', e.target.value)} />
                </div>
                <div>
                  <Label>الطول (سم)</Label>
                  <Input type="number" min="1" step="0.1" value={form.height} onChange={(e) => update('height', e.target.value)} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : null}

        {step === 3 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 lg:grid-cols-2">
            {ACTIVITY_OPTIONS.map((activity) => (
              <ChoiceCard
                key={activity.value}
                selected={form.activity === activity.value}
                title={activity.label}
                description={activity.hint}
                onClick={() => update('activity', activity.value)}
                icon={Footprints}
                badge={activity.value}
              />
            ))}
            <GlassCard className="p-6 sm:p-8 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <Label>الوحدة</Label>
                  <Select value={form.units} onChange={(e) => update('units', e.target.value)}>
                    <option value="metric">كيلو / سم</option>
                    <option value="imperial">رطل / قدم</option>
                  </Select>
                </div>
                <div>
                  <Label>تنبيهات الوجبات</Label>
                  <Select value={String(form.notifications)} onChange={(e) => update('notifications', e.target.value === 'true')}>
                    <option value="true">مفعلة</option>
                    <option value="false">متوقفة</option>
                  </Select>
                </div>
                <div>
                  <Label>تذكير الماء</Label>
                  <Select value={String(form.waterReminder)} onChange={(e) => update('waterReminder', e.target.value === 'true')}>
                    <option value="true">مفعل</option>
                    <option value="false">غير مفعل</option>
                  </Select>
                </div>
                <div>
                  <Label>موعد النوم</Label>
                  <Input type="time" value={form.bedtime} onChange={(e) => update('bedtime', e.target.value)} />
                </div>
                <div>
                  <Label>موعد الاستيقاظ</Label>
                  <Input type="time" value={form.wakeTime} onChange={(e) => update('wakeTime', e.target.value)} />
                </div>
                <div>
                  <Label>هدف الخطوات</Label>
                  <Input type="number" step="100" min="1000" value={form.stepGoal} onChange={(e) => update('stepGoal', e.target.value)} />
                </div>
              </div>
              <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/64">
                هنا تضيف العادات الأساسية: النوم، الخطوات، والتنبيهات. هذه المدخلات تُستخدم داخل الإعدادات لاحقًا وتبقى محفوظة تلقائيًا.
              </div>
            </GlassCard>
          </motion.div>
        ) : null}

        {step === 4 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <GlassCard className="p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/42">الملخص</div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/68">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">الاسم: {form.name}</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">الهدف: {GOAL_OPTIONS.find((g) => g.value === form.goal)?.label}</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">النشاط: {ACTIVITY_OPTIONS.find((a) => a.value === form.activity)?.label}</div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">السعرات التقديرية: {target} سعرة</div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-center">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/42">BMR</div>
                  <div className="mt-2 text-2xl font-black text-white">{bmr}</div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-center">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/42">TDEE</div>
                  <div className="mt-2 text-2xl font-black text-white">{tdee}</div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-center">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/42">Target</div>
                  <div className="mt-2 text-2xl font-black text-white">{target}</div>
                </div>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/66">
                كل شيء جاهز. اضغط متابعة للانتقال إلى لوحة التحكم الرئيسية.
              </div>
            </GlassCard>
          </motion.div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#070b11]/90 px-4 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Button variant="secondary" onClick={back} className="shrink-0" leftIcon={ArrowLeft}>
            رجوع
          </Button>
          <Button onClick={step === STEPS.length - 1 ? finish : next} className="flex-1" rightIcon={step === STEPS.length - 1 ? CheckCircle2 : ArrowRight}>
            {step === STEPS.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </Button>
        </div>
      </div>
    </div>
  )
}
