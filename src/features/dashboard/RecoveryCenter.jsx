import React from 'react'
import { Activity, BellRing, CheckCircle2, MoonStar, Droplets, Footprints, TimerReset, SunMedium } from 'lucide-react'
import { Button, GlassCard, Pill, SectionTitle, StatTile } from '../../components/ui'
import { RECOVERY_PROGRAMS } from '../../data/extendedLibrary'

export default function RecoveryCenter({ settings, weeklySummary }) {
  return (
    <GlassCard className="p-5 sm:p-6">
      <SectionTitle
        title="مركز الاستشفاء والنوم"
        description="كل شيء يجعل الجسم أهدأ: نوم، ماء، حركة خفيفة، وتذكير لطيف."
        icon={MoonStar}
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatTile label="وقت النوم" value={settings?.bedtime || '23:00'} hint="روتين ثابت" icon={MoonStar} accent="blue" />
          <StatTile label="وقت الاستيقاظ" value={settings?.wakeTime || '07:00'} hint="بداية نشيطة" icon={SunMedium} accent="amber" />
          <StatTile label="تقرير أسبوعي" value={settings?.weeklyReportEnabled ? 'مفعل' : 'متوقف'} hint={weeklySummary.adherence || ''} icon={CheckCircle2} accent="green" />
          <StatTile label="تذكير الماء" value={settings?.waterReminders ? 'مفعل' : 'متوقف'} hint="ترطيب مستمر" icon={Droplets} accent="blue" />
        </div>

        <div className="space-y-3">
          {RECOVERY_PROGRAMS.map((item) => (
            <div key={item.id} className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-black text-white">{item.title}</div>
                  <div className="mt-1 text-sm leading-6 text-white/60">{item.description}</div>
                </div>
                <Pill tone="green">{item.icon}</Pill>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Button variant="secondary" leftIcon={BellRing}>تفعيل التنبيهات</Button>
        <Button variant="secondary" leftIcon={Footprints}>دفعة خطوات</Button>
        <Button variant="secondary" leftIcon={TimerReset}>استراحة قصيرة</Button>
      </div>
    </GlassCard>
  )
}
