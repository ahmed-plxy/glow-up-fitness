import React, { useMemo, useState } from 'react'
import { GlassCard, Input, Label, Pill, SectionTitle, StatTile, Button, Select } from '../components/ui'
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  GENDER_OPTIONS,
  calculateBmr,
  calculateMacros,
  calculateTargetCalories,
  calculateTdee,
} from '../lib/fitness'

export default function CaloriesPage({ user }) {
  const userId = user?.id || user?.email || 'guest'
  const initialName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'مستخدم'

  const [state, setState] = useState({
    name: initialName,
    age: 26,
    gender: 'male',
    height: 175,
    weight: 75,
    activity: 'moderate',
    goal: 'maintain',
  })

  const bmr = useMemo(() => calculateBmr(state), [state])
  const tdee = useMemo(() => calculateTdee(bmr, state.activity), [bmr, state.activity])
  const targetCalories = useMemo(() => calculateTargetCalories({ tdee, goal: state.goal }), [tdee, state.goal])
  const macros = useMemo(() => calculateMacros({ calories: targetCalories, weight: state.weight, goal: state.goal }), [targetCalories, state.weight, state.goal])

  const update = (field, value) => setState((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 sm:p-8">
        <Pill>محرك الحساب الذكي</Pill>
        <SectionTitle
          title="السعرات والمغذيات الكبرى"
          description="أدخل بيانات الجسم والنشاط والهدف، وسيظهر لك الاحتياج اليومي والسعرات المستهدفة بشكل واضح."
        />
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <GlassCard className="p-6 sm:p-8">
          <SectionTitle title="البيانات الأساسية" description="هذه القيم هي مدخلات الحساب الأساسية." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>الاسم</Label>
              <Input value={state.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <Label>العمر</Label>
              <Input type="number" min="1" value={state.age} onChange={(e) => update('age', e.target.value)} />
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={state.gender} onChange={(e) => update('gender', e.target.value)}>
                {GENDER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>الطول (سم)</Label>
              <Input type="number" min="1" value={state.height} onChange={(e) => update('height', e.target.value)} />
            </div>
            <div>
              <Label>الوزن (كجم)</Label>
              <Input type="number" min="1" step="0.1" value={state.weight} onChange={(e) => update('weight', e.target.value)} />
            </div>
            <div>
              <Label>مستوى النشاط</Label>
              <Select value={state.activity} onChange={(e) => update('activity', e.target.value)}>
                {ACTIVITY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>الهدف</Label>
              <Select value={state.goal} onChange={(e) => update('goal', e.target.value)}>
                {GOAL_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <StatTile label="السعرات المستهدفة" value={`${targetCalories}`} hint="الرقم الظاهر هو تقدير يومي مبني على الهدف المختار." />
          <StatTile label="معدل الأيض الأساسي" value={`${bmr}`} hint="معدل الأيض الأساسي محسوب بمعادلة علمية معروفة." />
          <StatTile label="الاحتياج اليومي الكلي" value={`${tdee}`} hint="الاحتياج الكلي اليومي يحسب بعد إضافة مستوى النشاط." />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StatTile label="بروتين" value={`${macros.protein} جم`} hint="مناسب للحفاظ على الكتلة العضلية ودعم التحول الجسدي." />
        <StatTile label="كربوهيدرات" value={`${macros.carbs} جم`} hint="الكمية المتبقية بعد حساب البروتين والدهون." />
        <StatTile label="دهون" value={`${macros.fat} جم`} hint="مستوى متوازن لدعم الهرمونات والطاقة." />
      </div>

      <GlassCard className="p-6 sm:p-8">
        <SectionTitle title="خلاصة سريعة" description="هذه الصفحة لا تغيّر أي شيء في الخلفية، لكنها تعطيك خط الأساس الغذائي بدقة عملية." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">الحالة</div>
            <div className="mt-3 text-2xl font-black text-white">جاهز</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">الهوية</div>
            <div className="mt-3 text-2xl font-black text-white">عربية</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">الدقة</div>
            <div className="mt-3 text-2xl font-black text-white">متوازنة</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">الربط</div>
            <div className="mt-3 text-2xl font-black text-white">محلي</div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
