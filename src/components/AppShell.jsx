import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { calculateBmr, calculateTargetCalories, calculateWaterNeed, formatArabicNumber, getDefaultProfile, getLatestWeight } from '../lib/fitness'
import { CARD, cn } from '../lib/ui'
import { loadProfile, loadWaterLog, loadWeightLog, saveProfile } from '../lib/userData'
import ProfilePage from '../pages/ProfilePage'
import CaloriesPage from '../pages/CaloriesPage'
import WaterPage from '../pages/WaterPage'

const navigation = [
  { id: 'profile', label: 'الملف الشخصي' },
  { id: 'calories', label: 'محرك السعرات' },
  { id: 'water', label: 'الماء اليومي' },
]

function LoadingCard({ text }) {
  return (
    <div className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl items-center justify-center">
        <div className={`${CARD} flex items-center justify-center p-8 text-lg font-bold text-white/80`}>{text}</div>
      </div>
    </div>
  )
}

export default function AppShell({ session, theme, setTheme, onLogout }) {
  const user = session?.user
  const [page, setPage] = useState('profile')
  const [profile, setProfile] = useState(getDefaultProfile(user))
  const [weightLog, setWeightLog] = useState([])
  const [waterLog, setWaterLog] = useState([])
  const [loadedUserId, setLoadedUserId] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    setLoadedUserId(null)
    const nextProfile = loadProfile(user.id, getDefaultProfile(user))
    setProfile(nextProfile)
    setWeightLog(loadWeightLog(user.id))
    setWaterLog(loadWaterLog(user.id))
    setLoadedUserId(user.id)
  }, [user?.id])

  useEffect(() => {
    if (!user?.id || loadedUserId !== user.id) return
    saveProfile(user.id, profile)
  }, [profile, user?.id, loadedUserId])

  const currentWeight = getLatestWeight(profile.weight, weightLog)
  const bmr = calculateBmr(profile)
  const targetCalories = calculateTargetCalories(profile)
  const waterNeed = calculateWaterNeed(profile)

  const navCards = [
    { label: 'الوزن الحالي', value: `${formatArabicNumber(currentWeight)} كجم` },
    { label: 'السعرات المستهدفة', value: `${formatArabicNumber(targetCalories)} سعرة` },
    { label: 'احتياج الماء', value: `${formatArabicNumber(waterNeed)} مل` },
    { label: 'معدل الأيض', value: `${formatArabicNumber(bmr)} سعرة` },
  ]

  if (!user) return <LoadingCard text="جارٍ تجهيز الصفحة الشخصية..." />

  if (loadedUserId !== user.id) return <LoadingCard text="جارٍ تجهيز الصفحة الشخصية..." />

  return (
    <div className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col gap-6">
        <header className={`${CARD} flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between`}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/80">جلو أب فيتنس</div>
            <div className="mt-1 text-2xl font-black leading-tight">{profile.name || user.email?.split('@')[0] || '—'}</div>
            <div className="text-sm text-white/60">{user.email}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className="rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {theme === 'dark' ? 'النهار' : 'الليل'}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          {navCards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{card.label}</div>
              <div className="mt-2 text-2xl font-black text-white">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[250px_1fr]">
          <aside className={`${CARD} p-4`}>
            <div className="grid gap-2 lg:block">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage(item.id)}
                  className={cn(
                    'w-full rounded-2xl px-4 py-4 text-right text-sm font-bold transition',
                    page === item.id ? 'bg-amber-400 text-black' : 'border border-white/10 bg-white/6 text-white/75 hover:bg-white/10',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-3xl border border-white/10 bg-black/15 p-4 text-sm leading-7 text-white/65">
              <div className="font-bold text-white">ملاحظات الحساب</div>
              <div className="mt-2">كل البيانات غير المرتبطة بالمصادقة تُحفظ داخل المتصفح لهذا الحساب فقط، بدون تعديل على ربط الخلفية الحالي.</div>
            </div>
          </aside>

          <main className="min-w-0">
            <AnimatePresence mode="wait">
              {page === 'profile' ? (
                <motion.div key="profile" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                  <ProfilePage user={user} profile={profile} setProfile={setProfile} weightLog={weightLog} setWeightLog={setWeightLog} onSaveProfile={() => saveProfile(user.id, profile)} />
                </motion.div>
              ) : null}
              {page === 'calories' ? (
                <motion.div key="calories" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                  <CaloriesPage profile={profile} />
                </motion.div>
              ) : null}
              {page === 'water' ? (
                <motion.div key="water" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                  <WaterPage user={user} profile={profile} waterLog={waterLog} setWaterLog={setWaterLog} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
