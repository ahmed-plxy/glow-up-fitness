import React, { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts'
import { appendWeightEntry, loadProfile, loadWeightEntries, saveProfile } from '../lib/storage'
import { GlassCard, Input, Label, Pill, SectionTitle, StatTile, Button, Select, formatDateShort } from '../components/ui'
import { GENDER_OPTIONS, ACTIVITY_OPTIONS, formatKg, getLatestWeight } from '../lib/fitness'

function normalizeWeightEntry(entry) {
  return {
    date: entry.date,
    weight: Number(entry.weight),
    note: entry.note || '',
  }
}

export default function ProfilePage({ user }) {
  const userId = user?.id || user?.email || 'guest'
  const email = user?.email || ''
  const fallbackName = user?.user_metadata?.full_name || user?.user_metadata?.name || email.split('@')[0] || 'مستخدم'

  const [profile, setProfile] = useState(() => {
    const stored = loadProfile(userId, {})
    return {
      name: stored.name || fallbackName,
      age: stored.age || '',
      gender: stored.gender || 'male',
      height: stored.height || '',
      weight: stored.weight || '',
      activity: stored.activity || 'moderate',
      ...stored,
    }
  })

  const [weightEntries, setWeightEntries] = useState(() =>
    loadWeightEntries(userId).map(normalizeWeightEntry),
  )
  const [weightInput, setWeightInput] = useState(profile.weight || '')
  const [weightNote, setWeightNote] = useState('')
  const [chartWindow, setChartWindow] = useState('week')

  const currentWeight = useMemo(() => {
    return getLatestWeight(weightEntries, profile.weight)
  }, [weightEntries, profile.weight])

  const previousWeight = weightEntries[1]?.weight ?? null
  const deltaWeight =
    previousWeight !== null && currentWeight !== ''
      ? Number(currentWeight) - Number(previousWeight)
      : 0

  const chartData = useMemo(() => {
    const windowSize = chartWindow === 'month' ? 30 : 7
    return weightEntries
      .slice(0, windowSize)
      .map((entry) => ({
        name: formatDateShort(entry.date),
        الوزن: entry.weight,
      }))
      .reverse()
  }, [weightEntries, chartWindow])

  const weeklyData = useMemo(() => {
    const last7 = weightEntries.slice(0, 7).reverse()
    return last7.map((entry) => ({
      name: formatDateShort(entry.date),
      وزن: entry.weight,
    }))
  }, [weightEntries])

  const saveProfileNow = (nextProfile) => {
    setProfile(nextProfile)
    saveProfile(userId, nextProfile)
  }

  const handleProfileChange = (field, value) => {
    const nextProfile = { ...profile, [field]: value }
    if (field === 'weight' && value !== '') {
      setWeightInput(value)
    }
    saveProfileNow(nextProfile)
  }

  const handleAddWeight = () => {
    const numericWeight = Number(weightInput)
    if (!Number.isFinite(numericWeight) || numericWeight <= 0) return

    const entry = {
      date: new Date().toISOString(),
      weight: numericWeight,
      note: weightNote.trim(),
    }

    const next = appendWeightEntry(userId, entry).map(normalizeWeightEntry)
    setWeightEntries(next)
    saveProfileNow({ ...profile, weight: String(numericWeight) })
    setWeightNote('')
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Pill>الملف الشخصي</Pill>
            <SectionTitle
              title="بيانات المستخدم والمتابعة الشخصية"
              description="هنا تظهر معلومات الحساب والوزن الحالي وسجل القياسات الأسبوعي أو الشهري."
            />
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">البريد المرتبط</div>
            <div className="mt-2 text-base font-bold text-white">{email}</div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <GlassCard className="p-6 sm:p-8">
          <SectionTitle title="البيانات الأساسية" description="غيّر الاسم والعمر والطول والنوع ومستوى النشاط، وسيتم حفظها محليًا لهذا الحساب." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>الاسم</Label>
              <Input value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
            </div>
            <div>
              <Label>العمر</Label>
              <Input type="number" min="1" value={profile.age} onChange={(e) => handleProfileChange('age', e.target.value)} />
            </div>
            <div>
              <Label>الطول (سم)</Label>
              <Input type="number" min="1" value={profile.height} onChange={(e) => handleProfileChange('height', e.target.value)} />
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={profile.gender} onChange={(e) => handleProfileChange('gender', e.target.value)}>
                {GENDER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>مستوى النشاط</Label>
              <Select value={profile.activity} onChange={(e) => handleProfileChange('activity', e.target.value)}>
                {ACTIVITY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <StatTile
            label="الوزن الحالي"
            value={currentWeight ? formatKg(currentWeight) : '—'}
            hint={
              previousWeight !== null && currentWeight !== ''
                ? `آخر تغيير: ${deltaWeight > 0 ? '+' : ''}${deltaWeight.toFixed(1)} كجم مقارنةً بالسجل السابق.`
                : 'أضف أول سجل للوزن لبدء التتبع.'
            }
          />
          <StatTile
            label="عدد السجلات"
            value={`${weightEntries.length}`}
            hint="كل سجل يظل محفوظًا لهذا الحساب داخل المتصفح."
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle title="لوحة تتبع الوزن" description="اختر الأسبوع أو الشهر لمشاهدة التغيّر بصورة أوضح." />
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold text-white/70">
              <button
                type="button"
                onClick={() => setChartWindow('week')}
                className={`rounded-full px-4 py-2 ${chartWindow === 'week' ? 'bg-amber-400 text-black' : ''}`}
              >
                أسبوعي
              </button>
              <button
                type="button"
                onClick={() => setChartWindow('month')}
                className={`rounded-full px-4 py-2 ${chartWindow === 'month' ? 'bg-amber-400 text-black' : ''}`}
              >
                شهري
              </button>
            </div>
          </div>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 14, 20, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: 'white',
                  }}
                />
                <Line type="monotone" dataKey="الوزن" stroke="#F5EBDD" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:p-8">
          <SectionTitle title="إضافة قياس جديد" description="دوّن الوزن الحالي ليُضاف إلى الخلاصة والرسوم فورًا." />
          <div className="mt-6 space-y-4">
            <div>
              <Label>الوزن الحالي</Label>
              <Input type="number" min="1" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
            </div>
            <div>
              <Label>ملاحظة</Label>
              <Input value={weightNote} onChange={(e) => setWeightNote(e.target.value)} placeholder="مثال: بعد التمرين" />
            </div>
            <Button className="w-full" onClick={handleAddWeight}>
              حفظ القياس
            </Button>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">آخر السجلات</div>
            <div className="mt-4 space-y-3">
              {weightEntries.slice(0, 5).map((entry) => (
                <div key={`${entry.date}-${entry.weight}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-white">{formatDateShort(entry.date)}</div>
                    <div className="text-sm font-black text-amber-100">{formatKg(entry.weight)}</div>
                  </div>
                  {entry.note ? <div className="mt-2 text-sm leading-6 text-white/60">{entry.note}</div> : null}
                </div>
              ))}
              {weightEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/55">
                  لا توجد قياسات بعد.
                </div>
              ) : null}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <SectionTitle title="ملخص الحركة" description="مخطط بسيط يوضح القياسات المسجلة خلال الفترة الأخيرة." />
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10, 14, 20, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: 'white',
                }}
              />
              <Bar dataKey="وزن" radius={[14, 14, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  )
}
