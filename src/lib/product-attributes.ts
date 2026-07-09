export type AttributeType = 'select' | 'multi_select' | 'text' | 'url' | 'boolean'

export interface AttributeDef {
  key: string
  label: string
  type: AttributeType
  options?: string[]
  required?: boolean
  placeholder?: string
}

export interface VariantConfig {
  sizes?: string[]
  colors?: string[]
  trackStock: boolean
  hasSku?: boolean
  hasPriceOverride?: boolean
}

export interface CategoryConfig {
  slug: string
  name: string
  type: 'digital' | 'physical' | 'bundle'
  attributes: AttributeDef[]
  hasVariants?: boolean
  variantConfig?: VariantConfig
  requiresShipping?: boolean
  hasWeight?: boolean
}

export const internalKeys = new Set(['shipping_required', 'weight', 'download_type'])

const physicalAttrs: AttributeDef[] = [
  { key: 'shipping_required', label: 'Shipping Required', type: 'boolean', required: true },
  { key: 'weight', label: 'Weight (kg)', type: 'text', required: false, placeholder: '0.5' },
]

const digitalDownloadAttr: AttributeDef = { key: 'download_type', label: 'Download Type', type: 'select', options: ['Digital Download'], required: true }

export const categoryConfigs: Record<string, CategoryConfig> = {
  // ── Physical ──
  't-shirts': {
    slug: 't-shirts', name: 'T-Shirts', type: 'physical',
    attributes: [...physicalAttrs],
    hasVariants: true,
    variantConfig: {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      colors: ['Black', 'White', 'Purple', 'Gold', 'Custom'],
      trackStock: true, hasSku: true, hasPriceOverride: true,
    },
    requiresShipping: true, hasWeight: true,
  },
  hoodies: {
    slug: 'hoodies', name: 'Hoodies', type: 'physical',
    attributes: [...physicalAttrs],
    hasVariants: true,
    variantConfig: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Purple', 'Gold'],
      trackStock: true, hasSku: true,
    },
    requiresShipping: true,
  },
  caps: {
    slug: 'caps', name: 'Caps', type: 'physical',
    attributes: [...physicalAttrs],
    hasVariants: true,
    variantConfig: {
      colors: ['Black', 'White', 'Purple', 'Gold'],
      trackStock: true, hasSku: true,
    },
    requiresShipping: true,
  },
  stickers: {
    slug: 'stickers', name: 'Stickers', type: 'physical',
    attributes: [
      { key: 'dimension', label: 'Dimension', type: 'select', options: ['Small', 'Medium', 'Large'], required: true },
      { key: 'material', label: 'Material', type: 'select', options: ['Matte', 'Glossy', 'Holographic'], required: true },
      ...physicalAttrs,
    ],
    hasVariants: false,
    requiresShipping: true,
  },
  posters: {
    slug: 'posters', name: 'Posters', type: 'physical',
    attributes: [
      { key: 'size', label: 'Size', type: 'select', options: ['A4', 'A3', 'A2', 'A1'], required: true },
      { key: 'orientation', label: 'Orientation', type: 'select', options: ['Portrait', 'Landscape'], required: true },
      ...physicalAttrs,
    ],
    hasVariants: false,
    requiresShipping: true,
  },

  // ── Digital ──
  'lightroom-presets': {
    slug: 'lightroom-presets', name: 'Lightroom Presets', type: 'digital',
    attributes: [
      { key: 'compatible_software', label: 'Compatible Software', type: 'multi_select', options: ['Lightroom Mobile', 'Lightroom Classic', 'Lightroom CC'], required: true },
      { key: 'file_format', label: 'File Format', type: 'select', options: ['DNG', 'XMP', 'ZIP'], required: true },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'lut-packs': {
    slug: 'lut-packs', name: 'LUT Packs', type: 'digital',
    attributes: [
      { key: 'compatible_software', label: 'Compatible Software', type: 'multi_select', options: ['Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'CapCut', 'After Effects'], required: true },
      { key: 'file_format', label: 'File Format', type: 'select', options: ['CUBE', 'ZIP'], required: true },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'photoshop-assets': {
    slug: 'photoshop-assets', name: 'Photoshop Assets', type: 'digital',
    attributes: [
      { key: 'compatible_versions', label: 'Compatible Versions', type: 'text', required: false, placeholder: 'e.g. CC 2020+' },
      { key: 'file_type', label: 'File Type', type: 'multi_select', options: ['PSD', 'ABR', 'PAT', 'ZIP'], required: true },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'design-templates': {
    slug: 'design-templates', name: 'Design Templates', type: 'digital',
    attributes: [
      { key: 'software', label: 'Software', type: 'multi_select', options: ['Photoshop', 'Illustrator', 'Canva', 'Figma'], required: true },
      { key: 'file_format', label: 'File Format', type: 'select', options: ['ZIP'], required: true },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'social-media-templates': {
    slug: 'social-media-templates', name: 'Social Media Templates', type: 'digital',
    attributes: [
      { key: 'platform', label: 'Platform', type: 'multi_select', options: ['Instagram', 'TikTok', 'YouTube', 'Facebook'], required: true },
      { key: 'canva_compatible', label: 'Canva Compatible', type: 'boolean', required: true },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'react-templates': {
    slug: 'react-templates', name: 'React Templates', type: 'digital',
    attributes: [
      { key: 'framework', label: 'Framework', type: 'select', options: ['React', 'Next.js', 'Vite'], required: true },
      { key: 'version', label: 'Version', type: 'text', required: false, placeholder: 'e.g. 18.x' },
      { key: 'documentation_url', label: 'Documentation Link', type: 'url', required: false, placeholder: 'https://' },
      { key: 'demo_url', label: 'Demo Link', type: 'url', required: false, placeholder: 'https://' },
      { key: 'github_url', label: 'GitHub Preview', type: 'url', required: false, placeholder: 'https://' },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'portfolio-templates': {
    slug: 'portfolio-templates', name: 'Portfolio Templates', type: 'digital',
    attributes: [
      { key: 'framework', label: 'Framework', type: 'select', options: ['React', 'Next.js', 'HTML', 'Tailwind'], required: true },
      { key: 'demo_url', label: 'Demo URL', type: 'url', required: false, placeholder: 'https://' },
      { key: 'documentation_url', label: 'Documentation URL', type: 'url', required: false, placeholder: 'https://' },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'motion-graphics': {
    slug: 'motion-graphics', name: 'Motion Graphics', type: 'digital',
    attributes: [
      { key: 'compatible_software', label: 'Compatible Software', type: 'multi_select', options: ['After Effects', 'Premiere Pro', 'DaVinci Resolve', 'CapCut'], required: true },
      { key: 'resolution', label: 'Resolution', type: 'select', options: ['1080p', '1440p', '4K'], required: true },
      { key: 'file_format', label: 'File Format', type: 'select', options: ['ZIP'], required: true },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
  'creative-resources': {
    slug: 'creative-resources', name: 'Creative Resources', type: 'digital',
    attributes: [
      { key: 'resource_type', label: 'Resource Type', type: 'select', options: ['Bundle', 'Asset Pack', 'Toolkit', 'Resource Collection'], required: true },
      { key: 'file_format', label: 'File Format', type: 'multi_select', options: ['ZIP', 'PDF'], required: true },
      digitalDownloadAttr,
    ],
    hasVariants: false,
    requiresShipping: false,
  },
}

export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return categoryConfigs[slug]
}

export function getCategoryName(slug: string): string {
  return categoryConfigs[slug]?.name ?? slug
}
