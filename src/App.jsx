import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, supabaseConfigReady } from './supabaseClient'

const CARD = 'rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl'
const FIELD = 'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20'

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{label}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-white/65">{hint}</div>
    </div>
  )
}

function Feature({ title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="text-lg font-bold text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-white/65">{text}</div>
    </div>
  )
}

function AuthCard({ mode, setMode, loading, onSubmit, onGoogle, error, message }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`w-full max-w-5xl overflow-hidden ${CARD}`}
    >
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-10">
          <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-amber-200">
            GLOW UP FITNESS 
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">
           مرحبا بك في Glpw Up Fittness 
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
          يمكنك تسجيل الدخول او  انشاء حساب جديد عن طريق البريد الالكتروني او جوجل
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Feature title="حساب احتياجك اليومي" text="يمكنك حساب احتياجك اليومي من الغذاء والسعرات حسب عمرك وجسمك" />
            <Feature title="متابعة تقدمك الاسبوعي" text="يمكنك متابعة تقدمك الاسبوعي عن طريق لوحة بيانات ذكية" />
            <Feature title="تتبع شرب المياه " text="يمكنك تتبع شربك للمياه علي مدار اليوم" />
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/20 p-7 sm:p-10 lg:border-l lg:border-t-0">
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold text-white/70">
            <button
              type="button"
              onClick={() => setMode('signIn')}
              className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'signIn' ? 'bg-amber-400 text-black' : ''}`}
            >
              تسجيل دخول
            </button>
            <button
              type="button"
              onClick={() => setMode('signUp')}
              className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'signUp' ? 'bg-amber-400 text-black' : ''}`}
            >
              إنشاء حساب
            </button>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit({ email, password, fullName, mode })
            }}
          >
            {mode === 'signUp' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">الاسم</label>
                <input
                  className={FIELD}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="اسمك الكامل"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">البريد الإلكتروني</label>
              <input
                className={FIELD}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">كلمة السر</label>
              <input
                className={FIELD}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة السر"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-7 text-red-100">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-7 text-emerald-100">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-amber-400 px-5 py-3.5 text-sm font-black text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'جارٍ التنفيذ...' : mode === 'signIn' ? 'دخول' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/35">
            <div className="h-px flex-1 bg-white/10" />
            أو
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
           المتابعة عن طريق  Google
          </button>

          <p className="mt-5 text-sm leading-7 text-white/55">
          © كل الحقوق محفوظة 2026
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function AppShell({ session, onLogout }) {
  const user = session?.user
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Guest'
  const email = user?.email || ''

  const cards = useMemo(
    () => [
      { label: 'حالة الحساب', value: 'Active', hint: 'الجلسة الحالية متصلة بـ Supabase Auth.' },
      { label: 'الواجهة', value: 'Protected', hint: 'الصفحات الداخلية لا تظهر إلا بعد تسجيل الدخول.' },
      { label: 'الربط', value: 'Ready', hint: 'Vercel + Supabase + React أصبحت متصلة من الكود.' },
    ],
    [],
  )

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-6">
        <header className={`${CARD} flex items-center justify-between gap-4 px-6 py-5`}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/80">Glow Up Fitness</div>
            <div className="mt-1 text-xl font-black">{displayName}</div>
            <div className="text-sm text-white/60">{email}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            تسجيل الخروج
          </button>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className={`${CARD} p-7 sm:p-10`}>
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-emerald-100">
              SESSION CONNECTED
            </div>
            <h2 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">الموقع جاهز الآن بعد تسجيل الدخول.</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
              من هنا تقدر تربط الصفحات الأصلية بتاعة الجيم والداش بورد بالمستخدم الحالي، أو تكمّل على نفس البنية دي كواجهة محمية.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {cards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className={`${CARD} p-7`}>
              <h3 className="text-lg font-bold">الخطوة التالية في المشروع</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">
                لو عايز تربط بيانات الوجبات والوزن والماء بحساب المستخدم نفسه، يبقى لازم ننقل التخزين من localStorage إلى جداول Supabase.
              </p>
            </section>

            <section className={`${CARD} p-7`}>
              <h3 className="text-lg font-bold">حالة الربط</h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                <div>• Email auth: شغال من Supabase.</div>
                <div>• Google OAuth: جاهز من الكود، بشرط التفعيل في Supabase.</div>
                <div>• Vercel env: متسجل باسم VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.</div>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [mode, setMode] = useState('signIn')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!mounted) return
        if (sessionError) {
          setError(sessionError.message)
        }
        setSession(data.session ?? null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const handleEmailAuth = async ({ email, password, fullName, mode: selectedMode }) => {
    if (!supabase) return
    setError('')
    setMessage('')
    setAuthLoading(true)

    try {
      if (selectedMode === 'signUp') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: fullName ? { full_name: fullName } : undefined,
            emailRedirectTo: window.location.origin,
          },
        })

        if (signUpError) throw signUpError

        if (data.session) {
          setSession(data.session)
          setMessage('تم إنشاء الحساب والدخول مباشرة.')
        } else {
          setMessage('تم إنشاء الحساب. راجع البريد إذا كان Supabase يطلب تأكيد الإيميل.')
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        setSession(data.session)
        setMessage('تم تسجيل الدخول بنجاح.')
      }
    } catch (err) {
      setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    if (!supabase) return
    setError('')
    setMessage('')
    setAuthLoading(true)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })

      if (oauthError) throw oauthError
    } catch (err) {
      setError(err?.message || 'تعذر بدء تسجيل الدخول عبر Google.')
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setMessage('تم تسجيل الخروج.')
  }

  if (!supabaseConfigReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
        <div className={`${CARD} w-full max-w-2xl p-8`}>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/80">Configuration missing</div>
          <h1 className="mt-4 text-3xl font-black">متغيرات Supabase غير مكتملة</h1>
          <p className="mt-3 text-sm leading-7 text-white/70">
            لازم تضيف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY داخل Vercel أو ملف .env المحلي.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
        <div className={`${CARD} flex w-full max-w-md items-center justify-center p-8`}>
          <div className="animate-pulse text-lg font-bold text-white/80">جارٍ التحقق من الجلسة...</div>
        </div>
      </div>
    )
  }

  return session ? (
    <AppShell session={session} onLogout={handleLogout} />
  ) : (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 text-white sm:px-6 lg:px-8">
      <AuthCard
        mode={mode}
        setMode={setMode}
        loading={authLoading}
        onSubmit={handleEmailAuth}
        onGoogle={handleGoogleAuth}
        error={error}
        message={message}
      />
    </div>
  )
}
