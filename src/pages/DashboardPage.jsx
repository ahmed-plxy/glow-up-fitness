import React from 'react'
import { Button, GlassCard, Pill } from '../components/ui'
import ProfilePage from '../pages/ProfilePage'
import CaloriesPage from '../pages/CaloriesPage'
import WaterPage from '../pages/WaterPage'

const TABS = [
  { id: 'profile', label: 'الملف الشخصي' },
  { id: 'calories', label: 'السعرات' },
  { id: 'water', label: 'الماء' },
]

export default function DashboardPage({ session, activeTab, setActiveTab, theme, toggleTheme, onLogout }) {
  const user = session?.user
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'مستخدم'
  const email = user?.email || ''

  return (
    <div className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">جلو آب فيتنس</div>
              <div className="mt-1 text-2xl font-black text-white">{displayName}</div>
              <div className="text-sm text-white/60">{email}</div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={toggleTheme}>
                {theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              </Button>
              <Button variant="secondary" onClick={onLogout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeTab === tab.id ? 'bg-amber-400 text-black' : 'border border-white/10 bg-black/20 text-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main>
          {activeTab === 'profile' ? <ProfilePage user={user} /> : null}
          {activeTab === 'calories' ? <CaloriesPage user={user} /> : null}
          {activeTab === 'water' ? <WaterPage user={user} /> : null}
        </main>

        <footer className="pb-2 text-center text-xs tracking-[0.18em] text-white/35">
          لوحة متابعة شخصية داخلية محمية بعد تسجيل الدخول
        </footer>
      </div>
    </div>
  )
}
