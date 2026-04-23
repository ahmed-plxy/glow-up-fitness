import React, { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigReady } from './supabaseClient'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import MainShell from './pages/MainShell'
import { getTheme, setTheme, loadOnboardingState, saveOnboardingState, loadProfile, saveProfile } from './lib/storage'

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  document.body.setAttribute('data-theme', theme)
  setTheme(theme)
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [mode, setMode] = useState('signIn')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [theme, setThemeState] = useState(() => getTheme())
  const [stage, setStage] = useState('auth')
  const [initialProfile, setInitialProfile] = useState({})

  const userId = useMemo(() => session?.user?.id || session?.user?.email || 'guest', [session])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

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
        if (sessionError) setError(sessionError.message)
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

  useEffect(() => {
    if (!session) {
      setStage('auth')
      return
    }

    const storedOnboarding = loadOnboardingState(userId, null)
    const storedProfile = loadProfile(userId, {})
    const completed = storedOnboarding?.onboardingCompleted || storedProfile?.onboardingCompleted

    if (completed) {
      setStage('main')
      setInitialProfile({ ...storedProfile, ...storedOnboarding })
    } else {
      setStage('onboarding')
      setInitialProfile({
        ...storedProfile,
        ...storedOnboarding,
        name: storedProfile?.name || session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'مستخدم',
      })
    }
  }, [session, userId])

  const toggleTheme = () => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }

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
          setMessage('تم إنشاء الحساب. راجع البريد إذا كان التفعيل مطلوبًا.')
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
        options: { redirectTo: window.location.origin },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      setError(err?.message || 'تعذر بدء تسجيل الدخول عبر جوجل.')
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setStage('auth')
    setMessage('تم تسجيل الخروج.')
  }

  const handleOnboardingComplete = (profile) => {
    const userKey = userId
    saveProfile(userKey, { ...profile, onboardingCompleted: true })
    saveOnboardingState(userKey, { ...profile, onboardingCompleted: true })
    setInitialProfile(profile)
    setStage('main')
  }

  const handleBackToAuth = async () => {
    await handleLogout()
  }

  if (!supabaseConfigReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#ffe896]/80">الإعدادات ناقصة</div>
          <h1 className="mt-4 text-3xl font-black">متغيرات الربط غير مكتملة</h1>
          <p className="mt-3 text-sm leading-7 text-white/70">
            أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في البيئة المحلية أو ملف .env.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
        <div className="flex w-full max-w-md items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <div className="animate-pulse text-lg font-bold text-white/80">جارٍ التحقق من الجلسة...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <AuthPage
        key="auth"
        mode={mode}
        setMode={setMode}
        loading={authLoading}
        onSubmit={handleEmailAuth}
        onGoogle={handleGoogleAuth}
        error={error}
        message={message}
      />
    )
  }

  if (stage === 'onboarding') {
    return <OnboardingPage user={session.user} onComplete={handleOnboardingComplete} onBackToAuth={handleBackToAuth} />
  }

  return (
    <MainShell
      key={session?.user?.id || 'main'}
      session={session}
      initialProfile={initialProfile}
      onLogout={handleLogout}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  )
}
