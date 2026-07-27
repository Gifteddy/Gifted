import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'
import { Meta } from '@/lib/meta'
import { supabase } from '@/lib/supabase'
import { usePartnerStore } from '@/store/partner'
import { buildReferralUrl, createCampaign } from '@/modules/partner/queries'
import type { Product } from '@/lib/commerce-types'

const inputClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30'

const selectClass =
  'w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 dark:focus:border-brand-400/50 dark:focus:ring-brand-400/10 transition-all text-gray-900 dark:text-white/90 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27%2F%3E%3C%2Fsvg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat'

const btnPrimary =
  'rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-brand-500/40 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed'

interface GeneratedLink {
  id: string
  label: string
  url: string
  createdAt: string
}

export default function PartnerReferrals() {
  const partner = usePartnerStore((s) => s.partner)
  const loading = usePartnerStore((s) => s.loading)

  const [products, setProducts] = useState<Product[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([])

  const [selectedProduct, setSelectedProduct] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [campaignMedium, setCampaignMedium] = useState('')
  const [campaignSource, setCampaignSource] = useState('')

  const [utmUrl, setUtmUrl] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmTerm, setUtmTerm] = useState('')
  const [utmContent, setUtmContent] = useState('')

  const referralCode = partner?.referral_code || ''
  const primaryLink = partner ? buildReferralUrl(referralCode) : ''

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('id, title, slug, type, price, thumbnail')
        .eq('published', true)
        .order('title')
      if (data) setProducts(data as Product[])
    }
    fetchProducts()
  }, [])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const shareOn = (platform: string) => {
    const text = encodeURIComponent(`Check out Gifted Store! Use my referral link: ${primaryLink}`)
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(primaryLink)}`,
      whatsapp: `https://wa.me/?text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(primaryLink)}`,
    }
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  const handleGenerateProductLink = () => {
    if (!selectedProduct || !partner) return
    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return
    const url = buildReferralUrl(referralCode, product.slug)
    setGeneratedLinks((prev) => [
      { id: Date.now().toString(), label: `Product: ${product.title}`, url, createdAt: new Date().toISOString() },
      ...prev,
    ])
    setSelectedProduct('')
  }

  const handleGenerateCampaignLink = async () => {
    if (!partner || !campaignName.trim()) return
    try {
      await createCampaign(partner.id, {
        name: campaignName,
        medium: campaignMedium || undefined,
        source: campaignSource || undefined,
      })
    } catch { /* silent */ }

    const url = buildReferralUrl(referralCode, undefined, campaignName)
    setGeneratedLinks((prev) => [
      { id: Date.now().toString(), label: `Campaign: ${campaignName}`, url, createdAt: new Date().toISOString() },
      ...prev,
    ])
    setCampaignName('')
    setCampaignMedium('')
    setCampaignSource('')
  }

  const handleGenerateUtm = () => {
    if (!utmUrl.trim()) return
    const base = utmUrl.startsWith('http') ? utmUrl : `https://${utmUrl}`
    const params = new URLSearchParams()
    if (utmSource) params.set('utm_source', utmSource)
    if (utmMedium) params.set('utm_medium', utmMedium)
    if (utmCampaign) params.set('utm_campaign', utmCampaign)
    if (utmTerm) params.set('utm_term', utmTerm)
    if (utmContent) params.set('utm_content', utmContent)
    params.set('ref', referralCode)
    const full = `${base}?${params.toString()}`
    setGeneratedLinks((prev) => [
      { id: Date.now().toString(), label: `UTM: ${utmCampaign || utmSource || 'link'}`, url: full, createdAt: new Date().toISOString() },
      ...prev,
    ])
    setUtmUrl('')
    setUtmSource('')
    setUtmMedium('')
    setUtmCampaign('')
    setUtmTerm('')
    setUtmContent('')
  }

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
        <div className="text-4xl">🔗</div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white/90">Partner Account Required</h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-white/50">You need a partner account to access the Referral Centre.</p>
        <Link to="/shop/partners" className={btnPrimary}>Become a Partner</Link>
      </div>
    )
  }

  return (
    <>
      <Meta title="Referral Centre" description="Generate and manage your referral links" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white/90 sm:text-3xl">Referral Centre</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">Create, manage, and share your referral links</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Your Primary Referral Link</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] px-4 py-3">
                <p className="truncate font-mono text-sm text-gray-700 dark:text-white/70">{primaryLink}</p>
              </div>
              <button
                onClick={() => copyToClipboard(primaryLink, 'primary')}
                className={cn(
                  'shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  copiedId === 'primary'
                    ? 'bg-green-500 text-white'
                    : 'bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.97]'
                )}
              >
                {copiedId === 'primary' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Share on Social</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'twitter', label: 'Twitter / X', color: 'bg-sky-500 hover:bg-sky-600' },
                { key: 'facebook', label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
                { key: 'whatsapp', label: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600' },
                { key: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => shareOn(s.key)}
                  className={cn('rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.97]', s.color)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">QR Code</h2>
            <div className="flex items-center gap-6">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-brand-300 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5">
                <div className="text-center">
                  <div className="text-3xl">📱</div>
                  <p className="mt-1 text-[10px] text-gray-400 dark:text-white/30">QR Code</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-white/50">Scan to visit your referral link</p>
                <p className="mt-1 max-w-xs break-all font-mono text-xs text-gray-400 dark:text-white/30">{primaryLink}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Generate Product Link</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={cn(selectClass, 'flex-1')}
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({formatCurrency(p.price)})
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerateProductLink}
                disabled={!selectedProduct}
                className={btnPrimary}
              >
                Generate
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Generate Campaign Link</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Campaign name (e.g. summer-sale)"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className={inputClass}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Medium (e.g. instagram, email)"
                  value={campaignMedium}
                  onChange={(e) => setCampaignMedium(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Source (e.g. blog, newsletter)"
                  value={campaignSource}
                  onChange={(e) => setCampaignSource(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleGenerateCampaignLink}
                disabled={!campaignName.trim()}
                className={btnPrimary}
              >
                Create Campaign Link
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">UTM Builder</h2>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="Destination URL"
                value={utmUrl}
                onChange={(e) => setUtmUrl(e.target.value)}
                className={inputClass}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Source"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Medium"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Campaign"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Term (optional)"
                  value={utmTerm}
                  onChange={(e) => setUtmTerm(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Content (optional)"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleGenerateUtm}
                disabled={!utmUrl.trim()}
                className={btnPrimary}
              >
                Build UTM Link
              </button>
            </div>
          </div>

          {generatedLinks.length > 0 && (
            <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">Generated Links</h2>
              <div className="space-y-3">
                {generatedLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <div className="flex-1 overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] px-4 py-2.5">
                      <p className="text-[11px] font-medium text-gray-500 dark:text-white/40">{link.label}</p>
                      <p className="truncate font-mono text-xs text-gray-600 dark:text-white/60">{link.url}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className={cn(
                        'shrink-0 rounded-xl px-3 py-2.5 text-xs font-medium transition-all',
                        copiedId === link.id
                          ? 'bg-green-500 text-white'
                          : 'border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
                      )}
                    >
                      {copiedId === link.id ? '✓' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setGeneratedLinks((prev) => prev.filter((l) => l.id !== link.id))}
                      className="shrink-0 rounded-xl px-3 py-2.5 text-xs text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
