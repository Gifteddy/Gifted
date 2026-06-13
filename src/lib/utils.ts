export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(date))
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

export function uploadToCloudinary(accept = 'image/*'): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { reject(new Error('No file selected')); return }
      try {
        const url = await uploadFileToCloudinary(file)
        resolve(url)
      } catch (e) { reject(e) }
    }
    input.click()
  })
}

function getCloudinaryUploadUrl(mimeType: string): string {
  if (mimeType.startsWith('image/')) return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  if (mimeType.startsWith('video/')) return `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
  return `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
}

export async function uploadFileToCloudinary(
  file: File,
  folder?: string,
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  if (folder) formData.append('folder', folder)

  const res = await fetch(getCloudinaryUploadUrl(file.type), {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed')
  return data.secure_url as string
}
