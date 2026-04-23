import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CARD, cn } from '../lib/ui'

const FIELD = 'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20'

export default function AuthCard({ mode, setMode, loading, onSubmit, onGoogle, error, message }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`w-full max-w-6xl overflow-hidden ${CARD}`}
    >
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden p-7 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,140,0,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_24%)]" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-amber-100">
              Glow Up Fitness
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">مساحة دخول أنيقة لبدء متابعة الجسم واللياقة.</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">ادخل بالبريد أو أنشئ حسابًا جديدًا، ثم افتح صفحة الملف الشخصي ومحرك السعرات والماء من داخل لوحة واحدة.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <div className="text-lg font-bold text-white">ملف شخصي منظم</div>
                <div className="mt-2 text-sm leading-7 text-white/65">عرض الاسم والسن والبريد والوزن الحالي في مكان واحد.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <div className="text-lg font-bold text-white">تتبع واضح</div>
                <div className="mt-2 text-sm leading-7 text-white/65">مخططات أسبوعية وشهرية توضح التغيير في الوزن والالتزام.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <div className="text-lg font-bold text-white">حسابات دقيقة</div>
                <div className="mt-2 text-sm leading-7 text-white/65">محرك للسعرات والمغذيات الكبرى واحتياج الماء اليومي.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/20 p-7 sm:p-10 lg:border-r lg:border-t-0">
          <div className="flex rounded-full border border-white/10 bg-white/6 p-1 text-sm font-semibold text-white/70">
            <button type="button" onClick={() => setMode('signIn')} className={cn('flex-1 rounded-full px-4 py-2 transition', mode === 'signIn' && 'bg-amber-400 text-black')}>
              تسجيل دخول
            </button>
            <button type="button" onClick={() => setMode('signUp')} className={cn('flex-1 rounded-full px-4 py-2 transition', mode === 'signUp' && 'bg-amber-400 text-black')}>
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
            {mode === 'signUp' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">الاسم</label>
                <input className={FIELD} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اسمك الكامل" autoComplete="name" />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">البريد الإلكتروني</label>
              <input className={FIELD} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="بريدك الإلكتروني" autoComplete="email" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">كلمة السر</label>
              <input className={FIELD} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="أدخل كلمة السر" autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'} />
            </div>

            {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-7 text-red-100">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-7 text-emerald-100">{message}</div> : null}

            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-amber-400 px-5 py-3.5 text-sm font-black text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'جارٍ التنفيذ...' : mode === 'signIn' ? 'دخول' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-white/35">
            <div className="h-px flex-1 bg-white/10" />
            أو
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button type="button" onClick={onGoogle} disabled={loading} className="w-full rounded-2xl border border-white/10 bg-white/6 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
            المتابعة بواسطة جوجل
          </button>

          <p className="mt-5 text-sm leading-7 text-white/55">© كل الحقوق محفوظة 2026</p>
        </div>
      </div>
    </motion.div>
  )
}
