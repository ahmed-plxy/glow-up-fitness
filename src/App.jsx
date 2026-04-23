import React, { useEffect, useState } from 'react'
import AuthCard from './components/AuthCard'
import AppShell from './components/AppShell'
import { supabase, supabaseConfigReady } from './lib/supabase'

const STORAGE_THEME = 'glow-theme'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [mode, setMode] = useState('signIn')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return window.localStorage.getItem(STORAGE_THEME) || 'dark'
  })

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    window.localStorage.setItem(STORAGE_THEME, theme)
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
        options: {
          redirectTo: window.location.origin,
        },
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
    setMessage('تم تسجيل الخروج.')
  }

  if (!supabaseConfigReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl w-full max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/80">إعدادات غير مكتملة</div>
          <h1 className="mt-4 text-3xl font-black">متغيرات المصادقة غير موجودة</h1>
          <p className="mt-3 text-sm leading-7 text-white/70">أضف عنوان المشروع والمفتاح العام داخل البيئة المحلية أو الاستضافة حتى تعمل صفحة الدخول.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl flex w-full max-w-md items-center justify-center">
          <div className="animate-pulse text-lg font-bold text-white/80">جارٍ التحقق من الجلسة...</div>
        </div>
      </div>
    )
  }

  return session ? (
    <AppShell session={session} theme={theme} setTheme={setTheme} onLogout={handleLogout} />
  ) : (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 text-white sm:px-6 lg:px-8">
      <AuthCard mode={mode} setMode={setMode} loading={authLoading} onSubmit={handleEmailAuth} onGoogle={handleGoogleAuth} error={error} message={message} />
    </div>
  )
}
