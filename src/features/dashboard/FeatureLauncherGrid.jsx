import React from 'react'
import {
  Activity,
  BarChart3,
  Dumbbell,
  Droplets,
  Footprints,
  MoonStar,
  Soup,
  Sparkles,
  Trophy,
  ChevronRight,
} from 'lucide-react'
import { Button, GlassCard } from '../../components/ui'
import { FEATURE_ROOMS } from '../../data/extendedLibrary'

const ICONS = {
  Activity,
  BarChart3,
  Dumbbell,
  Droplets,
  Footprints,
  MoonStar,
  Soup,
  Sparkles,
  Trophy,
}

export default function FeatureLauncherGrid({ onPick }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {FEATURE_ROOMS.map((room) => {
        const Icon = ICONS[room.icon] || Sparkles
        return (
          <GlassCard key={room.id} className="p-4 transition hover:-translate-y-1 hover:bg-white/[0.07]">
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-300">
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full border border-[#ffd64d]/20 bg-[#ffd64d]/10 px-3 py-1 text-[0.68rem] font-bold tracking-[0.2em] text-[#ffe896]">
                {room.highlight}
              </span>
            </div>
            <div className="mt-4 text-xl font-black text-white">{room.title}</div>
            <div className="mt-2 text-sm leading-6 text-white/60">{room.description}</div>
            <div className="mt-4">
              <Button
                variant="secondary"
                className="w-full justify-between"
                rightIcon={ChevronRight}
                onClick={() => onPick?.(room.id)}
              >
                فتح القسم
              </Button>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
