import React from 'react'
import { Sparkles, Trophy, ShieldCheck, Target, Flame, MessageSquareMore } from 'lucide-react'
import { Button, GlassCard, Pill, SectionTitle, StatTile } from '../../components/ui'
import { CHALLENGES_LIBRARY, WEEKLY_SUMMARY_TEMPLATES } from '../../data/extendedLibrary'

export default function CommunityBoard({ weeklySummary }) {
  return (
    <GlassCard className="p-5 sm:p-6">
      <SectionTitle
        title="لوحة التحديات والإنجاز"
        description="شكل اجتماعي خفيف يخلّي الموقع حيّ، فيه شارات، streak، ورسائل تحفيزية."
        icon={Trophy}
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatTile label="الالتزام" value={weeklySummary?.adherence || '0 / 7'} hint="أيام نشطة هذا الأسبوع" icon={ShieldCheck} accent="blue" />
          <StatTile label="تغير الوزن" value={weeklySummary?.weightDelta || '0.0 كجم'} hint="من أول لأخر سجل" icon={Target} accent="green" />
          <StatTile label="المتوسط" value={weeklySummary?.calorieAvg || '0'} hint="سعرات يومية تقريبًا" icon={Flame} accent="amber" />
          <StatTile label="روح المنافسة" value="عالية" hint="تجربة تفاعلية" icon={Sparkles} accent="rose" />
        </div>

        <div className="space-y-3">
          {CHALLENGES_LIBRARY.map((challenge) => (
            <div key={challenge.id} className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-black text-white">{challenge.title}</div>
                  <div className="mt-1 text-sm leading-6 text-white/60">{challenge.description}</div>
                </div>
                <Pill>{challenge.reward}</Pill>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
        <div className="text-sm font-bold text-white">رسالة الأسبوع</div>
        <div className="mt-2 text-sm leading-7 text-white/64">
          {WEEKLY_SUMMARY_TEMPLATES[0]} {WEEKLY_SUMMARY_TEMPLATES[1]} {WEEKLY_SUMMARY_TEMPLATES[2]}
        </div>
        <Button className="mt-4" leftIcon={MessageSquareMore}>
          مشاركة الإنجاز
        </Button>
      </div>
    </GlassCard>
  )
}
