import { supabase } from './supabase'

const DOWNLOADS_BUCKET = 'downloads'

export interface SignedUrlResult {
  url: string
  error: string | null
}

export async function ensureBucket(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find(b => b.name === DOWNLOADS_BUCKET)) {
    await supabase.storage.createBucket(DOWNLOADS_BUCKET, {
      public: false,
      fileSizeLimit: 500 * 1024 * 1024,
    })
  }
}

export async function uploadDigitalFile(
  filePath: string,
  file: File
): Promise<string> {
  await ensureBucket()
  const { data, error } = await supabase.storage
    .from(DOWNLOADS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })
  if (error) throw error
  return data.path
}

export async function deleteDigitalFile(
  filePath: string
): Promise<void> {
  await supabase.storage
    .from(DOWNLOADS_BUCKET)
    .remove([filePath])
}

export async function getSignedDownloadUrl(
  filePath: string,
  expiresIn: number = 60 * 60
): Promise<SignedUrlResult> {
  const { data, error } = await supabase.storage
    .from(DOWNLOADS_BUCKET)
    .createSignedUrl(filePath, expiresIn)

  if (error || !data) {
    return { url: '', error: error?.message || 'Failed to create signed URL' }
  }
  return { url: data.signedUrl, error: null }
}

export async function validateDownloadToken(
  orderItemId: string,
  token: string
): Promise<{ valid: boolean; filePath?: string; error?: string }> {
  const { data: item, error } = await supabase
    .from('order_items')
    .select('download_token, download_expires, download_count, download_limit, product_id')
    .eq('id', orderItemId)
    .single()

  if (error || !item) return { valid: false, error: 'Order item not found' }
  if (item.download_token !== token) return { valid: false, error: 'Invalid download token' }
  if (item.download_expires && new Date(item.download_expires) < new Date()) return { valid: false, error: 'Download link expired' }
  if (item.download_limit !== null && item.download_count >= item.download_limit) return { valid: false, error: 'Download limit reached' }

  const { data: files } = await supabase
    .from('download_files')
    .select('file_path, label')
    .eq('product_id', item.product_id)

  return { valid: true, filePath: files?.[0]?.file_path }
}

export async function incrementDownloadCount(
  orderItemId: string
): Promise<void> {
  const { data: item } = await supabase
    .from('order_items')
    .select('download_count')
    .eq('id', orderItemId)
    .single()

  if (item) {
    await supabase
      .from('order_items')
      .update({ download_count: (item.download_count as number || 0) + 1 })
      .eq('id', orderItemId)
  }
}
