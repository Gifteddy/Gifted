import { supabase } from './supabase'
import type {
  Product, ProductCategory, Order, OrderItem, Customer,
  Download, DiscountCode, StoreSettings,
  InventoryItem, DownloadFile, AnalyticsDay, ShippingAddress,
} from './commerce-types'


export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug, type, price, sale_price, thumbnail, featured, short_description, category_id, category:product_categories(name)')
    .eq('published', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data as unknown as Product[]
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw error
  return data as Product
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, slug, type, price, sale_price, thumbnail, featured, short_description, category_id, category:product_categories(name)')
    .eq('published', true)
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(8)
  if (error) throw error
  return data as unknown as Product[]
}

export async function getProductsByType(type: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .eq('type', type)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data as Product[]
}

export async function getProductCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data as ProductCategory[]
}

export async function createProductCategory(category: { name: string; slug: string; description?: string }) {
  const { data, error } = await supabase
    .from('product_categories')
    .insert([{ name: category.name, slug: category.slug, description: category.description || '' }])
    .select()
    .single()
  if (error) throw error
  return data as ProductCategory
}

export async function updateProductCategory(id: string, updates: { name?: string; slug?: string; description?: string }) {
  const { data, error } = await supabase
    .from('product_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ProductCategory
}

export async function deleteProductCategory(id: string) {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function reorderProducts(ids: string[]) {
  const updates = ids.map((id, index) => ({
    id,
    display_order: index,
  }))
  const { error } = await supabase
    .from('products')
    .upsert(updates)
  if (error) throw error
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as (Order & { items: OrderItem[] })[]
}

export async function getOrder(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Order & { items: OrderItem[] }
}

export async function updateOrderStatus(id: string, status: string, payment_status?: string) {
  const updates: Record<string, string> = { status }
  if (payment_status) updates.payment_status = payment_status
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw error
  return data as Customer[]
}

export async function getCustomerByEmail(email: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data as Customer | null
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single()
  if (error) throw error
  return data as Order
}

export async function createOrderItem(item: Omit<OrderItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('order_items')
    .insert([item])
    .select()
    .single()
  if (error) throw error
  return data as OrderItem
}

export async function getDownloadsForOrderItem(orderItemId: string) {
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('order_item_id', orderItemId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Download[]
}

export async function logDownload(orderItemId: string, ipAddress: string, userAgent: string) {
  const { data, error } = await supabase
    .from('downloads')
    .insert([{ order_item_id: orderItemId, ip_address: ipAddress, user_agent: userAgent }])
    .select()
    .single()
  if (error) throw error
  return data as Download
}

export async function getDiscountCodes() {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as DiscountCode[]
}

export async function validateDiscountCode(code: string) {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null
  const discount = data as DiscountCode
  if (discount.max_uses !== null && discount.use_count >= discount.max_uses) return null
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) return null
  return discount
}

export async function getStoreSettings() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .single()
  if (error) throw error
  return data as StoreSettings
}

export async function updateStoreSettings(id: string, updates: Partial<StoreSettings>) {
  const { data, error } = await supabase
    .from('store_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as StoreSettings
}

// ---- INVENTORY ----

export async function getInventoryForProduct(productId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .order('variant_label')
  if (error) throw error
  return data as InventoryItem[]
}

export async function getAllInventory() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(title, slug, type, published)')
    .order('product_id')
    .limit(500)
  if (error) throw error
  return data as (InventoryItem & { product: Pick<Product, 'title' | 'slug' | 'type' | 'published'> })[]
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('inventory')
    .insert([item])
    .select()
    .single()
  if (error) throw error
  return data as InventoryItem
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as InventoryItem
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function checkStock(productId: string, variantLabel?: string): Promise<boolean> {
  if (variantLabel) {
    const { data } = await supabase
      .from('inventory')
      .select('stock')
      .eq('product_id', productId)
      .eq('variant_label', variantLabel)
      .single()
    return data ? (data.stock as number) > 0 : false
  }
  const { data: product } = await supabase
    .from('products')
    .select('type, stock')
    .eq('id', productId)
    .single()
  if (!product) return false
  if (product.type === 'digital') return true
  if (product.stock !== null) return product.stock > 0
  const { data: variants } = await supabase
    .from('inventory')
    .select('stock')
    .eq('product_id', productId)
  if (!variants || variants.length === 0) return false
  return variants.some((v: any) => v.stock > 0)
}

// ---- DOWNLOAD FILES ----

export async function getDownloadFiles(productId: string) {
  const { data, error } = await supabase
    .from('download_files')
    .select('*')
    .eq('product_id', productId)
    .order('label')
  if (error) throw error
  return data as DownloadFile[]
}

export async function createDownloadFile(file: Omit<DownloadFile, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('download_files')
    .insert([file])
    .select()
    .single()
  if (error) throw error
  return data as DownloadFile
}

export async function deleteDownloadFile(id: string) {
  const { error } = await supabase
    .from('download_files')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- ANALYTICS ----

export async function getAnalytics(days: number = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data: orders, error: ordErr } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  if (ordErr) throw ordErr

  const { data: dailyData, error: ddErr } = await supabase
    .from('analytics_daily')
    .select('*')
    .gte('day', since)
    .order('day', { ascending: false })
  if (ddErr) throw ddErr

  const o = (orders || []) as Order[]
  const totalRevenue = o.reduce((s, x) => s + (x.status !== 'cancelled' && x.status !== 'refunded' ? x.total : 0), 0)
  const totalOrders = o.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const { data: topProducts } = await supabase
    .from('order_items')
    .select('product_title, product_type, quantity, total_price')
    .in('order_id', o.map(x => x.id))
  const productSales: Record<string, { qty: number; rev: number }> = {}
  for (const item of (topProducts || []) as any[]) {
    if (!productSales[item.product_title]) productSales[item.product_title] = { qty: 0, rev: 0 }
    productSales[item.product_title].qty += item.quantity
    productSales[item.product_title].rev += item.total_price
  }
  const topSelling = Object.entries(productSales)
    .map(([title, data]) => ({ title, ...data }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 10)

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    daily: (dailyData || []) as AnalyticsDay[],
    topSelling,
  }
}

// ---- SHIPPING ----

export async function updateOrderShipping(id: string, updates: {
  tracking_number?: string
  shipping_carrier?: string
  shipping_cost?: number
  shipping_status?: string
  delivery_notes?: string
  status?: string
}) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

export async function getOrdersByStatus(status: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), customer:customers(*)')
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as (Order & { items: OrderItem[]; customer: Customer })[]
}

// ---- CUSTOMERS ----

export async function getCustomerOrders(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as (Order & { items: OrderItem[] })[]
}

// ---- ORDER FULFILLMENT ----

export async function upsertCustomer(email: string, name: string, phone?: string) {
  const existing = await getCustomerByEmail(email)
  if (existing) return existing
  const { data, error } = await supabase
    .from('customers')
    .insert([{ email, name, phone: phone || null }])
    .select()
    .single()
  if (error) throw error
  return data as Customer
}

export async function createFullOrder(order: {
  customer_id: string
  subtotal: number
  discount: number
  total: number
  currency: string
  discount_code: string | null
  shipping_address?: ShippingAddress | null
  items: { product_id: string; product_title: string; product_type: string; quantity: number; unit_price: number; total_price: number }[]
  payment_reference: string
}) {
  const shipAddr = order.shipping_address
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{
      customer_id: order.customer_id,
      status: 'pending',
      payment_status: 'paid',
      payment_reference: order.payment_reference,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      currency: order.currency,
      discount_code: order.discount_code,
      shipping_address: shipAddr ? JSON.parse(JSON.stringify(shipAddr)) : null,
      shipping_city: shipAddr?.city || null,
      shipping_state: shipAddr?.state || null,
      shipping_country: shipAddr?.country || null,
      shipping_zip: shipAddr?.zip || null,
    }])
    .select()
    .single()
  if (orderError) throw orderError
  const newOrder = orderData as Order

  const orderItems = []
  for (const item of order.items) {
    let dlLimit: number | null = null
    if (item.product_type === 'digital') {
      const { data: files } = await supabase
        .from('download_files')
        .select('download_limit')
        .eq('product_id', item.product_id)
        .limit(1)
      if (files && files.length > 0) dlLimit = (files[0] as any).download_limit || null
    }
    const { data: itemData, error: itemError } = await supabase
      .from('order_items')
      .insert([{
        order_id: newOrder.id,
        product_id: item.product_id,
        product_title: item.product_title,
        product_type: item.product_type,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        download_token: item.product_type === 'digital' ? crypto.randomUUID() : null,
        download_expires: item.product_type === 'digital'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        download_limit: dlLimit,
      }])
      .select()
      .single()
    if (itemError) throw itemError
    orderItems.push(itemData as OrderItem)
  }

  return { order: newOrder, items: orderItems }
}

export async function getOrderWithItems(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Order & { items: OrderItem[] }
}

export async function getOrdersByEmail(email: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('customer_id', (await getCustomerByEmail(email))?.id || '')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as unknown as (Order & { items: OrderItem[] })[]
}

export async function incrementDiscountUses(code: string) {
  const { data: dc } = await supabase
    .from('discount_codes')
    .select('use_count')
    .eq('code', code)
    .single()
  if (dc) {
    const { error } = await supabase
      .from('discount_codes')
      .update({ use_count: (dc.use_count as number || 0) + 1 })
      .eq('code', code)
    if (error) throw error
  }
}
