import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, CircleGauge, Eye, EyeOff, KeyRound, LoaderCircle, Mail, Sparkles, UserRound, ShieldCheck } from 'lucide-react'
import { Button, GlassCard, Input, Label, Pill, ChoiceCard } from '../components/ui'

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sky-200">
          <Icon className="h-4 w-4" />
        </span>
        <div className="text-base font-black text-white">{title}</div>
      </div>
      <div className="mt-3 text-sm leading-7 text-white/62">{text}</div>
    </div>
  )
}

export default function AuthPage({ mode, setMode, loading, onSubmit, onGoogle, error, message }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isSignUp = mode === 'signUp'
  const ctaLabel = isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'
  const helperText = useMemo(
    () => (isSignUp ? 'أنشئ حسابًا وابدأ رحلة التتبع من البداية.' : 'ادخل إلى لوحة المتابعة الخاصة بك.'),
    [isSignUp],
  )

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,214,77,0.11),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.10),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <GlassCard className="grid w-full overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden p-7 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%)]" />
            <div className="relative space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <Pill>Glow Up Fitness</Pill>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold tracking-[0.24em] text-white/55">
                  وضع ليلي عميق
                </div>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                  تسجيل دخول أنيق، ومنه تبدأ لوحة متابعة كاملة ومرتبة.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
                  واجهة داكنة، أزرار واضحة، وتفاعل سريع. بعد الدخول هتنتقل لرحلة إعداد مختصرة ثم لوحة يومية وسجل أكل ومتابعة للماء والوزن.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Feature icon={Sparkles} title="رحلة إعداد" text="أسئلة اختيار سريع ثم إدخال الأرقام المهمة بشكل واضح." />
                <Feature icon={CircleGauge} title="لوحة يومية" text="عداد السعرات، ماء، وسجل وجبات مرتب في مكان واحد." />
                <Feature icon={ShieldCheck} title="حفظ تلقائي" text="كل شيء يتخزن محليًا فورًا ويعود كما هو بعد إعادة الفتح." />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/42">الهوية</div>
                  <div className="mt-3 flex items-center gap-2 text-2xl font-black text-white">
                    <Sparkles className="h-5 w-5 text-[#ffd64d]" /> Dark
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/42">اللمسة</div>
                  <div className="mt-3 flex items-center gap-2 text-2xl font-black text-white">
                    <BadgeCheck className="h-5 w-5 text-[#ffd64d]" /> Yellow
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/42">الإحساس</div>
                  <div className="mt-3 flex items-center gap-2 text-2xl font-black text-white">
                    <ShieldCheck className="h-5 w-5 text-[#ffd64d]" /> Premium
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/18 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/70">ابدأ هنا</div>
                <div className="mt-2 text-2xl font-black text-white">{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</div>
                <div className="mt-2 text-sm leading-7 text-white/60">{helperText}</div>
              </div>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#ffd64d]"
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
            </div>

            <div className="mt-6 rounded-full border border-white/10 bg-white/[0.05] p-1 text-sm font-semibold text-white/72">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setMode('signIn')}
                  className={`relative overflow-hidden rounded-full px-4 py-3 transition ${!isSignUp ? 'text-black' : 'text-white/78'}`}
                >
                  {!isSignUp ? <motion.div layoutId="auth-pill" className="absolute inset-0 rounded-full bg-[#ffd64d]" /> : null}
                  <span className="relative inline-flex items-center gap-2"><KeyRound className="h-4 w-4" /> تسجيل الدخول</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signUp')}
                  className={`relative overflow-hidden rounded-full px-4 py-3 transition ${isSignUp ? 'text-black' : 'text-white/78'}`}
                >
                  {isSignUp ? <motion.div layoutId="auth-pill" className="absolute inset-0 rounded-full bg-[#ffd64d]" /> : null}
                  <span className="relative inline-flex items-center gap-2"><UserRound className="h-4 w-4" /> إنشاء حساب</span>
                </button>
              </div>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit({ email, password, fullName, mode })
              }}
            >
              {isSignUp ? (
                <div>
                  <Label>الاسم الكامل</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اكتب اسمك" autoComplete="name" />
                </div>
              ) : null}

              <div>
                <Label>البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" type="email" autoComplete="email" className="pr-11" />
                </div>
              </div>

              <div>
                <Label>كلمة السر</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    className="pr-11 pl-12"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white" aria-label="إظهار كلمة السر">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-7 text-red-100">
                  {error}
                </div>
              ) : null}
              {message ? (
                <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-7 text-emerald-100">
                  {message}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={loading} rightIcon={loading ? LoaderCircle : ArrowRight}>
                {loading ? 'جارٍ التنفيذ...' : ctaLabel}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/35">
              <div className="h-px flex-1 bg-white/10" />
              أو
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button type="button" variant="secondary" onClick={onGoogle} disabled={loading} className="w-full" leftIcon={Sparkles}>
              المتابعة عبر جوجل
            </Button>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white/68">
                بعد الدخول تظهر لك رحلة تأهيل سريعة ثم الصفحة الرئيسية.
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white/68">
                التقدم يحفظ تلقائيًا داخل الحساب الحالي.
              </div>
            </div>

            <p className="mt-6 text-center text-sm leading-7 text-white/45">واجهة داكنة احترافية بلمسة ذهبية وسلاسة واضحة</p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
