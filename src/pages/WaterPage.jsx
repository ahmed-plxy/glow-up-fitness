import React, { useMemo, useState } from 'react'
import { GlassCard, Input, Label, Pill, SectionTitle, StatTile, Button, Select, formatDateShort } from '../components/ui'
import { ACTIVITY_OPTIONS, calculateWaterNeed, formatMl } from '../lib/fitness'
import { appendWaterEntry, loadWaterEntries } from '../lib/storage'

export default function WaterPage({ user }) {
  const userId = user?.id || user?.email || 'guest'
  const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'مستخدم'

  const [profile, setProfile] = useState({
    name: fallbackName,
    age: 26,
    gender: 'male',
    weight: 75,
    activity: 'moderate',
  })

  const [amount, setAmount] = useState('250')
  const [entries, setEntries] = useState(() => loadWaterEntries(userId))
  const targetWater = useMemo(() => calculateWaterNeed(profile), [profile])
  const totalToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return entries.filter((entry) => entry.date.slice(0, 10) === today).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
  }, [entries])
  const progress = Math.min(100, Math.round((totalToday / targetWater) * 100))

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  const addWater = () => {
    const numeric = Number(amount)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    const next = appendWaterEntry(userId, { date: new Date().toISOString(), amount: numeric })
    setEntries(next)
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <Pill tone="blue">تتبع الماء</Pill>
        <SectionTitle
          title="الاحتياج اليومي وشريط التقدم"
          description="تقدير يومي للماء بناءً على الوزن والعمر والنوع ومستوى النشاط، مع تسجيل سريع لما شربته اليوم."
        />
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <GlassCard className="p-6 sm:p-8">
          <SectionTitle title="بيانات الحساب" description="تعديل هذه القيم يغيّر الاحتياج اليومي مباشرة." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>الاسم</Label>
              <Input value={profile.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <Label>العمر</Label>
              <Input type="number" min="1" value={profile.age} onChange={(e) => update('age', e.target.value)} />
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={profile.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </Select>
            </div>
            <div>
              <Label>الوزن (كجم)</Label>
              <Input type="number" min="1" step="0.1" value={profile.weight} onChange={(e) => update('weight', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>مستوى النشاط</Label>
              <Select value={profile.activity} onChange={(e) => update('activity', e.target.value)}>
                {ACTIVITY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <StatTile label="الاحتياج اليومي" value={formatMl(targetWater)} hint="قيمة تقديرية عملية تناسب الاستخدام اليومي." />
          <StatTile label="المشروب اليوم" value={formatMl(totalToday)} hint={`تم شرب ${progress}% من الهدف حتى الآن.`} />
        </div>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <SectionTitle title="تسجيل سريع" description="أضف كمية الماء التي شربتها الآن ليُحسب التقدم تلقائيًا." />
        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <Label>الكمية بالملليلتر</Label>
            <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={addWater} className="w-full sm:w-auto">
              إضافة
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>التقدم اليومي</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-8">
        <SectionTitle title="آخر السجلات" description="كل عملية إضافة تظهر هنا مباشرة." />
        <div className="mt-6 space-y-3">
          {entries.slice(0, 6).map((entry) => (
            <div key={`${entry.date}-${entry.amount}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-white">{formatDateShort(entry.date)}</div>
                <div className="text-sm font-black text-amber-100">{formatMl(entry.amount)}</div>
              </div>
            </div>
          ))}
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/55">
              لا توجد عمليات شرب مسجلة بعد.
            </div>
          ) : null}
        </div>
      </GlassCard>
    </div>
  )
}
