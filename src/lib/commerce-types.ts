export type ProductType = 'digital' | 'physical' | 'bundle'
export type OrderStatus = 'pending' | 'paid' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ShippingStatus = 'pending' | 'processing' | 'shipped' | 'delivered'

export type { AffiliateStatus, PayoutStatus } from '@/modules/affiliate/types'

export interface ProductVariant {
  id: string
  size?: string
  color?: string
  stock: number
  sku?: string
  price_override?: number | null
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  type: ProductType
  price: number
  sale_price: number | null
  thumbnail: string
  gallery: string[]
  featured: boolean
  published: boolean
  stock: number | null
  digital_file_url: string | null
  category_id: string | null
  tags: string[]
  attributes: Record<string, unknown> | null
  variants: ProductVariant[] | null
  created_at: string
  updated_at: string
  display_order: number
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  created_at: string
}

export interface InventoryItem {
  id: string
  product_id: string
  variant_label: string
  color: string | null
  size: string | null
  stock: number
  sku: string | null
  created_at: string
  updated_at: string
}

export interface DownloadFile {
  id: string
  product_id: string
  label: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  download_limit: number | null
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_reference: string
  subtotal: number
  discount: number
  total: number
  currency: string
  affiliate_id: string | null
  discount_code: string | null
  shipping_address: Record<string, unknown> | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_country: string | null
  shipping_zip: string | null
  tracking_number: string | null
  shipping_carrier: string | null
  shipping_cost: number | null
  shipping_status: string | null
  delivery_notes: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_title: string
  product_type: ProductType
  quantity: number
  unit_price: number
  total_price: number
  download_token: string | null
  download_expires: string | null
  download_count: number
  download_limit: number | null
  created_at: string
}

export interface Customer {
  id: string
  email: string
  name: string
  phone: string | null
  total_orders: number
  total_spent: number
  created_at: string
}

export interface Download {
  id: string
  order_item_id: string
  ip_address: string
  user_agent: string
  created_at: string
}

export type { Affiliate, AffiliateClick, AffiliateCommission, AffiliatePayout } from '@/modules/affiliate/types'

export interface DiscountCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  max_uses: number | null
  use_count: number
  min_order_amount: number | null
  expires_at: string | null
  affiliate_id: string | null
  is_active: boolean
  created_at: string
}

export interface Transaction {
  id: string
  order_id: string
  reference: string
  gateway: 'paystack' | 'stripe'
  amount: number
  currency: string
  status: string
  gateway_response: Record<string, unknown>
  created_at: string
}

export interface StoreSettings {
  id: string
  digital_commission_rate: number
  physical_commission_rate: number
  currency: string
  payment_gateway: string
  paystack_secret_key: string | null
  paystack_public_key: string | null
  min_payout_amount: number
  auto_approve_payouts: boolean
  payout_schedule: string
  created_at: string
  updated_at: string
}

export type { AffiliateApplication } from '@/modules/affiliate/types'

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  country: string
  zip: string
}

export type { PartnerNotification, PartnerAchievement, MarketingAsset } from '@/modules/affiliate/types'

export interface AnalyticsDay {
  day: string
  order_count: number
  revenue: number
  customer_count: number
}
