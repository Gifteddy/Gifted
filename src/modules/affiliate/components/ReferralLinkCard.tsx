import { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlass } from '@/components/ui/LiquidGlass'

interface ReferralLinkCardProps {
  referralLink: string
}

export function ReferralLinkCard({ referralLink }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [customLink, setCustomLink] = useState('')

  const generateUtmLink = () => {
    const url = new URL(referralLink)
    if (utmSource) url.searchParams.set('utm_source', utmSource)
    if (utmMedium) url.searchParams.set('utm_medium', utmMedium)
    if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign)
    return url.toString()
  }

  const generateCustomLink = () => {
    if (!customAlias.trim()) return
    setCustomLink(`${import.meta.env.VITE_SITE_URL || window.location.origin}/r/${customAlias.trim()}`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-brand-500 mb-2">Partner Link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white/50 dark:bg-white/[0.06] px-4 py-3 rounded-xl text-brand-500 font-mono border border-brand-500/10 truncate">{referralLink}</code>
              <button onClick={() => copyToClipboard(referralLink)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all active:scale-90">
                {copied ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
            <button onClick={() => { if (navigator.share) navigator.share({ title: 'Gifted Store', url: referralLink }) }}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
              Share
            </button>
            <button onClick={() => setShowQR(!showQR)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              QR Code
            </button>
          </div>

          {showQR && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex justify-center pt-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}`} alt="QR Code" className="h-36 w-36" />
              </div>
            </motion.div>
          )}
        </div>
      </LiquidGlass>

      <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
        <h3 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">UTM Link Builder</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Source</label>
            <input value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="e.g. instagram"
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Medium</label>
            <input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="e.g. social"
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-text-muted-light dark:text-text-muted-dark">Campaign</label>
            <input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="e.g. summer_promo"
              className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
        </div>
        {(utmSource || utmMedium || utmCampaign) && (
          <div className="mt-4">
            <p className="text-[10px] font-medium text-text-muted-light dark:text-text-muted-dark mb-1.5">Generated Link</p>
            <code className="block text-[11px] bg-white/50 dark:bg-white/[0.06] px-3 py-2 rounded-xl text-brand-500 font-mono border border-brand-500/10 break-all">{generateUtmLink()}</code>
            <button onClick={() => copyToClipboard(generateUtmLink())}
              className="mt-2 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium text-brand-500 hover:bg-brand-500/10 transition-all">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy UTM Link
            </button>
          </div>
        )}
      </LiquidGlass>

      <LiquidGlass intensity="subtle" className="rounded-2xl p-6 sm:p-8">
        <h3 className="font-display text-sm font-semibold mb-4 text-gray-900 dark:text-white/90">Custom Short Link</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted-light dark:text-text-muted-dark whitespace-nowrap">{import.meta.env.VITE_SITE_URL || window.location.origin}/r/</span>
          <input value={customAlias} onChange={e => setCustomAlias(e.target.value)} placeholder="your-name"
            className="flex-1 min-w-0 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-3 py-3 text-xs outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          <button onClick={generateCustomLink} disabled={!customAlias.trim()}
            className="rounded-xl bg-brand-500 px-4 py-3 text-xs font-semibold text-white hover:bg-brand-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
            Generate
          </button>
        </div>
        {customLink && (
          <div className="mt-3">
            <code className="block text-[11px] bg-white/50 dark:bg-white/[0.06] px-3 py-2 rounded-xl text-brand-500 font-mono border border-brand-500/10">{customLink}</code>
          </div>
        )}
      </LiquidGlass>
    </div>
  )
}
