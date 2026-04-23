import React from 'react'
import { Activity, Dumbbell, Flame, HeartPulse, TimerReset, Zap } from 'lucide-react'
import { Button, GlassCard, Pill, SectionTitle, StatTile } from '../../components/ui'
import { WORKOUT_SPLITS } from '../../data/extendedLibrary'

export default function WorkoutStudio({ profile, targetCalories }) {
  const trainingLoad = profile.activity === 'active' ? 'عالي' : profile.activity === 'moderate' ? 'متوسط' : 'مبدئي'
  return (
    <GlassCard className="p-5 sm:p-6">
      <SectionTitle
        title="استوديو التمرين"
        description="خطة رياضية كبيرة وواضحة: تقسيم، التزام، واسترجاع سريع للمستوى الأسبوعي."
        icon={Dumbbell}
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="مستوى الحمل" value={trainingLoad} hint="يتبدل حسب نشاطك" icon={Activity} accent="blue" />
            <StatTile label="هدف الطاقة" value={`${targetCalories}`} hint="سعرة يومية" icon={Flame} accent="amber" />
            <StatTile label="إيقاع الجلسة" value="60-75 دقيقة" hint="وقت حصة عملي" icon={TimerReset} accent="green" />
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {WORKOUT_SPLITS.map((split) => (
              <div key={split.day} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300/70">{split.day}</div>
                    <div className="mt-1 text-lg font-black text-white">{split.title}</div>
                  </div>
                  <Pill tone="blue">{split.focus}</Pill>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-white/66">
                  {split.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ffd64d]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-sky-400/12 via-transparent to-[#ffd64d]/10 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">خطة أسرع</div>
            <div className="mt-2 text-2xl font-black text-white">Push / Pull / Legs</div>
            <div className="mt-3 text-sm leading-6 text-white/62">
              اعمل 4 أيام تمرين + يومين مشي + يوم راحة نشطة. هذه الخطة مناسبة لتطوير اللياقة بدون تعقيد.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>قوة</Pill>
              <Pill tone="green">كتلة</Pill>
              <Pill tone="blue">مرونة</Pill>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatTile label="رفع أوزان" value="3-4" hint="جلسات أسبوعيًا" icon={Dumbbell} accent="blue" />
              <StatTile label="كارديو" value="2" hint="جلسات خفيفة" icon={HeartPulse} accent="rose" />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-bold text-white">إشارة الالتزام</div>
            <div className="mt-3 text-sm leading-6 text-white/62">
              بمجرد تكرار التمرين 3 مرات أسبوعيًا تبدأ ترى تغيرًا في اللياقة، المظهر، والمزاج.
            </div>
            <Button className="mt-4 w-full" leftIcon={Zap}>
              فتح روتين اليوم
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
