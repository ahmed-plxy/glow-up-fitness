import React from 'react'
import { activityLevels, calculateBmr, calculateMacros, calculateTargetCalories, calculateTdee, goals } from '../lib/fitness'
import { CARD, PageShell, cn } from '../lib/ui'

function StatBlock({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{label}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm leading-7 text-white/65">{hint}</div>
    </div>
  )
}

export default function CaloriesPage({ profile }) {
  const bmr = calculateBmr(profile)
  const tdee = calculateTdee(profile)
  const target = calculateTargetCalories(profile)
  const macros = calculateMacros(profile)
  const percent = tdee ? Math.max(0, Math.min(100, Math.round((target / tdee) * 100))) : 0

  return (
    <PageShell
      title="محرك السعرات"
      subtitle="يحسب معدل الأيض الأساسي ثم الاحتياج اليومي الكلي ويحوّله إلى هدف مناسب بحسب الحالة المختارة، مع توزيع واضح للمغذيات الكبرى بشكل عملي ومختصر."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="grid gap-4 md:grid-cols-3">
              <StatBlock label="معدل الأيض" value={`${bmr}`} hint="السعرات الأساسية اللازمة للجسم أثناء الراحة." />
              <StatBlock label="الاحتياج اليومي" value={`${tdee}`} hint="السعرات المتوقعة حسب مستوى النشاط." />
              <StatBlock label="الهدف النهائي" value={`${target}`} hint="الرقم الذي تقترحه المنصة للحالة الحالية." />
            </div>
          </div>

          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">عداد السعرات</div>
                <div className="mt-2 text-4xl font-black text-white">{target} <span className="text-base font-semibold text-white/55">سعرة</span></div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-bold text-white/80">{profile.goal || '—'}</div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-orange-300" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-white/55">
              <span>نسبة الهدف مقارنة بالاحتياج</span>
              <span>{percent}%</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="text-lg font-black text-white">المغذيات الكبرى</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">البروتين</div>
                <div className="mt-3 text-3xl font-black text-white">{macros.protein} غ</div>
                <div className="mt-2 text-sm leading-7 text-white/65">أساس الحفاظ على الكتلة العضلية.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">الدهون</div>
                <div className="mt-3 text-3xl font-black text-white">{macros.fat} غ</div>
                <div className="mt-2 text-sm leading-7 text-white/65">كمية متوازنة لدعم الهرمونات.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">الكربوهيدرات</div>
                <div className="mt-3 text-3xl font-black text-white">{macros.carbs} غ</div>
                <div className="mt-2 text-sm leading-7 text-white/65">تملأ ما تبقى من السعرات المستهدفة.</div>
              </div>
            </div>
          </div>

          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="text-lg font-black text-white">تفاصيل الحساب</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/70">
              {activityLevels.map((item) => (
                <div key={item.value} className={cn('flex items-center justify-between rounded-2xl border px-4 py-3', profile.activity === item.value ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-white/10 bg-black/15 text-white/75')}>
                  <span>مستوى {item.label}</span>
                  <span className="font-bold">× {item.factor}</span>
                </div>
              ))}
              {goals.map((item) => (
                <div key={item.value} className={cn('flex items-center justify-between rounded-2xl border px-4 py-3', profile.goal === item.value ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-white/10 bg-black/15 text-white/75')}>
                  <span>{item.label}</span>
                  <span className="font-bold">{Math.round(item.factor * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
