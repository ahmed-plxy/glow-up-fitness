import React from 'react'

export const CARD = 'rounded-[1.75rem] border border-white/10 bg-white/6 shadow-2xl shadow-black/20 backdrop-blur-xl'
export const SOFT = 'rounded-3xl border border-white/10 bg-white/6 backdrop-blur-xl'
export const FIELD = 'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20'

export function cn(...items) {
  return items.filter(Boolean).join(' ')
}

export function formatDelta(value) {
  const number = Number(value) || 0
  const sign = number > 0 ? '+' : ''
  return `${sign}${Math.abs(number)}`
}

export function SectionTitle({ eyebrow, title, text }) {
  return (
    <div>
      {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">{eyebrow}</div> : null}
      <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h2>
      {text ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">{text}</p> : null}
    </div>
  )
}

export function MetricCard({ label, value, hint, accent = 'amber' }) {
  const accents = {
    amber: 'from-amber-400/25 to-transparent',
    emerald: 'from-emerald-400/20 to-transparent',
    blue: 'from-sky-400/20 to-transparent',
    rose: 'from-rose-400/20 to-transparent',
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className={cn('absolute inset-x-0 top-0 h-16 bg-gradient-to-b', accents[accent] || accents.amber)} />
      <div className="relative">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{label}</div>
        <div className="mt-3 text-3xl font-black text-white">{value}</div>
        <div className="mt-2 text-sm leading-6 text-white/65">{hint}</div>
      </div>
    </div>
  )
}

export function PageShell({ title, subtitle, children, actions }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle title={title} text={subtitle} />
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
