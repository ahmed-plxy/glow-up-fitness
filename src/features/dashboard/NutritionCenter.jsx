import React from 'react'
import { Search, Soup, UtensilsCrossed, Barcode, Apple, Flame, Droplets } from 'lucide-react'
import { Button, GlassCard, Input, SectionTitle, StatTile } from '../../components/ui'
import { RECIPES_LIBRARY } from '../../data/extendedLibrary'

export default function NutritionCenter({ targetCalories }) {
  const recipes = RECIPES_LIBRARY
  return (
    <GlassCard className="p-5 sm:p-6">
      <SectionTitle
        title="معمل التغذية والوجبات"
        description="تجربة كبيرة للغذاء: وصفات، هدف السعرات، وبحث بصري سريع داخل الطعام."
        icon={Soup}
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">البحث الذكي</div>
                <div className="mt-1 text-lg font-black text-white">اكتب أول حرفين فقط</div>
              </div>
              <Search className="h-5 w-5 text-sky-300" />
            </div>
            <Input className="mt-4" placeholder="ابحث عن أكلة أو باركود..." />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" leftIcon={Barcode} className="justify-start">مسح الباركود</Button>
              <Button variant="secondary" leftIcon={Apple} className="justify-start">اقتراحات اليوم</Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatTile label="هدفك اليومي" value={`${targetCalories}`} hint="سعرة يجب ضبطها" icon={Flame} accent="amber" />
            <StatTile label="الماء المقترح" value="2.5L" hint="حسب الوزن والنشاط" icon={Droplets} accent="blue" />
          </div>
        </div>

        <div className="grid gap-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-black text-white">{recipe.title}</div>
                  <div className="mt-1 text-sm text-white/55">
                    {recipe.calories} سعرة · {recipe.protein} بروتين · {recipe.carbs} كارب · {recipe.fat} دهون
                  </div>
                </div>
                <UtensilsCrossed className="h-5 w-5 text-[#ffd64d]" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recipe.steps.map((step) => (
                  <span key={step} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/65">
                    {step}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
