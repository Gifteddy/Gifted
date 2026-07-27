import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Meta } from '@/lib/meta'
import { usePartnerStore } from '@/store/partner'
import { getPartnerAchievements } from '@/modules/partner/queries'
import { ACHIEVEMENTS } from '@/modules/partner/constants'
import type { PartnerAchievement } from '@/modules/partner/types'

const categories = [
  { key: 'all', label: 'All', icon: '🏆' },
  { key: 'sales', label: 'Sales', icon: '💰' },
  { key: 'revenue', label: 'Revenue', icon: '📈' },
  { key: 'clicks', label: 'Clicks', icon: '🖱️' },
  { key: 'tiers', label: 'Tiers', icon: '⬆️' },
] as const

const categoryMap: Record<string, string> = {
  first_sale: 'sales',
  ten_sales: 'sales',
  fifty_sales: 'sales',
  hundred_sales: 'sales',
  revenue_100k: 'revenue',
  revenue_500k: 'revenue',
  revenue_1m: 'revenue',
  hundred_clicks: 'clicks',
  thousand_clicks: 'clicks',
  five_thousand_clicks: 'clicks',
  level_silver: 'tiers',
  level_gold: 'tiers',
  level_platinum: 'tiers',
  level_diamond: 'tiers',
  first_payout: 'revenue',
}

export default function PartnerAchievements() {
  const partner = usePartnerStore((s) => s.partner)
  const loading = usePartnerStore((s) => s.loading)

  const [unlocked, setUnlocked] = useState<PartnerAchievement[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    async function load() {
      if (!partner) return
      setFetching(true)
      try {
        const data = await getPartnerAchievements(partner.id)
        setUnlocked(data)
      } catch { /* silent */ }
      setFetching(false)
    }
    load()
  }, [partner])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-4xl">🏆</div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Partner Account Required</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-white/50">Join the partner programme to track your achievements.</p>
      </div>
    )
  }

  const totalAchievements = ACHIEVEMENTS.length
  const totalUnlocked = unlocked.length

  const allCards = ACHIEVEMENTS.map((def) => {
    const found = unlocked.find((u) => u.achievement_key === def.key)
    return {
      key: def.key,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked: !!found,
      unlockedAt: found?.unlocked_at,
      category: categoryMap[def.key] || 'other',
    }
  })

  const filtered = activeCategory === 'all'
    ? allCards
    : allCards.filter((c) => c.category === activeCategory)

  const filteredUnlocked = filtered.filter((c) => c.unlocked).length

  return (
    <>
      <Meta title="Achievements" description="Track your partner achievements" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Achievements</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Unlock badges as you grow your partner journey</p>
        </div>

        <div className="mb-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">Progress</p>
              <p className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white/90">
                {totalUnlocked} <span className="text-base font-normal text-gray-400 dark:text-white/30">of {totalAchievements}</span>
              </p>
            </div>
            <div className="text-4xl">
              {totalUnlocked === totalAchievements ? '🏆' : totalUnlocked > 0 ? '⭐' : '🎯'}
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all',
                activeCategory === cat.key
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
              )}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-500 dark:text-white/40">
              {filteredUnlocked} of {filtered.length} unlocked in this category
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((card) => (
                <div
                  key={card.key}
                  className={cn(
                    'rounded-2xl border p-5 transition-all',
                    card.unlocked
                      ? 'border-brand-200 dark:border-brand-500/20 bg-white/50 dark:bg-brand-500/5'
                      : 'border-black/[0.06] dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.01] opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl',
                      card.unlocked
                        ? 'bg-brand-50/80 dark:bg-brand-500/10'
                        : 'bg-gray-100 dark:bg-white/[0.03]'
                    )}>
                      {card.unlocked ? card.icon : '🔒'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={cn(
                        'text-sm font-semibold',
                        card.unlocked
                          ? 'text-gray-900 dark:text-white/90'
                          : 'text-gray-500 dark:text-white/40'
                      )}>
                        {card.title}
                      </h3>
                      <p className={cn(
                        'mt-0.5 text-xs',
                        card.unlocked
                          ? 'text-gray-500 dark:text-white/40'
                          : 'text-gray-400 dark:text-white/25'
                      )}>
                        {card.unlocked ? card.description : 'Keep going!'}
                      </p>
                      {card.unlocked && card.unlockedAt && (
                        <p className="mt-2 text-[10px] font-medium text-brand-500">
                          Unlocked {new Date(card.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
