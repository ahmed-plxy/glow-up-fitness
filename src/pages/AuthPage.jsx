import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, GlassCard, Input, Label, Pill } from '../components/ui'

function Feature({ title, text, accent = 'amber' }) {
  const accentClass =
    accent === 'green'
      ? 'from-emerald-400/25 via-emerald-400/8 to-transparent'
      : accent === 'blue'
        ? 'from-sky-400/25 via-sky-400/8 to-transparent'
        : 'from-amber-400/25 via-amber-400/8 to-transparent'

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accentClass}`} />
      <div className="relative">
        <div className="text-lg font-bold text-white">{title}</div>
        <div className="mt-2 text-sm leading-7 text-white/65">{text}</div>
      </div>
    </motion.div>
  )
}

function FloatingOrb({ className }) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{ y: [0, -18, 0], x: [0, 10, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute rounded-full blur-3xl ${className}`}
    />
  )
}

function SocialProofCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/40">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-white/60">{hint}</div>
    </div>
  )
}

export default function AuthPage({ mode, setMode, loading, onSubmit, onGoogle, error, message }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const isSignUp = mode === 'signUp'
  const ctaLabel = isSignUp ? 'إنشاء الحساب' : 'دخول'
  const helperText = useMemo(
    () => (isSignUp ? 'أنشئ حسابًا جديدًا وابدأ صفحة التحول الخاصة بك.' : 'سجّل دخولك وواصل من حيث توقفت.'),
    [isSignUp],
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingOrb className="left-[-120px] top-[-120px] h-80 w-80 bg-amber-400/20" />
        <FloatingOrb className="right-[-100px] top-[8%] h-72 w-72 bg-sky-400/15" />
        <FloatingOrb className="bottom-[-120px] left-[18%] h-96 w-96 bg-emerald-400/12" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,214,102,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.10),transparent_26%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-7xl"
      >
        <GlassCard className="overflow-hidden border-white/12 bg-white/6">
          <div className="grid min-h-[780px] lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-10 lg:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
              <div className="relative space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Pill>منصة التحول</Pill>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-white/60">
                    تجربة أنيقة وسريعة
                  </div>
                </div>

                <div className="space-y-5">
                  <motion.h1
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08, duration: 0.45 }}
                    className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl"
                  >
                    لوحة دخول بلمسة فاخرة، وحضور بصري يليق بالمشروع.
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                    className="max-w-2xl text-base leading-8 text-white/68 sm:text-lg"
                  >
                    سجّل الدخول أو أنشئ حسابًا جديدًا لتصل إلى ملفك الشخصي، حساباتك اليومية، وتتبع الماء والوزن داخل واجهة عربية أكثر حيوية.
                  </motion.p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Feature title="ملف شخصي ذكي" text="الاسم، العمر، البريد، والوزن الحالي في مكان واحد واضح." accent="amber" />
                  <Feature title="حسابات دقيقة" text="السعرات، BMR، TDEE، والماكروز بخلاصة مرتبة وسريعة." accent="blue" />
                  <Feature title="تتبع سلس" text="الماء والوزن والتقدم الأسبوعي أو الشهري بطريقة نظيفة." accent="green" />
                </div>
              </div>

              <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
                <SocialProofCard label="الوضوح" value="+" hint="واجهة مرتبة تركّز على ما يهم المستخدم." />
                <SocialProofCard label="التفاعل" value="∞" hint="حركات خفيفة ومرونة في التنقل بين الأجزاء." />
                <SocialProofCard label="الأناقة" value="24/7" hint="هوية داكنة ولمسات زجاجية احترافية." />
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/18 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <motion.div
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08, duration: 0.4 }}
                className="flex items-center justify-between gap-3"
              >
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/75">ابدأ من هنا</div>
                  <div className="mt-2 text-2xl font-black text-white">{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{helperText}</div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl sm:flex"
                >
                  ✦
                </motion.div>
              </motion.div>

              <div className="mt-6 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold text-white/70 shadow-inner shadow-black/20">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setMode('signIn')}
                    className={`relative overflow-hidden rounded-full px-4 py-3 transition ${!isSignUp ? 'text-black' : 'text-white/80'}`}
                  >
                    {!isSignUp ? <motion.div layoutId="auth-active-pill" className="absolute inset-0 rounded-full bg-amber-400" /> : null}
                    <span className="relative">تسجيل الدخول</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signUp')}
                    className={`relative overflow-hidden rounded-full px-4 py-3 transition ${isSignUp ? 'text-black' : 'text-white/80'}`}
                  >
                    {isSignUp ? <motion.div layoutId="auth-active-pill" className="absolute inset-0 rounded-full bg-amber-400" /> : null}
                    <span className="relative">إنشاء حساب</span>
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit({ email, password, fullName, mode })
                  }}
                >
                  {isSignUp ? (
                    <div>
                      <Label>الاسم الكامل</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="اكتب اسمك كما تحب ظهوره"
                        autoComplete="name"
                      />
                    </div>
                  ) : null}

                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <Label>كلمة السر</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/45">
                    <span>تصميم متدرج مع تفاعل بصري</span>
                    <span>آمن ومرن</span>
                  </div>

                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-7 text-red-100"
                    >
                      {error}
                    </motion.div>
                  ) : null}

                  {message ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-7 text-emerald-100"
                    >
                      {message}
                    </motion.div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="group w-full overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? 'جارٍ التنفيذ...' : ctaLabel}
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-base"
                      >
                        ↗
                      </motion.span>
                    </span>
                  </Button>
                </motion.form>
              </AnimatePresence>

              <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/35">
                <div className="h-px flex-1 bg-white/10" />
                أو
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                <Button type="button" variant="secondary" onClick={onGoogle} disabled={loading} className="w-full">
                  المتابعة عبر جوجل
                </Button>
              </motion.div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                  يظهر لك بعد الدخول ملفك الشخصي ولوحة المتابعة مباشرة.
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                  يمكنك التبديل بين الوضع الليلي والنهاري من داخل اللوحة.
                </div>
              </div>

              <p className="mt-5 text-center text-sm leading-7 text-white/48">© جميع الحقوق محفوظة 2026</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
