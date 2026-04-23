import React from 'react'
import { ChevronLeft, Check, ArrowRight, LayoutDashboard, Menu, Settings2 } from 'lucide-react'

export function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, description, align = 'right', icon: Icon }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {Icon ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-300">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/80">{eyebrow}</div> : null}
      </div>
      <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-7 text-white/62">{description}</p> : null}
    </div>
  )
}

export function Label({ children }) {
  return <label className="mb-2 block text-sm font-medium text-white/78">{children}</label>
}

function baseFieldClass(extra = '') {
  return `w-full rounded-[1.25rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/20 ${extra}`
}

export function Input(props) {
  return <input {...props} className={baseFieldClass(props.className)} />
}

export function Select(props) {
  return <select {...props} className={baseFieldClass(props.className)} />
}

export function Textarea(props) {
  return <textarea {...props} className={baseFieldClass(props.className)} />
}

export function StatTile({ label, value, hint, accent = 'amber', icon: Icon }) {
  const accentStyle =
    accent === 'blue'
      ? 'from-sky-400/15 via-transparent to-transparent'
      : accent === 'green'
        ? 'from-emerald-400/15 via-transparent to-transparent'
        : accent === 'rose'
          ? 'from-rose-400/15 via-transparent to-transparent'
          : 'from-amber-400/15 via-transparent to-transparent'
  return (
    <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentStyle}`} />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-white/42">{label}</div>
          {Icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/72">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <div className="mt-3 text-3xl font-black text-white">{value}</div>
        {hint ? <div className="mt-2 text-sm leading-6 text-white/62">{hint}</div> : null}
      </div>
    </div>
  )
}

export function Button({ children, className = '', variant = 'primary', leftIcon: LeftIcon, rightIcon: RightIcon, ...props }) {
  const styles =
    variant === 'secondary'
      ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
      : variant === 'ghost'
        ? 'border border-white/8 bg-transparent text-white hover:bg-white/6'
        : 'bg-[#ffd64d] text-black hover:opacity-95 shadow-[0_18px_40px_rgba(255,214,77,0.20)]'
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.99] ${styles} ${className}`}
    >
      {LeftIcon ? <LeftIcon className="h-4 w-4" /> : null}
      <span>{children}</span>
      {RightIcon ? <RightIcon className="h-4 w-4" /> : null}
    </button>
  )
}

export function IconButton({ icon: Icon, className = '', variant = 'ghost', ...props }) {
  const styles =
    variant === 'secondary'
      ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
      : variant === 'danger'
        ? 'border border-rose-500/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15'
        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
  return (
    <button
      {...props}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition active:scale-[0.99] ${styles} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </button>
  )
}

export function Pill({ children, tone = 'amber' }) {
  const toneClass =
    tone === 'green'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
      : tone === 'blue'
        ? 'border-sky-400/20 bg-sky-400/10 text-sky-100'
        : 'border-[#ffd64d]/20 bg-[#ffd64d]/10 text-[#ffe896]'
  return (
    <div className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.22em] ${toneClass}`}>
      {children}
    </div>
  )
}

export function formatDateShort(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar', { month: 'short', day: 'numeric' }).format(date)
}

export function formatTimeShort(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ar', { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function TopBar({ title, subtitle, onBack, progress = 0, stepText, rightSlot, onSettings }) {
  const safeProgress = Math.max(0, Math.min(100, progress))
  const segments = 5
  const active = Math.round((safeProgress / 100) * segments)
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-white/8 bg-[#070b11]/70 px-4 py-4 backdrop-blur-2xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition ${onBack ? 'hover:bg-white/10' : 'pointer-events-none opacity-0'}`}
          aria-label="رجوع"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-[0.66rem] font-semibold uppercase tracking-[0.35em] text-sky-300/65">{stepText || 'Glow Up Fitness'}</div>
          <div className="mt-1 text-lg font-black text-white sm:text-xl">{title}</div>
          {subtitle ? <div className="mt-1 text-xs leading-6 text-white/52 sm:text-sm">{subtitle}</div> : null}
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: segments }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index < active ? 'bg-sky-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex min-w-[44px] items-center justify-end gap-2 text-left">
          {rightSlot || null}
          {onSettings ? (
            <button
              type="button"
              onClick={onSettings}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              aria-label="الإعدادات"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function BottomNav({ items, active, onChange }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#070b11]/85 px-4 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
        {items.map((item) => {
          const isActive = active === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-[1.5rem] px-2 py-3 transition ${isActive ? 'bg-[#ffd64d] text-black' : 'text-white/60 hover:bg-white/6 hover:text-white'}`}
            >
              <div className="mx-auto flex h-8 w-8 items-center justify-center text-base">
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </div>
              <div className="mt-1 text-[0.72rem] font-bold">{item.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ProgressRing({ progress = 0, label, value, hint }) {
  const numeric = Number(progress)
  const safe = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0
  const stroke = 12
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safe / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative h-36 w-36 sm:h-44 sm:w-44">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={radius} strokeWidth={stroke} className="fill-none stroke-white/10" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="fill-none stroke-sky-400 transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full border border-white/10 bg-black/25">
          <div className="text-[0.67rem] font-semibold uppercase tracking-[0.28em] text-white/45">{label}</div>
          <div className="mt-1 text-3xl font-black text-white">{value}</div>
          {hint ? <div className="mt-1 text-xs text-white/50">{hint}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function ChoiceCard({ selected, title, description, onClick, icon: Icon, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-[1.6rem] border p-4 text-right transition active:scale-[0.99] ${
        selected ? 'border-sky-400 bg-sky-400/12 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon ? (
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border ${selected ? 'border-sky-300 bg-sky-400/15 text-sky-200' : 'border-white/10 bg-white/[0.04] text-white/70'}`}>
                <Icon className="h-4 w-4" />
              </span>
            ) : null}
            <div className="text-base font-black text-white">{title}</div>
          </div>
          {description ? <div className="mt-2 text-sm leading-6 text-white/60">{description}</div> : null}
          {badge ? <div className="mt-3 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/50">{badge}</div> : null}
        </div>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black transition ${
            selected ? 'border-sky-300 bg-sky-300 text-black' : 'border-white/12 bg-black/15 text-white/35'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  )
}

export function CountPill({ children, active = false }) {
  return (
    <div className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-sky-400 text-black' : 'bg-white/6 text-white/55'}`}>
      {children}
    </div>
  )
}

export function SettingsRow({ icon: Icon, title, description, action, tone = 'default' }) {
  const toneClass = tone === 'danger' ? 'border-rose-500/20 bg-rose-500/8' : 'border-white/10 bg-white/[0.04]'
  return (
    <div className={`flex items-start justify-between gap-4 rounded-[1.4rem] border px-4 py-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/80">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div>
          <div className="text-sm font-bold text-white">{title}</div>
          {description ? <div className="mt-1 text-sm leading-6 text-white/58">{description}</div> : null}
        </div>
      </div>
      {action || null}
    </div>
  )
}

export function MetricStrip({ items = [] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.24em] text-white/42">{item.label}</div>
              {Icon ? <Icon className="h-4 w-4 text-white/55" /> : null}
            </div>
            <div className="mt-3 text-2xl font-black text-white">{item.value}</div>
            {item.hint ? <div className="mt-2 text-sm leading-6 text-white/55">{item.hint}</div> : null}
          </div>
        )
      })}
    </div>
  )
}
