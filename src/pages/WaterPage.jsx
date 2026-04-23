import React, { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buildWaterSeries, calculateWaterNeed, formatArabicNumber, formatShortDate } from '../lib/fitness'
import { CARD, MetricCard, PageShell } from '../lib/ui'
import { addWaterIntake, resetWaterToday } from '../lib/userData'

export default function WaterPage({ user, profile, waterLog, setWaterLog }) {
  const target = calculateWaterNeed(profile)
  const today = new Date().toISOString().slice(0, 10)
  const todayAmount = waterLog.find((entry) => entry.date === today)?.amount || 0
  const percent = target ? Math.min(100, Math.round((todayAmount / target) * 100)) : 0
  const series = useMemo(() => buildWaterSeries(waterLog, 7), [waterLog])

  return (
    <PageShell
      title="الماء اليومي"
      subtitle="يتم حساب الاحتياج اليومي للماء بصورة إرشادية بناءً على الوزن والعمر والنوع ومستوى النشاط، ثم يظهر لك التقدم اليومي بشكل واضح وقابل للمتابعة."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className={`${CARD} p-6 sm:p-7`}>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="الاحتياج اليومي" value={`${formatArabicNumber(target)} مل`} hint="رقم تقديري متغير حسب البيانات." accent="blue" />
            <MetricCard label="المشروب اليومي" value={`${formatArabicNumber(todayAmount)} مل`} hint="ما أُضيف اليوم حتى الآن." accent="emerald" />
            <MetricCard label="النسبة المنجزة" value={`${formatArabicNumber(percent)}%`} hint="مقارنة بالهدف اليومي." accent="amber" />
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/20 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">شريط التقدم</div>
                <div className="mt-1 text-xl font-black text-white">{formatArabicNumber(todayAmount)} / {formatArabicNumber(target)} مل</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-bold text-white/80">{user?.email ? 'الحساب متصل' : '—'}</div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {[250, 500, 750].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setWaterLog(addWaterIntake(user.id, amount))}
                  className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  + {formatArabicNumber(amount)} مل
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWaterLog(resetWaterToday(user.id))}
                className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/15"
              >
                تصفير اليوم
              </button>
            </div>
          </div>
        </div>

        <div className={`${CARD} p-6 sm:p-7`}>
          <div className="text-lg font-black text-white">خريطة الأسبوع</div>
          <div className="mt-2 text-sm leading-7 text-white/65">يعرض هذا المخطط كمية الماء خلال الأيام السبعة الأخيرة بالمقارنة مع يومك الحالي.</div>
          <div className="mt-5 h-80 rounded-[1.75rem] border border-white/10 bg-black/20 p-3 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="rgba(255,255,255,.5)" tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,.5)" tickFormatter={(v) => `${v}`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 12, 18, .92)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: '18px',
                    color: '#fff',
                  }}
                  labelFormatter={(label) => formatShortDate(label)}
                  formatter={(value) => [`${formatArabicNumber(value)} مل`, 'الماء']}
                />
                <Bar dataKey="الماء" radius={[14, 14, 0, 0]}>
                  {series.map((entry, index) => (
                    <Cell key={`cell-${entry.date}`} fill={index === series.length - 1 ? 'rgba(245, 158, 11, .95)' : 'rgba(56, 189, 248, .75)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 space-y-3">
            {waterLog.slice(-5).reverse().map((entry) => (
              <div key={`${entry.date}-${entry.amount}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white/75">
                <span>{formatShortDate(entry.date)}</span>
                <span className="font-bold text-white">{formatArabicNumber(entry.amount)} مل</span>
              </div>
            ))}
            {!waterLog.length ? <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/55">لم يتم تسجيل أي ماء بعد.</div> : null}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
