import React from 'react'

export function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, description, align = 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      {eyebrow ? (
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">{eyebrow}</div>
      ) : null}
      <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-7 text-white/65">{description}</p> : null}
    </div>
  )
}

export function Label({ children }) {
  return <label className="mb-2 block text-sm font-medium text-white/80">{children}</label>
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 ${props.className || ''}`}
    />
  )
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 ${props.className || ''}`}
    />
  )
}

export function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      {hint ? <div className="mt-2 text-sm leading-6 text-white/65">{hint}</div> : null}
    </div>
  )
}

export function Button({ children, className = '', variant = 'primary', ...props }) {
  const styles =
    variant === 'secondary'
      ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
      : 'bg-amber-400 text-black hover:opacity-95'
  return (
    <button
      {...props}
      className={`rounded-2xl px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

export function Pill({ children, tone = 'amber' }) {
  const toneClass =
    tone === 'green'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
      : tone === 'blue'
        ? 'border-sky-400/20 bg-sky-400/10 text-sky-100'
        : 'border-amber-400/20 bg-amber-400/10 text-amber-100'
  return (
    <div className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.2em] ${toneClass}`}>
      {children}
    </div>
  )
}

export function formatDateShort(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar', { month: 'short', day: 'numeric' }).format(date)
}
