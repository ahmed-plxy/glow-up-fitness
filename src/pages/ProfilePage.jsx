import React, { useEffect, useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { activityLevels, buildWeightSeries, formatArabicNumber, formatShortDate, genders, getLatestWeight, goals } from '../lib/fitness'
import { CARD, FIELD, MetricCard, PageShell, cn } from '../lib/ui'
import { addWeightEntry } from '../lib/userData'

export default function ProfilePage({ user, profile, setProfile, weightLog, setWeightLog, onSaveProfile }) {
  const [chartSpan, setChartSpan] = useState('weekly')
  const [newWeight, setNewWeight] = useState(profile.weight?.toString() || '')

  useEffect(() => {
    setNewWeight(profile.weight?.toString() || '')
  }, [profile.weight])

  const currentWeight = getLatestWeight(profile.weight, weightLog)
  const startWeight = weightLog.length ? weightLog[0].weight : currentWeight
  const delta = currentWeight - startWeight
  const chartData = useMemo(() => buildWeightSeries(weightLog, chartSpan === 'weekly' ? 7 : 30), [weightLog, chartSpan])
  const hasLogs = weightLog.length > 0

  const summaryCards = [
    { label: 'الاسم', value: profile.name || '—', hint: 'الاسم الظاهر داخل الصفحة.' },
    { label: 'البريد', value: user?.email || '—', hint: 'الحساب المرتبط بالمصادقة.' },
    { label: 'الوزن الحالي', value: `${formatArabicNumber(currentWeight)} كجم`, hint: hasLogs ? `التغير منذ أول تسجيل: ${delta > 0 ? '+' : delta < 0 ? '-' : ''}${formatArabicNumber(Math.abs(delta))} كجم` : 'يمكنك تسجيل أول وزن الآن.' },
    { label: 'العمر', value: profile.age ? `${formatArabicNumber(profile.age)} سنة` : '—', hint: 'يستخدم في الحسابات.' },
  ]

  return (
    <PageShell
      title="الملف الشخصي"
      subtitle="كل بياناتك الأساسية هنا: الاسم والعمر والبريد والوزن، مع حفظ القيم محليًا لكل حساب وواجهة تتبع بسيطة للمتابعة الأسبوعية والشهرية."
      actions={[
        <button key="save" type="button" onClick={onSaveProfile} className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-black text-black">
          حفظ التغييرات
        </button>,
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <MetricCard key={card.label} {...card} />
              ))}
            </div>
          </div>

          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">الاسم</label>
                <input className={FIELD} value={profile.name} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} placeholder="الاسم الكامل" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">العمر</label>
                <input className={FIELD} type="number" min="10" max="100" value={profile.age} onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value }))} placeholder="العمر" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">الوزن الحالي</label>
                <input className={FIELD} type="number" min="20" max="300" step="0.1" value={profile.weight} onChange={(e) => setProfile((prev) => ({ ...prev, weight: e.target.value }))} placeholder="كجم" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">الطول</label>
                <input className={FIELD} type="number" min="100" max="230" value={profile.height} onChange={(e) => setProfile((prev) => ({ ...prev, height: e.target.value }))} placeholder="سم" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">النوع</label>
                <select className={FIELD} value={profile.gender} onChange={(e) => setProfile((prev) => ({ ...prev, gender: e.target.value }))}>
                  {genders.map((item) => (
                    <option key={item.value} value={item.value} className="text-black">
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">مستوى النشاط</label>
                <select className={FIELD} value={profile.activity} onChange={(e) => setProfile((prev) => ({ ...prev, activity: e.target.value }))}>
                  {activityLevels.map((item) => (
                    <option key={item.value} value={item.value} className="text-black">
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-white/80">الهدف</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, goal: goal.value }))}
                      className={cn(
                        'rounded-2xl border px-4 py-4 text-right text-sm font-bold transition',
                        profile.goal === goal.value ? 'border-amber-400/40 bg-amber-400/15 text-amber-100' : 'border-white/10 bg-white/6 text-white/75 hover:bg-white/10',
                      )}
                    >
                      <div className="text-base">{goal.label}</div>
                      <div className="mt-1 text-xs font-medium leading-6 text-white/55">
                        {goal.value === 'ضخامة' ? 'زيادة محسوبة في السعرات.' : goal.value === 'تنشيف' ? 'خفض مع الحفاظ على العضلات.' : 'عجز واضح للوصول للوزن.'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-lg font-black text-white">تسجيل الوزن</div>
                <div className="mt-2 text-sm leading-7 text-white/65">كل إدخال جديد يظهر داخل الرسم البياني ويحدث الوزن الحالي تلقائيًا.</div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setChartSpan('weekly')} className={cn('rounded-full px-4 py-2 text-sm font-bold transition', chartSpan === 'weekly' ? 'bg-amber-400 text-black' : 'border border-white/10 bg-white/6 text-white/70')}>
                  أسبوعي
                </button>
                <button type="button" onClick={() => setChartSpan('monthly')} className={cn('rounded-full px-4 py-2 text-sm font-bold transition', chartSpan === 'monthly' ? 'bg-amber-400 text-black' : 'border border-white/10 bg-white/6 text-white/70')}>
                  شهري
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
              <input className={FIELD} type="number" min="20" max="300" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="أدخل وزنك الحالي بالكيلو" />
              <button
                type="button"
                onClick={() => {
                  if (!newWeight) return
                  const next = addWeightEntry(user.id, Number(newWeight))
                  setWeightLog([...next])
                  setProfile((prev) => ({ ...prev, weight: Number(newWeight) }))
                }}
                className="rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-black"
              >
                تسجيل
              </button>
            </div>

            <div className="mt-6 h-80 rounded-[1.75rem] border border-white/10 bg-black/20 p-3 sm:p-4">
              {chartData.some((item) => item.الوزن !== null) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                    <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="rgba(255,255,255,.5)" tickMargin={10} />
                    <YAxis stroke="rgba(255,255,255,.5)" tickFormatter={(v) => `${v}`} domain={["dataMin - 2", "dataMax + 2"]} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(10, 12, 18, .92)',
                        border: '1px solid rgba(255,255,255,.08)',
                        borderRadius: '18px',
                        color: '#fff',
                      }}
                      labelFormatter={(label) => formatShortDate(label)}
                      formatter={(value) => [`${formatArabicNumber(value)} كجم`, 'الوزن']}
                    />
                    <Area type="monotone" dataKey="الوزن" fill="rgba(255, 140, 0, .12)" stroke="none" />
                    <Line type="monotone" dataKey="الوزن" stroke="rgba(255, 140, 0, .95)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/55">أضف أول تسجيل للوزن حتى يظهر الرسم البياني.</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="text-lg font-black text-white">مراجعة سريعة</div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/70">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-3"><span>الجلسة</span><span className="font-bold text-white">{user?.email ? 'نشطة' : '—'}</span></div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-3"><span>آخر تحديث</span><span className="font-bold text-white">{weightLog.length ? formatShortDate(weightLog[weightLog.length - 1].date) : '—'}</span></div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-3"><span>عدد السجلات</span><span className="font-bold text-white">{formatArabicNumber(weightLog.length)}</span></div>
            </div>
          </div>

          <div className={`${CARD} p-6 sm:p-7`}>
            <div className="text-lg font-black text-white">آخر السجلات</div>
            <div className="mt-4 space-y-3">
              {weightLog.slice(-5).reverse().map((entry) => (
                <div key={`${entry.date}-${entry.weight}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white/75">
                  <span>{formatShortDate(entry.date)}</span>
                  <span className="font-bold text-white">{formatArabicNumber(entry.weight)} كجم</span>
                </div>
              ))}
              {!weightLog.length ? <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/55">لا توجد سجلات حتى الآن.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
